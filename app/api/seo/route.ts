import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const seoAnalyzeSchema = z.object({
  blogId: z.string(),
  content: z.string().optional(),
  title: z.string().optional(),
});

// POST /api/seo — 分析博客 SEO
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
    const parsed = seoAnalyzeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { blogId, content, title } = parsed.data;

    // 验证博客归属
    const blog = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog || blog.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: '博客不存在或无权操作' },
        { status: 404 }
      );
    }

    // 如果没有传入内容，从数据库获取
    const textToAnalyze = content || blog.content;
    const titleToAnalyze = title || blog.title;

    // 调用 AI 进行 SEO 分析
    const analysis = await analyzeSEO(titleToAnalyze, textToAnalyze);

    // 保存分析结果
    const saved = await prisma.seoAnalysis.create({
      data: {
        blogId,
        totalScore: analysis.totalScore,
        dimensions: analysis.dimensions as any,
        checklist: analysis.checklist as any,
        keywordData: analysis.keywordData as any,
      },
    });

    // 更新博客 SEO 评分
    await prisma.blog.update({
      where: { id: blogId },
      data: {
        seoScore: analysis.totalScore,
        seoMeta: {
          title: titleToAnalyze,
          description: textToAnalyze.substring(0, 160),
          keywords: analysis.keywordData?.secondaryKeywords || [],
        } as any,
      },
    });

    return NextResponse.json({
      success: true,
      data: analysis,
      savedId: saved.id,
    });
  } catch (error) {
    console.error('SEO 分析失败:', error);
    return NextResponse.json(
      { success: false, error: 'SEO 分析失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// GET /api/seo?blogId=xxx — 获取博客的 SEO 分析历史
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const blogId = searchParams.get('blogId');

    if (!blogId) {
      return NextResponse.json(
        { success: false, error: '缺少 blogId 参数' },
        { status: 400 }
      );
    }

    const analyses = await prisma.seoAnalysis.findMany({
      where: { blogId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: analyses,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取 SEO 分析历史失败' },
      { status: 500 }
    );
  }
}

// ---------- 内部 SEO 分析函数 ----------
async function analyzeSEO(title: string, content: string) {
  const API_KEY = process.env.OPENAI_API_KEY;
  const BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const MODEL = process.env.AI_MODEL || 'gpt-4o';

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `你是一位 SEO 分析专家。请对博客文章进行全面的 SEO 分析，输出 JSON 格式。`,
        },
        {
          role: 'user',
          content: `请分析以下博客文章的 SEO：\n标题：${title}\n内容：${content.substring(0, 3000)}`,
        },
      ],
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`SEO 分析 API 调用失败: ${response.status}`);
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0]?.message?.content || '{}');

  return {
    totalScore: result.totalScore || 0,
    dimensions: result.dimensions || [],
    checklist: result.checklist || [],
    keywordData: result.keywordData || null,
  };
}