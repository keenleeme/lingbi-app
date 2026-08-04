import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// GET /api/blogs — 获取博客列表
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
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '12')));
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const where: any = { userId: session.user.id };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { prompt: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        include: { tags: true },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.blog.count({ where }),
    ]);

    // 转换数据格式
    const data = blogs.map((blog) => ({
      id: blog.id,
      userId: blog.userId,
      title: blog.title,
      content: blog.content,
      prompt: blog.prompt,
      status: blog.status,
      topicType: blog.topicType,
      outline: blog.outline,
      keywords: blog.keywords,
      seoScore: blog.seoScore,
      wordCount: blog.wordCount,
      seoMeta: blog.seoMeta,
      tags: blog.tags.map((t) => t.tagName),
      createdAt: blog.createdAt.toISOString(),
      updatedAt: blog.updatedAt.toISOString(),
      publishedAt: blog.publishedAt?.toISOString() || null,
    }));

    return NextResponse.json({
      success: true,
      data,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    });
  } catch (error) {
    console.error('获取博客列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取博客列表失败' },
      { status: 500 }
    );
  }
}

const createSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().optional(),
  prompt: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// POST /api/blogs — 创建博客草稿
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
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { title, content, prompt, tags } = parsed.data;

    const blog = await prisma.blog.create({
      data: {
        userId: session.user.id,
        title,
        content: content || '',
        prompt: prompt || '',
        status: 'DRAFT',
        tags: tags
          ? {
              create: tags.map((tag) => ({ tagName: tag })),
            }
          : undefined,
      },
      include: { tags: true },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: blog.id,
          title: blog.title,
          content: blog.content,
          status: blog.status,
          tags: blog.tags.map((t) => t.tagName),
          createdAt: blog.createdAt.toISOString(),
          updatedAt: blog.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建博客失败:', error);
    return NextResponse.json(
      { success: false, error: '创建博客失败' },
      { status: 500 }
    );
  }
}