import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateBlog } from '@/lib/ai';
import { countWords } from '@/lib/ai';
import { z } from 'zod';

const generateSchema = z.object({
  prompt: z.string().min(1, '请输入博客主题').max(500),
  topicType: z.string().optional(),
  language: z.string().optional(),
  style: z.string().optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = generateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { prompt, topicType, language, style, length } = parsed.data;

    // 创建博客草稿
    const blog = await prisma.blog.create({
      data: {
        userId: session.user.id,
        title: prompt,
        prompt,
        status: 'GENERATING',
        topicType: topicType || null,
      },
    });

    // 异步生成内容（实际项目中应使用队列）
    const startTime = Date.now();
    try {
      const result = await generateBlog(prompt, { topicType, language, style, length });
      const wordCount = countWords(result.content);

      // 更新博客
      const updated = await prisma.blog.update({
        where: { id: blog.id },
        data: {
          title: extractTitle(result.content) || prompt,
          content: result.content,
          outline: result.outline as any,
          status: 'COMPLETED',
          wordCount,
          seoScore: result.seoAnalysis.totalScore,
          seoMeta: {
            title: extractTitle(result.content) || prompt,
            description: result.content.substring(0, 160),
            keywords: result.seoAnalysis.keywordData?.secondaryKeywords || [],
          } as any,
        },
      });

      // 保存 SEO 分析
      await prisma.seoAnalysis.create({
        data: {
          blogId: blog.id,
          totalScore: result.seoAnalysis.totalScore,
          dimensions: result.seoAnalysis.dimensions as any,
          checklist: result.seoAnalysis.checklist as any,
          keywordData: result.seoAnalysis.keywordData as any,
        },
      });

      // 记录生成日志
      await prisma.generationLog.create({
        data: {
          userId: session.user.id,
          blogId: blog.id,
          step: 'FULL_GENERATION',
          modelUsed: process.env.AI_MODEL || 'gpt-4o',
          tokensUsed: wordCount,
          latencyMs: Date.now() - startTime,
          success: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: updated.id,
          title: updated.title,
          content: updated.content,
          outline: result.outline,
          seoAnalysis: result.seoAnalysis,
          wordCount: updated.wordCount,
          seoScore: updated.seoScore,
        },
      });
    } catch (aiError) {
      // AI 生成失败，更新状态
      await prisma.blog.update({
        where: { id: blog.id },
        data: { status: 'DRAFT' },
      });

      await prisma.generationLog.create({
        data: {
          userId: session.user.id,
          blogId: blog.id,
          step: 'FULL_GENERATION',
          modelUsed: process.env.AI_MODEL || 'gpt-4o',
          tokensUsed: 0,
          latencyMs: Date.now() - startTime,
          success: false,
          errorMessage: aiError instanceof Error ? aiError.message : '未知错误',
        },
      });

      throw aiError;
    }
  } catch (error) {
    console.error('生成失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '生成失败，请稍后重试',
      },
      { status: 500 }
    );
  }
}

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1] : '';
}