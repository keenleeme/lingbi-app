// ============================================================
// 灵笔 (LingBi) - 核心类型定义
// ============================================================

// ---------- 用户 ----------
export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: string;
}

// ---------- 博客 ----------
export type BlogStatus = 'DRAFT' | 'GENERATING' | 'COMPLETED' | 'PUBLISHED' | 'ARCHIVED';

export interface BlogOutline {
  sections: OutlineSection[];
}

export interface OutlineSection {
  id: string;
  title: string;
  level: 1 | 2 | 3;
  keyPoints: string[];
  children?: OutlineSection[];
}

export interface SEOMeta {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

export interface SEODimension {
  name: string;
  score: number;
  maxScore: number;
  suggestions: string[];
}

export interface SEOAnalysis {
  totalScore: number;
  dimensions: SEODimension[];
  checklist: SEOCheckItem[];
  keywordData?: KeywordData;
}

export interface SEOCheckItem {
  id: string;
  label: string;
  passed: boolean;
  category: string;
}

export interface KeywordData {
  primaryKeyword: string;
  secondaryKeywords: string[];
  density: number;
  suggestions: string[];
}

export interface Blog {
  id: string;
  userId: string;
  title: string;
  content: string;
  prompt: string;
  status: BlogStatus;
  topicType: string | null;
  outline: BlogOutline | null;
  keywords: string[] | null;
  seoScore: number | null;
  wordCount: number | null;
  seoMeta: SEOMeta | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// ---------- 生成 ----------
export type GenerationStep = 'OUTLINE' | 'DRAFT' | 'SEO_ANALYSIS' | 'REFINE';

export interface GenerateRequest {
  prompt: string;
  topicType?: string;
  keywords?: string[];
  language?: string;
  style?: string;
  length?: 'short' | 'medium' | 'long';
}

export interface GenerateResponse {
  blogId: string;
  outline: BlogOutline;
  message: string;
}

export interface GenerationResult {
  content: string;
  outline: BlogOutline;
  seoAnalysis: SEOAnalysis;
}

export interface StreamEvent {
  type: 'outline' | 'content' | 'seo' | 'done' | 'error';
  data?: string | BlogOutline | SEOAnalysis | GenerationResult;
  message?: string;
}

// ---------- API 响应 ----------
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ---------- 表单 ----------
export interface BlogFormData {
  title: string;
  content: string;
  tags: string[];
  status: BlogStatus;
}