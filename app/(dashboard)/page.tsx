'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, FileText, TrendingUp, Clock, PenLine } from 'lucide-react';
import { Blog } from '@/types';
import { BlogCard } from '@/components/blog/BlogCard';
import { LoadingSpinner } from '@/components/ui/Loading';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch('/api/blogs?pageSize=6')
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setBlogs(data.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Welcome */}
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          欢迎回来，{session.user?.name || '创作者'}
        </h1>
        <p className="text-surface-400">今天想创作什么内容？</p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        <Link
          href="/dashboard/editor"
          className="glass-card p-5 group hover:border-primary-500/30 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center mb-3">
            <PenLine className="w-5 h-5 text-primary-400" />
          </div>
          <h3 className="font-semibold text-white mb-1">新建博客</h3>
          <p className="text-sm text-surface-500">输入主题，AI 帮你完成创作</p>
        </Link>
        <Link
          href="/dashboard/blogs"
          className="glass-card p-5 group hover:border-primary-500/30 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-3">
            <FileText className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="font-semibold text-white mb-1">我的博客</h3>
          <p className="text-sm text-surface-500">管理已生成和已发布的文章</p>
        </Link>
        <div className="glass-card p-5">
          <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-accent-400" />
          </div>
          <h3 className="font-semibold text-white mb-1">SEO 概览</h3>
          <p className="text-sm text-surface-500">查看博客的 SEO 表现数据</p>
        </div>
      </div>

      {/* Recent Blogs */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">最近博客</h2>
        <Link
          href="/dashboard/blogs"
          className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
        >
          查看全部 <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-5 space-y-3">
              <div className="skeleton h-5 w-3/4" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-surface-500" />
          </div>
          <h3 className="text-lg font-semibold text-surface-300 mb-2">开始你的第一篇博客</h3>
          <p className="text-surface-500 text-sm mb-6">
            输入一个主题，灵笔将自动为你生成一篇 SEO 优化的博客文章
          </p>
          <Link href="/dashboard/editor" className="btn-primary">
            开始创作
          </Link>
        </div>
      )}
    </div>
  );
}