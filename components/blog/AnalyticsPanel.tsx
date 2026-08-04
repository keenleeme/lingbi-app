'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/Loading';
import {
  FileText,
  TrendingUp,
  Award,
  Zap,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import Link from 'next/link';
import { STATUS_LABELS, STATUS_COLORS, timeAgo, cn } from '@/lib/utils';

interface StatsData {
  overview: {
    totalBlogs: number;
    publishedCount: number;
    draftCount: number;
    completedCount: number;
    avgSeoScore: number;
    maxSeoScore: number;
    minSeoScore: number;
    totalTokens: number;
    totalGenerations: number;
  };
  statusDistribution: Record<string, number>;
  seoTrend: { date: string; avg: number; count: number }[];
  creationTrend: { date: string; avg: number; count: number }[];
  recentBlogs: Array<{
    id: string;
    title: string;
    seoScore: number | null;
    wordCount: number | null;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

export function AnalyticsPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch('/api/stats')
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setStats(data.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats) return null;

  const scoreTrend = stats.seoTrend.length >= 2
    ? stats.seoTrend[stats.seoTrend.length - 1].avg - stats.seoTrend[0].avg
    : 0;

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="总博客数"
          value={stats.overview.totalBlogs}
          color="primary"
        />
        <StatCard
          icon={Award}
          label="平均 SEO 分"
          value={stats.overview.avgSeoScore}
          color="green"
          trend={scoreTrend}
        />
        <StatCard
          icon={TrendingUp}
          label="已发布"
          value={stats.overview.publishedCount}
          color="accent"
        />
        <StatCard
          icon={Zap}
          label="AI 生成次数"
          value={stats.overview.totalGenerations}
          color="yellow"
        />
      </div>

      {/* SEO 趋势图 */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-surface-300">SEO 评分趋势</h3>
          <span className="text-xs text-surface-500">最近 {stats.seoTrend.length} 次分析</span>
        </div>
        {stats.seoTrend.length > 0 ? (
          <div className="flex items-end gap-2 h-40">
            {stats.seoTrend.map((point, i) => {
              const height = (point.avg / 100) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1 group"
                >
                  <span className="text-xs text-surface-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {point.avg}
                  </span>
                  <div
                    className="w-full rounded-t-md transition-all duration-500 group-hover:bg-primary-400"
                    style={{
                      height: `${height}%`,
                      background:
                        point.avg >= 80
                          ? 'rgba(34,197,94,0.6)'
                          : point.avg >= 60
                          ? 'rgba(234,179,8,0.6)'
                          : 'rgba(239,68,68,0.6)',
                    }}
                  />
                  <span className="text-[10px] text-surface-600">
                    {point.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-sm text-surface-500">
            还没有 SEO 分析数据
          </div>
        )}
      </div>

      {/* 状态分布 + 最近博客 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 状态分布 */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-surface-300 mb-4">博客状态分布</h3>
          <div className="space-y-3">
            {Object.entries(stats.statusDistribution).map(([status, count]) => {
              const pct = stats.overview.totalBlogs > 0
                ? (count / stats.overview.totalBlogs) * 100
                : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-surface-400">
                      {STATUS_LABELS[status] || status}
                    </span>
                    <span className="text-surface-500">{count}</span>
                  </div>
                  <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500/60 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 最近博客 */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-surface-300">最近创作</h3>
            <Link
              href="/dashboard/blogs"
              className="text-xs text-primary-400 hover:text-primary-300"
            >
              查看全部
            </Link>
          </div>
          <div className="space-y-2">
            {stats.recentBlogs.slice(0, 5).map((blog) => (
              <Link
                key={blog.id}
                href={`/dashboard/blogs/${blog.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-800/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-surface-200 truncate">{blog.title}</div>
                  <div className="text-xs text-surface-500">{timeAgo(blog.updatedAt)}</div>
                </div>
                {blog.seoScore != null && (
                  <span
                    className={cn(
                      'text-xs font-medium',
                      blog.seoScore >= 80
                        ? 'text-green-400'
                        : blog.seoScore >= 60
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    )}
                  >
                    {blog.seoScore}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  trend,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: 'primary' | 'green' | 'accent' | 'yellow';
  trend?: number;
}) {
  const colorMap = {
    primary: 'text-primary-400 bg-primary-500/10',
    green: 'text-green-400 bg-green-500/10',
    accent: 'text-accent-400 bg-accent-500/10',
    yellow: 'text-yellow-400 bg-yellow-500/10',
  };

  return (
    <div className="glass-card p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${colorMap[color]}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div className="text-2xl font-bold text-white">{value.toLocaleString()}</div>
      <div className="text-xs text-surface-500 mt-0.5">{label}</div>
      {trend !== undefined && trend !== 0 && (
        <div
          className={cn(
            'flex items-center gap-0.5 text-xs mt-1',
            trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-surface-500'
          )}
        >
          {trend > 0 ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          {Math.abs(trend)} 分
        </div>
      )}
    </div>
  );
}