import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** 合并 Tailwind CSS 类名 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 格式化日期 */
export function formatDate(date: string | Date, locale = 'zh-CN'): string {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** 格式化相对时间 */
export function timeAgo(date: string | Date): string {
  const now = Date.now();
  const past = new Date(date).getTime();
  const diff = now - past;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 30) return `${days} 天前`;
  return formatDate(date);
}

/** 状态标签映射 */
export const STATUS_LABELS: Record<string, string> = {
  DRAFT: '草稿',
  GENERATING: '生成中',
  COMPLETED: '已完成',
  PUBLISHED: '已发布',
  ARCHIVED: '已归档',
};

/** 状态颜色映射 */
export const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-surface-200 text-surface-600',
  GENERATING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  PUBLISHED: 'bg-primary-100 text-primary-700',
  ARCHIVED: 'bg-surface-300 text-surface-500',
};

/** 截断文本 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

/** 从 Markdown 提取纯文本预览 */
export function extractPreview(markdown: string, maxLength = 200): string {
  const plain = markdown
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~`>]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  return truncate(plain, maxLength);
}

/** 估算阅读时间（分钟） */
export function readingTime(content: string): number {
  const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
  // 中文约 400 字/分钟，英文约 200 词/分钟
  const minutes = Math.ceil(chineseChars / 400 + englishWords / 200);
  return Math.max(1, minutes);
}