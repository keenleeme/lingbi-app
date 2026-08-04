'use client';

import { SEOAnalysis } from '@/types';
import { SERPPreview } from './SERPPreview';
import { KeywordDensityChart } from './KeywordDensityChart';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { useState } from 'react';

interface SEODashboardProps {
  analysis: SEOAnalysis;
  blogTitle?: string;
  blogContent?: string;
}

export function SEODashboard({ analysis, blogTitle = '', blogContent = '' }: SEODashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'serp' | 'checklist'>(
    'overview'
  );
  const [expandedSuggestions, setExpandedSuggestions] = useState(true);

  const tabs = [
    { id: 'overview' as const, label: '总览', icon: TrendingUp },
    { id: 'keywords' as const, label: '关键词', icon: Lightbulb },
    { id: 'serp' as const, label: 'SERP', icon: Search },
    { id: 'checklist' as const, label: '检查清单', icon: CheckCircle },
  ];

  const scoreColor =
    analysis.totalScore >= 80
      ? 'text-green-400'
      : analysis.totalScore >= 60
      ? 'text-yellow-400'
      : 'text-red-400';

  const scoreBg =
    analysis.totalScore >= 80
      ? 'border-green-500/30 bg-green-500/5'
      : analysis.totalScore >= 60
      ? 'border-yellow-500/30 bg-yellow-500/5'
      : 'border-red-500/30 bg-red-500/5';

  const passedCount = analysis.checklist.filter((c) => c.passed).length;
  const totalCount = analysis.checklist.length;

  return (
    <div className="w-80 border-l border-surface-700/50 bg-surface-900/60 overflow-y-auto flex-shrink-0">
      {/* Tab 头 */}
      <div className="sticky top-0 z-10 bg-surface-900/95 backdrop-blur-sm border-b border-surface-700/50">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                  activeTab === tab.id
                    ? 'text-primary-400 border-b-2 border-primary-500'
                    : 'text-surface-500 hover:text-surface-300'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4">
        {/* 总览 Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4 animate-fade-in">
            {/* 总分卡片 */}
            <div className={cn('rounded-2xl border p-4', scoreBg)}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-surface-400">SEO 综合评分</span>
                <span className="text-xs text-surface-500">
                  {passedCount}/{totalCount} 项通过
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className={cn('text-4xl font-bold', scoreColor)}>
                  {analysis.totalScore}
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        analysis.totalScore >= 80
                          ? 'bg-green-500'
                          : analysis.totalScore >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      )}
                      style={{ width: `${analysis.totalScore}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-surface-600 mt-1">
                    <span>差</span>
                    <span>及格</span>
                    <span>优秀</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 各维度 */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                维度评分
              </h4>
              {analysis.dimensions.map((dim) => {
                const pct = (dim.score / dim.maxScore) * 100;
                const color =
                  pct >= 80 ? 'green' : pct >= 60 ? 'yellow' : 'red';
                return (
                  <div key={dim.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-surface-300">{dim.name}</span>
                      <span
                        className={cn(
                          'font-medium',
                          color === 'green'
                            ? 'text-green-400'
                            : color === 'yellow'
                            ? 'text-yellow-400'
                            : 'text-red-400'
                        )}
                      >
                        {dim.score}
                        <span className="text-surface-600">/{dim.maxScore}</span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          color === 'green'
                            ? 'bg-green-500'
                            : color === 'yellow'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 优化建议汇总 */}
            {analysis.dimensions.some((d) => d.suggestions.length > 0) && (
              <div>
                <button
                  onClick={() => setExpandedSuggestions(!expandedSuggestions)}
                  className="flex items-center gap-1.5 w-full text-left text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2"
                >
                  {expandedSuggestions ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                  优化建议
                </button>
                {expandedSuggestions && (
                  <div className="space-y-2 animate-fade-in">
                    {analysis.dimensions
                      .filter((d) => d.suggestions.length > 0)
                      .map((dim) =>
                        dim.suggestions.map((s, i) => (
                          <div
                            key={`${dim.name}-${i}`}
                            className="flex items-start gap-2 text-xs bg-surface-800/50 rounded-lg p-2"
                          >
                            <Lightbulb className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-surface-500">{dim.name}：</span>
                              <span className="text-surface-300">{s}</span>
                            </div>
                          </div>
                        ))
                      )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 关键词 Tab */}
        {activeTab === 'keywords' && analysis.keywordData && (
          <div className="animate-fade-in">
            <KeywordDensityChart data={analysis.keywordData} />
          </div>
        )}

        {/* SERP Tab */}
        {activeTab === 'serp' && (
          <div className="animate-fade-in">
            <SERPPreview
              title={blogTitle}
              description={blogContent.substring(0, 160)}
              keywords={analysis.keywordData?.secondaryKeywords || []}
            />
          </div>
        )}

        {/* 检查清单 Tab */}
        {activeTab === 'checklist' && (
          <div className="animate-fade-in space-y-1">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                SEO 检查清单
              </h4>
              <span className="text-xs text-surface-500">
                {passedCount}/{totalCount}
              </span>
            </div>
            {analysis.checklist.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-surface-800/50 transition-colors"
              >
                {item.passed ? (
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <div
                    className={cn(
                      'text-xs font-medium',
                      item.passed ? 'text-surface-300' : 'text-surface-200'
                    )}
                  >
                    {item.label}
                  </div>
                  <div className="text-[10px] text-surface-600 mt-0.5">{item.category}</div>
                </div>
              </div>
            ))}

            {/* 汇总 */}
            <div className="mt-4 pt-4 border-t border-surface-700/50">
              <div className="flex items-center gap-2 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-surface-400">
                  {totalCount - passedCount} 项待优化
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Search({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}