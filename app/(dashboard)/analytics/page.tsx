'use client';

import { AnalyticsPanel } from '@/components/blog/AnalyticsPanel';

export default function AnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">数据分析</h1>
        <p className="text-sm text-surface-500">查看你的博客创作和 SEO 表现数据</p>
      </div>
      <AnalyticsPanel />
    </div>
  );
}