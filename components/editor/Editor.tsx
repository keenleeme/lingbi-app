'use client';

import { useState, useCallback, useRef } from 'react';
import { SEODashboard } from '@/components/seo/SEODashboard';
import { OutlineSidebar } from './OutlineSidebar';
import { BlogOutline, SEOAnalysis } from '@/types';
import {
  Loader2,
  Save,
  Eye,
  List,
  RefreshCw,
  Download,
  FileCode,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface EditorProps {
  blogId?: string;
  initialContent?: string;
  initialTitle?: string;
  initialOutline?: BlogOutline | null;
  initialSEO?: SEOAnalysis | null;
  onSave?: (content: string, title: string) => void;
  onGenerate?: (prompt: string) => void;
  prompt?: string;
}

export function Editor({
  blogId,
  initialContent = '',
  initialTitle = '',
  initialOutline = null,
  initialSEO = null,
  onSave,
  prompt,
}: EditorProps) {
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState(initialTitle);
  const [outline, setOutline] = useState<BlogOutline | null>(initialOutline);
  const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysis | null>(initialSEO);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showOutline, setShowOutline] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // 通过 SSE 连接真实流式生成 API
  const handleStreamGenerate = useCallback(
    async (generatePrompt: string) => {
      setIsGenerating(true);
      setProgress(10);
      setCurrentStep('正在连接 AI 服务...');

      try {
        const response = await fetch('/api/generate/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: generatePrompt,
            topicType: '通用',
            language: 'zh-CN',
            style: '专业',
            length: 'medium',
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('无法读取流');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          let eventType = '';
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ') && eventType) {
              try {
                const data = JSON.parse(line.slice(6));

                switch (eventType) {
                  case 'outline':
                    setProgress(30);
                    setCurrentStep('大纲生成完成，正在撰写正文...');
                    if (data.data) {
                      setOutline(data.data as BlogOutline);
                    }
                    break;

                  case 'content':
                    setProgress(60);
                    setCurrentStep('内容生成完成，正在进行 SEO 分析...');
                    if (typeof data.data === 'string') {
                      setContent(data.data);
                    }
                    break;

                  case 'seo':
                    setProgress(85);
                    setCurrentStep('SEO 分析完成');
                    if (data.data) {
                      setSeoAnalysis(data.data as SEOAnalysis);
                    }
                    break;

                  case 'done':
                    setProgress(95);
                    if (data.data) {
                      const result = data.data as any;
                      if (result.content) setContent(result.content);
                      if (result.outline) setOutline(result.outline);
                      if (result.seoAnalysis) setSeoAnalysis(result.seoAnalysis);
                    }
                    break;

                  case 'saved':
                    setProgress(100);
                    setCurrentStep('');
                    toast.success('博客生成并保存成功');
                    break;

                  case 'error':
                    setCurrentStep('');
                    toast.error(data.message || '生成失败');
                    break;
                }
              } catch {
                // JSON parse error, skip
              }
              eventType = '';
            }
          }
        }
      } catch (error) {
        // SSE 连接失败，回退到模拟模式
        toast.error('AI 服务连接失败，使用模拟模式');
        await simulateGeneration(generatePrompt);
      } finally {
        setIsGenerating(false);
        setTimeout(() => setProgress(0), 1000);
      }
    },
    []
  );

  // 模拟生成（SSE 不可用时的回退方案）
  const simulateGeneration = useCallback(async (genPrompt: string) => {
    setIsGenerating(true);
    setProgress(15);
    setCurrentStep('正在分析主题...');

    await new Promise((r) => setTimeout(r, 1200));

    const mockOutline: BlogOutline = {
      sections: [
        { id: 's1', title: '引言：为什么这个话题值得关注', level: 2, keyPoints: ['背景数据', '读者痛点', '文章价值'] },
        { id: 's2', title: '核心概念解析', level: 2, keyPoints: ['定义说明', '关键原理', '常见误区'] },
        { id: 's3', title: '实践策略与案例', level: 2, keyPoints: ['策略一', '策略二', '真实案例'] },
        { id: 's4', title: '工具与资源推荐', level: 2, keyPoints: ['工具对比', '学习资源', '行动建议'] },
        { id: 's5', title: '总结与展望', level: 2, keyPoints: ['核心要点回顾', '未来趋势', '行动号召'] },
      ],
    };
    setOutline(mockOutline);
    setProgress(35);
    setCurrentStep('正在撰写内容...');

    const mockContent = `# ${genPrompt}

## 引言：为什么这个话题值得关注

在当今数字化时代，${genPrompt} 已经成为一个不可忽视的话题。根据最新的行业报告，超过 70% 的企业已经开始关注这一领域的发展趋势。

无论你是刚刚入门的初学者，还是已经有一定经验的从业者，本文都将为你提供系统化的认知框架和可落地的实践方法。

## 核心概念解析

要真正理解 ${genPrompt}，我们首先需要澄清几个关键概念：

### 基本定义

${genPrompt} 指的是在特定场景下，通过系统化的方法和工具，实现目标的过程。

### 关键原理

背后的核心逻辑可以归纳为三个层面：战略层、执行层和反馈层。

## 实践策略与案例

### 策略一：从基础开始

很多人在接触 ${genPrompt} 时，容易犯的一个错误是急于求成。实际上，扎实的基础才是长期成功的关键。

### 策略二：数据驱动决策

相比凭感觉，数据驱动的方式能带来更可预测的结果。建立数据意识，是每个从业者的必修课。

## 工具与资源推荐

| 工具 | 特点 | 适用场景 |
|------|------|----------|
| 工具A | 简单易用 | 入门级 |
| 工具B | 功能强大 | 专业级 |

## 总结与展望

${genPrompt} 是一个持续演进的话题，保持学习和实践的心态，你一定能在这个领域找到自己的节奏。

> 本文由 **灵笔 AI** 辅助生成，经人工审核完善。`;

    let streamed = '';
    const chars = mockContent.split('');
    for (let i = 0; i < chars.length; i += 5) {
      streamed += chars.slice(i, i + 5).join('');
      setContent(streamed);
      setProgress(35 + Math.floor((i / chars.length) * 40));
      await new Promise((r) => setTimeout(r, 10));
    }

    setProgress(80);
    setCurrentStep('正在进行 SEO 分析...');
    await new Promise((r) => setTimeout(r, 800));

    const mockSEO: SEOAnalysis = {
      totalScore: 78,
      dimensions: [
        { name: '标题优化', score: 8, maxScore: 10, suggestions: ['标题已包含核心关键词'] },
        { name: '关键词密度', score: 7, maxScore: 10, suggestions: ['建议在 H2 中增加关键词变体'] },
        { name: '内容结构', score: 9, maxScore: 10, suggestions: [] },
        { name: '可读性', score: 8, maxScore: 10, suggestions: ['部分段落可适当缩短'] },
        { name: '内链机会', score: 6, maxScore: 10, suggestions: ['建议增加 2-3 个内部链接'] },
        { name: '元描述', score: 9, maxScore: 10, suggestions: [] },
      ],
      checklist: [
        { id: 'c1', label: '标题包含主要关键词', passed: true, category: '标题' },
        { id: 'c2', label: 'H2/H3 层级合理', passed: true, category: '结构' },
        { id: 'c3', label: '内容超过 1500 字', passed: true, category: '内容' },
        { id: 'c4', label: '包含至少一张图片', passed: false, category: '内容' },
        { id: 'c5', label: '有明确的 CTA', passed: true, category: '转化' },
        { id: 'c6', label: '元描述在 120-160 字符', passed: true, category: '元数据' },
      ],
      keywordData: {
        primaryKeyword: genPrompt,
        secondaryKeywords: ['入门指南', '最佳实践', '工具推荐', '案例分析'],
        density: 2.3,
        suggestions: ['建议增加长尾关键词', '在首段更早出现主关键词'],
      },
    };
    setSeoAnalysis(mockSEO);
    setProgress(100);
    setCurrentStep('');
    toast.success('模拟生成完成');
  }, []);

  const handleSave = () => {
    onSave?.(content, title);
  };

  const handleExport = (format: 'markdown' | 'html') => {
    if (!blogId) {
      toast.error('请先保存博客');
      return;
    }
    window.open(`/api/blogs/${blogId}/export?format=${format}`, '_blank');
    setShowExportMenu(false);
    toast.success(`正在导出 ${format === 'markdown' ? 'Markdown' : 'HTML'} 文件`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-surface-700/50 bg-surface-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowOutline(!showOutline)}
            className={cn('btn-ghost btn-sm', showOutline && 'text-primary-400')}
          >
            <List className="w-4 h-4" />
            大纲
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={cn('btn-ghost btn-sm', showPreview && 'text-primary-400')}
          >
            <Eye className="w-4 h-4" />
            预览
          </button>
        </div>

        <div className="flex-1" />

        {/* 生成进度 */}
        {isGenerating && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-primary-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="animate-pulse-soft min-w-[140px]">{currentStep}</span>
            </div>
            {progress > 0 && (
              <div className="w-24 h-1 bg-surface-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-1">
          {/* 导出 */}
          {blogId && (
            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="btn-ghost btn-sm"
              >
                <Download className="w-4 h-4" />
                导出
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 w-44 glass-card p-1 z-50 animate-fade-in">
                  <button
                    onClick={() => handleExport('markdown')}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-surface-300 hover:bg-surface-800 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Markdown (.md)
                  </button>
                  <button
                    onClick={() => handleExport('html')}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-surface-300 hover:bg-surface-800 transition-colors"
                  >
                    <FileCode className="w-4 h-4" />
                    HTML (.html)
                  </button>
                </div>
              )}
            </div>
          )}

          <button onClick={handleSave} className="btn-ghost btn-sm">
            <Save className="w-4 h-4" />
            保存
          </button>

          <button
            onClick={() => handleStreamGenerate(title || prompt || '新博客主题')}
            disabled={isGenerating}
            className="btn-primary btn-sm"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            重写
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Outline Sidebar */}
        {showOutline && outline && (
          <OutlineSidebar outline={outline} onClose={() => setShowOutline(false)} />
        )}

        {/* Editor / Preview */}
        <div className="flex-1 overflow-auto">
          {showPreview ? (
            <div className="max-w-3xl mx-auto px-8 py-8">
              <div
                className="prose-custom"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
              />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-8 py-8">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="AI 生成的内容将显示在这里，你也可以直接编辑..."
                className="w-full min-h-[calc(100vh-16rem)] bg-transparent text-surface-200 text-base leading-7 resize-none focus:outline-none placeholder:text-surface-600 font-mono"
              />
            </div>
          )}
        </div>

        {/* SEO Dashboard */}
        {seoAnalysis && (
          <SEODashboard
            analysis={seoAnalysis}
            blogTitle={title}
            blogContent={content}
          />
        )}
      </div>
    </div>
  );
}

// 简单的 Markdown 渲染
function renderMarkdown(md: string): string {
  let html = md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^---$/gm, '<hr />')
    .replace(/^\|(.+)\|$/gm, (match) => {
      if (match.includes('---')) return '';
      const cells = match
        .split('|')
        .filter(Boolean)
        .map((c) => `<td>${c.trim()}</td>`)
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .replace(/^(?!<[a-z]|$)(.+)$/gm, '<p>$1</p>')
    .replace(/<\/p>\n<p>/g, '</p><p>')
    .replace(/<\/blockquote>\n<blockquote>/g, '<br />');

  return html;
}