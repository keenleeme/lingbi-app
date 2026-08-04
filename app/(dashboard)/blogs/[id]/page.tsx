'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Editor } from '@/components/editor/Editor';
import { LoadingSpinner } from '@/components/ui/Loading';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Blog, SEOAnalysis } from '@/types';

export default function BlogDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session && params.id) {
      fetch(`/api/blogs/${params.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setBlog(data.data);
          } else {
            toast.error('博客不存在');
            router.push('/dashboard/blogs');
          }
        })
        .catch(() => {
          toast.error('加载失败');
        })
        .finally(() => setLoading(false));
    }
  }, [session, params.id, router]);

  const handleSave = async (content: string, title: string) => {
    try {
      const res = await fetch(`/api/blogs/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('保存成功');
      } else {
        toast.error(data.error || '保存失败');
      }
    } catch {
      toast.error('保存失败');
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这篇博客吗？')) return;
    try {
      const res = await fetch(`/api/blogs/${params.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('已删除');
        router.push('/dashboard/blogs');
      } else {
        toast.error(data.error || '删除失败');
      }
    } catch {
      toast.error('删除失败');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session || !blog) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-surface-700/50 bg-surface-900/80">
        <Link href="/dashboard/blogs" className="btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" />
          返回
        </Link>
        <div className="flex-1">
          <input
            value={blog.title}
            onChange={(e) => setBlog({ ...blog, title: e.target.value })}
            className="bg-transparent text-white font-semibold focus:outline-none border-b border-transparent hover:border-surface-600 focus:border-primary-500 px-1"
            placeholder="博客标题"
          />
        </div>
        <button onClick={handleDelete} className="btn-danger btn-sm">
          <Trash2 className="w-4 h-4" />
          删除
        </button>
      </div>

      <Editor
        blogId={blog.id}
        initialContent={blog.content}
        initialTitle={blog.title}
        initialOutline={blog.outline}
        initialSEO={(blog as any).seoAnalysis || null}
        onSave={handleSave}
      />
    </div>
  );
}