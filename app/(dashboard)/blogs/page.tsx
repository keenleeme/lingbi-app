'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Blog, PaginatedResponse } from '@/types';
import { BlogList } from '@/components/blog/BlogCard';
import { LoadingSpinner, EmptyState } from '@/components/ui/Loading';
import { Search, Filter, FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function BlogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '12' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/blogs?${params}`);
      const data = await res.json();
      if (data.success) {
        setBlogs(data.data);
        setTotal(data.total);
        setHasMore(data.hasMore);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    if (session) fetchBlogs();
  }, [session, fetchBlogs]);

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这篇博客吗？')) return;
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBlogs((prev) => prev.filter((b) => b.id !== id));
        toast.success('已删除');
      } else {
        toast.error(data.error || '删除失败');
      }
    } catch {
      toast.error('删除失败');
    }
  };

  if (!session) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">我的博客</h1>
          <p className="text-sm text-surface-500">共 {total} 篇文章</p>
        </div>
        <Link href="/dashboard/editor" className="btn-primary">
          <Plus className="w-4 h-4" />
          新建博客
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="搜索博客标题或内容..."
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: '', label: '全部' },
            { value: 'DRAFT', label: '草稿' },
            { value: 'COMPLETED', label: '已完成' },
            { value: 'PUBLISHED', label: '已发布' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setStatusFilter(opt.value);
                setPage(1);
              }}
              className={`tag text-xs cursor-pointer transition-colors ${
                statusFilter === opt.value
                  ? 'bg-primary-500/20 text-primary-400 border-primary-500/30'
                  : 'hover:bg-surface-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : blogs.length > 0 ? (
        <>
          <BlogList blogs={blogs} />
          {/* Pagination */}
          {total > 12 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary btn-sm"
              >
                上一页
              </button>
              <span className="text-sm text-surface-400">
                {page} / {Math.ceil(total / 12)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
                className="btn-secondary btn-sm"
              >
                下一页
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={FileText}
          title="没有找到博客"
          description={search ? '没有匹配搜索条件的博客' : '你还没有创作任何博客'}
          action={
            <Link href="/dashboard/editor" className="btn-primary">
              开始创作
            </Link>
          }
        />
      )}
    </div>
  );
}