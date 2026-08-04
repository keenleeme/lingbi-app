'use client';

import { SEOAnalysis } from '@/types';
import { cn } from '@/lib/utils';
import { TrendingUp, AlertTriangle, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface SEOPanelProps {
  analysis: SEOAnalysis;
}

export function SEOPanel({ analysis }: SEOPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    score: true,
    dimensions: false,
    checklist: false,
    keywords: false,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const scoreColor =
    analysis.totalScore >= 80
      ? 'text-green-400'
      : analysis.totalScore >= 60
      ? 'text-yellow-400'
      : 'text-red-400';

  const scoreLabel =
    analysis.totalScore >= 80 ? '优秀' : analysis.totalScore >= 60 ? '良好' : '需要优化';

  return (
    <div className="w-80 border-l border-surface-700/50 bg-surface-900/60 overflow-y-auto flex-shrink-0">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-surface-300 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary-400" />
          SEO 分析
        </h3>

        {/* 总分 */}
        <SectionHeader
          title="SEO 评分"
          expanded={expandedSections.score}
          onToggle={() => toggleSection('score')}
        />
        {expandedSections.score && (
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={cn(
                  'w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold',
                  'bg-surface-800 border-2',
                  analysis.totalScore >= 80
                    ? 'border-green-500/30 text-green-400'
                    : analysis.totalScore >= 60
                    ? 'border-yellow-500/30 text-yellow-400'
                    : 'border-red-500/30 text-red-400'
                )}
              >
                {analysis.totalScore}
              </div>
              <div>
                <div className={cn('text-sm font-semibold', scoreColor)}>{scoreLabel}</div>
                <div className="text-xs text-surface-500">综合评分</div>
              </div>
            </div>

            {/* 各维度进度条 */}
            <div className="space-y-2.5">
              {analysis.dimensions.map((dim) => {
                const pct = (dim.score / dim.maxScore) * 100;
                const barColor =
                  pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500';
                return (
                  <div key={dim.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-surface-400">{dim.name}</span>
                      <span className="text-surface-500">
                        {dim.score}/{dim.maxScore}
                      </span>
                    </div>
                    <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500', barColor)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 检查清单 */}
        <SectionHeader
          title="检查清单"
          expanded={expandedSections.checklist}
          onToggle={() => toggleSection('checklist')}
        />
        {expandedSections.checklist && (
          <div className="space-y-1.5 mb-4">
            {analysis.checklist.map((item) => (
              <div key={item.id} className="flex items-start gap-2 text-xs">
                {item.passed ? (
                  <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />
                )}
                <span className={item.passed ? 'text-surface-400' : 'text-surface-300'}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 关键词 */}
        {analysis.keywordData && (
          <>
            <SectionHeader
              title="关键词分析"
              expanded={expandedSections.keywords}
              onToggle={() => toggleSection('keywords')}
            />
            {expandedSections.keywords && (
              <div className="mb-4">
                <div className="text-xs text-surface-500 mb-2">
                  主关键词
                </div>
                <div className="tag-primary mb-3">
                  {analysis.keywordData.primaryKeyword}
                </div>
                <div className="text-xs text-surface-500 mb-2">
                  次要关键词
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {analysis.keywordData.secondaryKeywords.map((kw) => (
                    <span key={kw} className="tag text-xs">{kw}</span>
                  ))}
                </div>
                <div className="text-xs text-surface-500 mb-1">
                  关键词密度：{analysis.keywordData.density}%
                </div>
                {analysis.keywordData.suggestions.map((s, i) => (
                  <div key={i} className="text-xs text-yellow-400 mt-1">
                    {s}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 优化建议 */}
        <SectionHeader
          title="优化建议"
          expanded={expandedSections.dimensions}
          onToggle={() => toggleSection('dimensions')}
        />
        {expandedSections.dimensions && (
          <div className="space-y-2">
            {analysis.dimensions
              .filter((d) => d.suggestions.length > 0)
              .map((dim) => (
                <div key={dim.name} className="text-xs">
                  <span className="text-surface-400 font-medium">{dim.name}：</span>
                  {dim.suggestions.map((s, i) => (
                    <span key={i} className="text-yellow-400">
                      {s}
                      {i < dim.suggestions.length - 1 ? '；' : ''}
                    </span>
                  ))}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  expanded,
  onToggle,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 w-full text-left text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2 hover:text-surface-300 transition-colors"
    >
      {expanded ? (
        <ChevronDown className="w-3 h-3" />
      ) : (
        <ChevronRight className="w-3 h-3" />
      )}
      {title}
    </button>
  );
}