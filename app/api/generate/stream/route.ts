import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateStream } from '@/lib/ai';
import { countWords } from '@/lib/ai';
import { z } from 'zod';

const streamSchema = z.object({
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
      return new Response(
        JSON.stringify({ success: false, error: '请先登录' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const parsed = streamSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ success: false, error: parsed.error.errors[0].message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
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

    const startTime = Date.now();

    // SSE 流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: unknown) => {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        };

        try {
          let finalContent = '';
          let finalOutline = null;
          let finalSEO = null;

          for await (const event of generateStream(
            prompt,
            topicType,
            language,
            style,
            length
          )) {
            send(event.type, {
              ...event,
              blogId: blog.id,
            });

            if (event.type === 'content' && typeof event.data === 'string') {
              finalContent = event.data;
            }
            if (event.type === 'outline' && event.data && typeof event.data === 'object') {
              finalOutline = event.data;
            }
            if (event.type === 'seo' && event.data && typeof event.data === 'object') {
              finalSEO = event.data;
            }
            if (event.type === 'done' && event.data && typeof event.data === 'object') {
              const result = event.data as any;
              finalContent = result.content || finalContent;
              finalOutline = result.outline || finalOutline;
              finalSEO = result.seoAnalysis || finalSEO;
            }
          }

          // 保存结果到数据库
          const wordCount = countWords(finalContent);
          const title = extractTitle(finalContent) || prompt;

          await prisma.blog.update({
            where: { id: blog.id },
            data: {
              title,
              content: finalContent,
              outline: finalOutline as any,
              status: 'COMPLETED',
              wordCount,
              seoScore: finalSEO?.totalScore || null,
              seoMeta: {
                title,
                description: finalContent.substring(0, 160),
                keywords: finalSEO?.keywordData?.secondaryKeywords || [],
              } as any,
            },
          });

          // 保存 SEO 分析
          if (finalSEO) {
            await prisma.seoAnalysis.create({
              data: {
                blogId: blog.id,
                totalScore: finalSEO.totalScore,
                dimensions: finalSEO.dimensions as any,
                checklist: finalSEO.checklist as any,
                keywordData: finalSEO.keywordData as any,
              },
            });
          }

          // 记录日志
          await prisma.generationLog.create({
            data: {
              userId: session.user.id,
              blogId: blog.id,
              step: 'STREAM_GENERATION',
              modelUsed: process.env.AI_MODEL || 'gpt-4o',
              tokensUsed: wordCount,
              latencyMs: Date.now() - startTime,
              success: true,
            },
          });

          send('saved', { blogId: blog.id, wordCount, seoScore: finalSEO?.totalScore });
        } catch (error) {
          // 更新状态为草稿
          await prisma.blog.update({
            where: { id: blog.id },
            data: { status: 'DRAFT' },
          });

          await prisma.generationLog.create({
            data: {
              userId: session.user.id,
              blogId: blog.id,
              step: 'STREAM_GENERATION',
              modelUsed: process.env.AI_MODEL || 'gpt-4o',
              tokensUsed: 0,
              latencyMs: Date.now() - startTime,
              success: false,
              errorMessage: error instanceof Error ? error.message : '未知错误',
            },
          });

          send('error', {
            message: error instanceof Error ? error.message : '生成失败',
            blogId: blog.id,
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '服务器错误',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1] : '';
}