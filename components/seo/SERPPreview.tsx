'use client';

import { useState } from 'react';
import { Search, Globe, ExternalLink } from 'lucide-react';

interface SERPPreviewProps {
  title: string;
  description: string;
  url?: string;
  keywords?: string[];
}

export function SERPPreview({
  title: initialTitle,
  description: initialDescription,
  url = 'yourblog.com',
  keywords = [],
}: SERPPreviewProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  // Google SERP 字符限制
  const titleLimit = 60;
  const descLimit = 160;
  const titlePct = Math.min(100, (title.length / titleLimit) * 100);
  const descPct = Math.min(100, (description.length / descLimit) * 100);

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
        <Search className="w-3.5 h-3.5" />
        搜索结果预览 (SERP)
      </h4>

      {/* SERP 预览 */}
      <div className="bg-white rounded-xl p-4 border border-surface-700/50">
        <div className="flex items-center gap-1.5 text-xs text-surface-500 mb-1">
          <Globe className="w-3 h-3" />
          <span>{url}</span>
          <ExternalLink className="w-3 h-3 ml-auto" />
        </div>
        <h3 className="text-[20px] leading-7 text-[#1a0dab] hover:underline cursor-pointer truncate">
          {title || '博客标题预览'}
        </h3>
        <p className="text-sm text-[#4d5156] leading-snug mt-1 line-clamp-2">
          {description || '博客描述将显示在这里，帮助用户了解文章内容...'}
        </p>
      </div>

      {/* 标题编辑 */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs text-surface-400">SEO 标题</label>
          <span
            className={`text-xs ${
              title.length > titleLimit
                ? 'text-red-400'
                : title.length > titleLimit * 0.9
                ? 'text-yellow-400'
                : 'text-surface-500'
            }`}
          >
            {title.length} / {titleLimit}
          </span>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field text-sm"
          placeholder="输入 SEO 标题..."
        />
        <div className="h-1 bg-surface-800 rounded-full mt-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              titlePct > 100
                ? 'bg-red-500'
                : titlePct > 90
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(100, titlePct)}%` }}
          />
        </div>
      </div>

      {/* 描述编辑 */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs text-surface-400">SEO 描述</label>
          <span
            className={`text-xs ${
              description.length > descLimit
                ? 'text-red-400'
                : description.length > descLimit * 0.9
                ? 'text-yellow-400'
                : 'text-surface-500'
            }`}
          >
            {description.length} / {descLimit}
          </span>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field text-sm min-h-[72px] resize-none"
          placeholder="输入 SEO 描述..."
        />
        <div className="h-1 bg-surface-800 rounded-full mt-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              descPct > 100
                ? 'bg-red-500'
                : descPct > 90
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(100, descPct)}%` }}
          />
        </div>
      </div>

      {/* 关键词标签 */}
      {keywords.length > 0 && (
        <div>
          <label className="text-xs text-surface-400 mb-1.5 block">目标关键词</label>
          <div className="flex flex-wrap gap-1.5">
            {keywords.map((kw, i) => (
              <span
                key={kw}
                className={`tag text-xs ${i === 0 ? 'tag-primary' : ''}`}
              >
                {i === 0 && '主 '}
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}