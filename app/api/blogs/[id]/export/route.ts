import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/blogs/[id]/export?format=markdown|html
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const blog = await prisma.blog.findUnique({
      where: { id: params.id },
      include: { tags: true },
    });

    if (!blog) {
      return NextResponse.json(
        { success: false, error: '博客不存在' },
        { status: 404 }
      );
    }

    if (blog.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: '无权操作' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'markdown';

    const tags = blog.tags.map((t) => t.tagName);
    const date = blog.createdAt.toISOString().split('T')[0];

    if (format === 'markdown') {
      const header = `---
title: "${blog.title}"
date: ${date}
tags: [${tags.map((t) => `"${t}"`).join(', ')}]
seo_score: ${blog.seoScore || 'N/A'}
word_count: ${blog.wordCount || 'N/A'}
---\n\n`;

      const markdown = header + blog.content;

      return new Response(markdown, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="${sanitizeFilename(blog.title)}.md"`,
        },
      });
    }

    if (format === 'html') {
      const html = generateHTML(blog.title, blog.content, tags, {
        seoScore: blog.seoScore,
        wordCount: blog.wordCount,
        date,
      });

      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="${sanitizeFilename(blog.title)}.html"`,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: '不支持的导出格式' },
      { status: 400 }
    );
  } catch (error) {
    console.error('导出失败:', error);
    return NextResponse.json(
      { success: false, error: '导出失败' },
      { status: 500 }
    );
  }
}

function sanitizeFilename(title: string): string {
  return title
    .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .substring(0, 60);
}

function generateHTML(
  title: string,
  content: string,
  tags: string[],
  meta: { seoScore: number | null; wordCount: number | null; date: string }
): string {
  const bodyHtml = markdownToHtml(content);

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${content.substring(0, 160).replace(/"/g, '&quot;')}">
  <meta name="keywords" content="${tags.join(', ')}">
  <meta name="author" content="灵笔 AI">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${content.substring(0, 160).replace(/"/g, '&quot;')}">
  <meta property="og:type" content="article">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.8;
      color: #1a1a2e;
      background: #fafafa;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    h1 { font-size: 2.2rem; margin: 1.5rem 0 1rem; color: #16213e; }
    h2 { font-size: 1.6rem; margin: 2rem 0 1rem; color: #16213e; border-bottom: 2px solid #e0e0e0; padding-bottom: 0.5rem; }
    h3 { font-size: 1.3rem; margin: 1.5rem 0 0.8rem; color: #0f3460; }
    p { margin: 1rem 0; color: #333; }
    ul, ol { margin: 1rem 0; padding-left: 2rem; }
    li { margin: 0.5rem 0; }
    blockquote {
      border-left: 4px solid #6366f1;
      padding: 0.5rem 1rem;
      margin: 1.5rem 0;
      background: #f0f0ff;
      color: #555;
      font-style: italic;
    }
    code {
      background: #f0f0f0;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      font-family: 'Menlo', monospace;
      font-size: 0.9em;
      color: #c026d3;
    }
    pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1.5rem 0;
    }
    pre code { background: none; color: inherit; padding: 0; }
    a { color: #6366f1; text-decoration: none; }
    a:hover { text-decoration: underline; }
    strong { color: #16213e; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
    th, td { border: 1px solid #e0e0e0; padding: 0.6rem 1rem; text-align: left; }
    th { background: #f5f5f5; font-weight: 600; }
    hr { border: none; border-top: 1px solid #e0e0e0; margin: 2rem 0; }
    .meta {
      font-size: 0.85rem;
      color: #888;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }
    .tag {
      display: inline-block;
      background: #f0f0ff;
      color: #6366f1;
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      font-size: 0.8rem;
      margin-right: 0.3rem;
    }
    .footer {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid #eee;
      text-align: center;
      color: #aaa;
      font-size: 0.85rem;
    }
  </style>
</head>
<body>
  <div class="meta">
    <span>${meta.date}</span> · 
    ${meta.wordCount ? `${meta.wordCount} 字 · ` : ''}
    ${meta.seoScore ? `SEO ${meta.seoScore}分 · ` : ''}
    ${tags.map((t) => `<span class="tag">${t}</span>`).join('')}
  </div>
  ${bodyHtml}
  <div class="footer">
    本文由 <strong>灵笔 AI</strong> 辅助生成 · <a href="https://lingbi.app">lingbi.app</a>
  </div>
</body>
</html>`;
}

function markdownToHtml(md: string): string {
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

  // Wrap table rows
  html = html.replace(/(<tr>[\s\S]*?<\/tr>)/g, '<table>$1</table>');
  html = html.replace(/<\/table>\n<table>/g, '');

  return html;
}