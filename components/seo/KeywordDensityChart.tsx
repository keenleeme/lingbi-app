'use client';

import { KeywordData } from '@/types';
import { cn } from '@/lib/utils';

interface KeywordChartProps {
  data: KeywordData;
}

export function KeywordDensityChart({ data }: KeywordChartProps) {
  const { primaryKeyword, secondaryKeywords, density, suggestions } = data;

  // 理想密度范围 1.5% - 3%
  const idealMin = 1.5;
  const idealMax = 3.0;
  const maxScale = 5.0;

  const densityPct = Math.min(100, (density / maxScale) * 100);
  const idealStartPct = (idealMin / maxScale) * 100;
  const idealWidthPct = ((idealMax - idealMin) / maxScale) * 100;

  const densityStatus =
    density < idealMin
      ? { label: '偏低', color: 'text-yellow-400', barColor: 'bg-yellow-500' }
      : density <= idealMax
      ? { label: '理想', color: 'text-green-400', barColor: 'bg-green-500' }
      : { label: '偏高', color: 'text-red-400', barColor: 'bg-red-500' };

  // 模拟关键词分布数据
  const distribution = [
    { section: '标题', count: Math.floor(Math.random() * 2) + 1, total: 2 },
    { section: '首段', count: Math.floor(Math.random() * 2) + 1, total: 2 },
    { section: 'H2 标题', count: Math.floor(Math.random() * 3) + 1, total: 4 },
    { section: '正文段落', count: Math.floor(Math.random() * 5) + 3, total: 8 },
    { section: '结尾段', count: Math.floor(Math.random() * 2), total: 2 },
  ];

  return (
    <div className="space-y-5">
      <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
        关键词分析
      </h4>

      {/* 主关键词密度 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="tag-primary text-xs">{primaryKeyword}</span>
            <span className="text-xs text-surface-500">主关键词</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">{density}%</span>
            <span className={cn('text-xs font-medium', densityStatus.color)}>
              {densityStatus.label}
            </span>
          </div>
        </div>

        {/* 密度条 with 理想区间 */}
        <div className="relative h-6 bg-surface-800 rounded-full overflow-hidden">
          {/* 理想区间背景 */}
          <div
            className="absolute h-full bg-green-500/15 border-x border-green-500/30"
            style={{
              left: `${idealStartPct}%`,
              width: `${idealWidthPct}%`,
            }}
          />
          {/* 实际密度条 */}
          <div
            className={cn('h-full rounded-full transition-all duration-500', densityStatus.barColor)}
            style={{ width: `${densityPct}%` }}
          />
          {/* 理想区间标签 */}
          <div
            className="absolute top-0 h-full flex items-center text-[9px] text-green-400/60"
            style={{ left: `${idealStartPct}%`, width: `${idealWidthPct}%` }}
          >
            <span className="mx-auto">理想区间</span>
          </div>
        </div>
        <div className="flex justify-between text-[10px] text-surface-600 mt-1">
          <span>0%</span>
          <span className="text-green-400/60">{idealMin}%-{idealMax}%</span>
          <span>{maxScale}%+</span>
        </div>
      </div>

      {/* 关键词分布 */}
      <div>
        <div className="text-xs text-surface-400 mb-2">关键词在各位置的分布</div>
        <div className="space-y-2">
          {distribution.map((item) => {
            const pct = (item.count / item.total) * 100;
            return (
              <div key={item.section} className="flex items-center gap-3">
                <span className="text-xs text-surface-500 w-20 flex-shrink-0">
                  {item.section}
                </span>
                <div className="flex-1 h-4 bg-surface-800 rounded overflow-hidden flex">
                  {Array.from({ length: item.total }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex-1 border-r border-surface-900 last:border-r-0',
                        i < item.count ? 'bg-primary-500/60' : ''
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-surface-400 w-12 text-right">
                  {item.count}/{item.total}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 次要关键词 */}
      <div>
        <div className="text-xs text-surface-400 mb-2">次要关键词</div>
        <div className="flex flex-wrap gap-1.5">
          {secondaryKeywords.map((kw, i) => (
            <span
              key={kw}
              className="tag text-xs"
              style={{
                opacity: 1 - i * 0.12,
              }}
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* 优化建议 */}
      {suggestions.length > 0 && (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3">
          <div className="text-xs font-medium text-yellow-400 mb-2">优化建议</div>
          <ul className="space-y-1">
            {suggestions.map((s, i) => (
              <li key={i} className="text-xs text-surface-400 flex items-start gap-1.5">
                <span className="text-yellow-400 mt-0.5">→</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}