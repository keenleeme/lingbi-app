import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/stats — 获取用户统计数据
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 并行查询
    const [
      totalBlogs,
      statusCounts,
      seoStats,
      recentBlogs,
      recentSeoAnalyses,
      generationLogs,
    ] = await Promise.all([
      prisma.blog.count({ where: { userId } }),

      prisma.blog.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      }),

      prisma.blog.aggregate({
        where: { userId, seoScore: { not: null } },
        _avg: { seoScore: true },
        _max: { seoScore: true },
        _min: { seoScore: true },
      }),

      prisma.blog.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          seoScore: true,
          wordCount: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      prisma.seoAnalysis.findMany({
        where: { blog: { userId } },
        select: {
          totalScore: true,
          createdAt: true,
          blogId: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),

      prisma.generationLog.aggregate({
        where: { userId },
        _sum: { tokensUsed: true },
        _count: true,
      }),
    ]);

    // 按日期聚合 SEO 分数趋势
    const seoTrend = aggregateByDate(
      recentSeoAnalyses.map((a) => ({
        date: a.createdAt,
        value: a.totalScore,
      }))
    );

    // 按日期聚合创作频率
    const creationTrend = aggregateByDate(
      recentBlogs.map((b) => ({
        date: b.createdAt,
        value: 1,
      }))
    );

    // 状态分布
    const statusMap: Record<string, number> = {};
    statusCounts.forEach((s) => {
      statusMap[s.status] = s._count;
    });

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalBlogs,
          publishedCount: statusMap['PUBLISHED'] || 0,
          draftCount: statusMap['DRAFT'] || 0,
          completedCount: statusMap['COMPLETED'] || 0,
          avgSeoScore: Math.round(seoStats._avg.seoScore || 0),
          maxSeoScore: seoStats._max.seoScore || 0,
          minSeoScore: seoStats._min.seoScore || 0,
          totalTokens: generationLogs._sum.tokensUsed || 0,
          totalGenerations: generationLogs._count || 0,
        },
        statusDistribution: {
          DRAFT: statusMap['DRAFT'] || 0,
          GENERATING: statusMap['GENERATING'] || 0,
          COMPLETED: statusMap['COMPLETED'] || 0,
          PUBLISHED: statusMap['PUBLISHED'] || 0,
          ARCHIVED: statusMap['ARCHIVED'] || 0,
        },
        seoTrend,
        creationTrend,
        recentBlogs: recentBlogs.map((b) => ({
          id: b.id,
          title: b.title,
          seoScore: b.seoScore,
          wordCount: b.wordCount,
          status: b.status,
          createdAt: b.createdAt.toISOString(),
          updatedAt: b.updatedAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json(
      { success: false, error: '获取统计数据失败' },
      { status: 500 }
    );
  }
}

function aggregateByDate(
  items: { date: Date; value: number }[]
): { date: string; avg: number; count: number }[] {
  const grouped: Record<string, number[]> = {};

  items.forEach((item) => {
    const dateKey = item.date.toISOString().split('T')[0];
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(item.value);
  });

  return Object.entries(grouped)
    .map(([date, values]) => ({
      date,
      avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      count: values.length,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}