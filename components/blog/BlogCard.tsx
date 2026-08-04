'use client';

import Link from 'next/link';
import { Blog } from '@/types';
import { formatDate, timeAgo, STATUS_LABELS, STATUS_COLORS, extractPreview, readingTime } from '@/lib/utils';
import { FileText, Clock, BarChart3, Tag, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlogCardProps {
  blog: Blog;
  onDelete?: (id: string) => void;
}

export function BlogCard({ blog, onDelete }: BlogCardProps) {
  const preview = blog.content ? extractPreview(blog.content, 150) : blog.prompt;
  const readTime = blog.content ? readingTime(blog.content) : 0;
  const statusLabel = STATUS_LABELS[blog.status] || blog.status;
  const statusColor = STATUS_COLORS[blog.status] || 'bg-surface-200 text-surface-600';

  return (
    <Link
      href={`/dashboard/blogs/${blog.id}`}
      className="glass-card-hover p-5 block group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
            {blog.title}
          </h3>
          <p className="text-sm text-surface-500 mt-1 line-clamp-2">{preview}</p>
        </div>
        <div className="ml-3 flex-shrink-0">
          <span className={cn('badge', statusColor)}>{statusLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-surface-500">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {timeAgo(blog.updatedAt)}
        </span>
        {readTime > 0 && (
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {readTime} 分钟阅读
          </span>
        )}
        {blog.seoScore != null && (
          <span className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            <span
              className={
                blog.seoScore >= 80
                  ? 'text-green-400'
                  : blog.seoScore >= 60
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }
            >
              SEO {blog.seoScore}
            </span>
          </span>
        )}
        {blog.wordCount && (
          <span>{blog.wordCount.toLocaleString()} 字</span>
        )}
      </div>

      {blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {blog.tags.map((tag) => (
            <span key={tag} className="tag text-[10px]">
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

export function BlogList({ blogs }: { blogs: Blog[] }) {
  if (blogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-surface-500" />
        </div>
        <h3 className="text-lg font-semibold text-surface-300 mb-2">还没有博客</h3>
        <p className="text-surface-500 text-sm mb-6">创建你的第一篇 AI 博客，开始 SEO 之旅</p>
        <Link href="/dashboard/editor" className="btn-primary">
          开始创作
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {blogs.map((blog) => (
        <BlogCard key={blog.id} blog={blog} />
      ))}
    </div>
  );
}