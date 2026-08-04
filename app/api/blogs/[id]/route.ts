import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// GET /api/blogs/[id] — 获取单篇博客
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const blog = await prisma.blog.findUnique({
      where: { id: params.id },
      include: {
        tags: true,
        seoAnalyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!blog) {
      return NextResponse.json(
        { success: false, error: '博客不存在' },
        { status: 404 }
      );
    }

    if (blog.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: '无权访问' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
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
        seoAnalysis: blog.seoAnalyses[0] || null,
        createdAt: blog.createdAt.toISOString(),
        updatedAt: blog.updatedAt.toISOString(),
        publishedAt: blog.publishedAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('获取博客失败:', error);
    return NextResponse.json(
      { success: false, error: '获取博客失败' },
      { status: 500 }
    );
  }
}

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  status: z.enum(['DRAFT', 'COMPLETED', 'PUBLISHED', 'ARCHIVED']).optional(),
  tags: z.array(z.string()).optional(),
  seoMeta: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
});

// PATCH /api/blogs/[id] — 更新博客
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const blog = await prisma.blog.findUnique({ where: { id: params.id } });
    if (!blog) {
      return NextResponse.json(
        { success: false, error: '博客不存在' },
        { status: 404 }
      );
    }
    if (blog.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: '无权操作' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { title, content, status, tags, seoMeta } = parsed.data;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'PUBLISHED') {
        updateData.publishedAt = new Date();
      }
    }
    if (seoMeta !== undefined) updateData.seoMeta = seoMeta;

    // 更新标签
    if (tags !== undefined) {
      await prisma.blogTag.deleteMany({ where: { blogId: params.id } });
      if (tags.length > 0) {
        await prisma.blogTag.createMany({
          data: tags.map((tag) => ({ blogId: params.id, tagName: tag })),
        });
      }
    }

    const updated = await prisma.blog.update({
      where: { id: params.id },
      data: updateData,
      include: { tags: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        title: updated.title,
        content: updated.content,
        status: updated.status,
        seoMeta: updated.seoMeta,
        tags: updated.tags.map((t) => t.tagName),
        updatedAt: updated.updatedAt.toISOString(),
        publishedAt: updated.publishedAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('更新博客失败:', error);
    return NextResponse.json(
      { success: false, error: '更新博客失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[id] — 删除博客
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const blog = await prisma.blog.findUnique({ where: { id: params.id } });
    if (!blog) {
      return NextResponse.json(
        { success: false, error: '博客不存在' },
        { status: 404 }
      );
    }
    if (blog.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: '无权操作' },
        { status: 403 }
      );
    }

    await prisma.blog.delete({ where: { id: params.id } });

    return NextResponse.json({
      success: true,
      data: { id: params.id },
    });
  } catch (error) {
    console.error('删除博客失败:', error);
    return NextResponse.json(
      { success: false, error: '删除博客失败' },
      { status: 500 }
    );
  }
}