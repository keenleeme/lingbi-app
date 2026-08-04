'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Editor } from '@/components/editor/Editor';
import { LoadingSpinner } from '@/components/ui/Loading';
import { Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [blogId, setBlogId] = useState<string | undefined>();
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('请输入博客主题');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          topicType: '通用',
          language: 'zh-CN',
          style: '专业',
          length: 'medium',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBlogId(data.data.id);
        setShowEditor(true);
        toast.success('博客生成成功！');
      } else {
        toast.error(data.error || '生成失败');
      }
    } catch (err) {
      toast.error('网络错误，请稍后重试');
    } finally {
      setGenerating(false);
    }
  };

  // 如果还没进入编辑器，显示输入页
  if (!showEditor) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            AI 博客创作
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            今天想写点什么？
          </h1>
          <p className="text-surface-400 max-w-lg mx-auto">
            输入一个主题、关键词或问题，灵笔将自动生成大纲、撰写全文并进行 SEO 优化
          </p>
        </div>

        <div className="glass-card p-6">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="例如：2026 年远程办公效率指南、AI 如何改变教育行业、初学者学 Python 的最佳路径..."
            className="input-area min-h-[160px] text-lg"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleGenerate();
              }
            }}
          />

          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              {['短篇', '中篇', '长篇'].map((len) => (
                <button key={len} className="tag text-xs hover:bg-surface-700 transition-colors">
                  {len}
                </button>
              ))}
              {['专业', '轻松', '教程'].map((style) => (
                <button key={style} className="tag text-xs hover:bg-surface-700 transition-colors">
                  {style}
                </button>
              ))}
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="btn-primary"
            >
              {generating ? (
                <>
                  <LoadingSpinner size="sm" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  开始生成
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-surface-600 mt-3">
            提示：按 Cmd/Ctrl + Enter 快速生成
          </p>
        </div>

        {/* 示例提示 */}
        <div className="mt-10">
          <h3 className="text-sm font-semibold text-surface-400 mb-3">试试这些主题：</h3>
          <div className="flex flex-wrap gap-2">
            {[
              '2026 年 AI 编程工具对比',
              '如何通过内容营销获取前 1000 个用户',
              'React Server Components 深度解析',
              '远程团队管理的最佳实践',
              '个人博客 SEO 优化全攻略',
            ].map((topic) => (
              <button
                key={topic}
                onClick={() => setPrompt(topic)}
                className="tag text-xs hover:bg-surface-700 hover:text-surface-200 transition-colors cursor-pointer"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 编辑器视图
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <Editor
        blogId={blogId}
        prompt={prompt}
        initialTitle={prompt}
        onSave={async (content, title) => {
          if (!blogId) return;
          try {
            await fetch(`/api/blogs/${blogId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title, content }),
            });
            toast.success('已保存');
          } catch {
            toast.error('保存失败');
          }
        }}
      />
    </div>
  );
}