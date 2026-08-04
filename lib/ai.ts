import { BlogOutline, SEOAnalysis, StreamEvent } from '@/types';

// ---------- 配置 ----------
const AI_CONFIG = {
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  model: process.env.AI_MODEL || 'gpt-4o',
  maxTokens: 4096,
  temperature: 0.7,
};

// ---------- 系统提示词 ----------
const SYSTEM_PROMPTS = {
  outline: `你是一位资深的内容策略师和 SEO 专家。根据用户提供的主题，生成一份结构清晰、SEO 友好的博客大纲。

要求：
1. 大纲包含 3-5 个主要章节（H2），每个章节包含 2-3 个子要点
2. 每个要点标注核心关键词（用于 SEO 优化）
3. 考虑搜索意图，确保内容覆盖用户真正想了解的问题
4. 输出格式为严格的 JSON，结构如下：
{
  "sections": [
    {
      "id": "s1",
      "title": "章节标题",
      "level": 2,
      "keyPoints": ["要点1", "要点2"],
      "children": [
        { "id": "s1-1", "title": "子标题", "level": 3, "keyPoints": ["子要点"] }
      ]
    }
  ]
}`,

  draft: `你是一位资深博客作者，擅长撰写信息丰富、引人入胜的长文内容。请根据提供的大纲和用户要求，生成一篇完整的博客文章。

写作要求：
1. 使用 Markdown 格式，H1 为文章标题，H2/H3 对应大纲结构
2. 开头用引人入胜的导语（hook），直接切入主题
3. 每个章节包含实质性内容，用数据、案例或引用支撑观点
4. 段落长度适中（3-6 句），便于在线阅读
5. 自然融入关键词，不过度堆砌
6. 结尾有总结或行动号召
7. 总字数根据用户要求调整：短篇 800-1500 字，中篇 1500-3000 字，长篇 3000-5000 字`,

  seo: `你是一位 SEO 分析专家。请对以下博客文章进行全面的 SEO 分析，输出 JSON 格式：

{
  "totalScore": 85,
  "dimensions": [
    { "name": "标题优化", "score": 8, "maxScore": 10, "suggestions": ["建议"] },
    { "name": "关键词密度", "score": 7, "maxScore": 10, "suggestions": [] },
    { "name": "内容结构", "score": 9, "maxScore": 10, "suggestions": [] },
    { "name": "可读性", "score": 8, "maxScore": 10, "suggestions": [] },
    { "name": "内链机会", "score": 6, "maxScore": 10, "suggestions": [] },
    { "name": "元描述", "score": 9, "maxScore": 10, "suggestions": [] }
  ],
  "checklist": [
    { "id": "c1", "label": "标题包含主要关键词", "passed": true, "category": "标题" },
    { "id": "c2", "label": "H2/H3 层级合理", "passed": true, "category": "结构" }
  ],
  "keywordData": {
    "primaryKeyword": "主要关键词",
    "secondaryKeywords": ["次要1", "次要2"],
    "density": 2.5,
    "suggestions": ["建议增加长尾关键词"]
  }
}`,
};

// ---------- 核心 API 调用 ----------
async function callAI(
  systemPrompt: string,
  userMessage: string,
  jsonMode = false
): Promise<string> {
  const response = await fetch(`${AI_CONFIG.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: AI_CONFIG.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API 调用失败: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// ---------- 流式生成 ----------
export async function* generateStream(
  prompt: string,
  topicType?: string,
  language = 'zh-CN',
  style = '专业',
  length: 'short' | 'medium' | 'long' = 'medium'
): AsyncGenerator<StreamEvent> {
  try {
    // Step 1: 生成大纲
    yield { type: 'outline', message: '正在分析主题，生成大纲...' };

    const outlinePrompt = `主题：${prompt}\n类型：${topicType || '通用'}\n语言：${language}\n风格：${style}`;
    const outlineRaw = await callAI(SYSTEM_PROMPTS.outline, outlinePrompt, true);
    const outline: BlogOutline = JSON.parse(outlineRaw);

    yield { type: 'outline', data: outline, message: '大纲生成完成' };

    // Step 2: 生成正文
    yield { type: 'content', message: '正在撰写博客内容...' };

    const lengthMap = { short: '800-1500字', medium: '1500-3000字', long: '3000-5000字' };
    const draftPrompt = `主题：${prompt}\n大纲：${JSON.stringify(outline, null, 2)}\n语言：${language}\n风格：${style}\n字数要求：${lengthMap[length]}`;
    const content = await callAI(SYSTEM_PROMPTS.draft, draftPrompt);

    yield { type: 'content', data: content, message: '内容生成完成' };

    // Step 3: SEO 分析
    yield { type: 'seo', message: '正在进行 SEO 分析...' };

    const seoPrompt = `请分析以下博客文章的 SEO 表现：\n\n标题：${extractTitle(content)}\n内容摘要：${content.substring(0, 3000)}`;
    const seoRaw = await callAI(SYSTEM_PROMPTS.seo, seoPrompt, true);
    const seoAnalysis: SEOAnalysis = JSON.parse(seoRaw);

    yield { type: 'seo', data: seoAnalysis, message: 'SEO 分析完成' };

    // Done
    yield { type: 'done', data: { content, outline, seoAnalysis }, message: '全部生成完成' };
  } catch (error) {
    yield {
      type: 'error',
      message: error instanceof Error ? error.message : '生成过程中发生未知错误',
    };
  }
}

// ---------- 非流式生成（一次性返回） ----------
export async function generateBlog(
  prompt: string,
  options: {
    topicType?: string;
    language?: string;
    style?: string;
    length?: 'short' | 'medium' | 'long';
  } = {}
): Promise<{ content: string; outline: BlogOutline; seoAnalysis: SEOAnalysis }> {
  const { topicType, language = 'zh-CN', style = '专业', length = 'medium' } = options;

  // 1. 生成大纲
  const outlinePrompt = `主题：${prompt}\n类型：${topicType || '通用'}\n语言：${language}\n风格：${style}`;
  const outlineRaw = await callAI(SYSTEM_PROMPTS.outline, outlinePrompt, true);
  const outline: BlogOutline = JSON.parse(outlineRaw);

  // 2. 生成正文
  const lengthMap = { short: '800-1500字', medium: '1500-3000字', long: '3000-5000字' };
  const draftPrompt = `主题：${prompt}\n大纲：${JSON.stringify(outline, null, 2)}\n语言：${language}\n风格：${style}\n字数要求：${lengthMap[length]}`;
  const content = await callAI(SYSTEM_PROMPTS.draft, draftPrompt);

  // 3. SEO 分析
  const seoPrompt = `请分析以下博客文章的 SEO 表现：\n\n标题：${extractTitle(content)}\n内容摘要：${content.substring(0, 3000)}`;
  const seoRaw = await callAI(SYSTEM_PROMPTS.seo, seoPrompt, true);
  const seoAnalysis: SEOAnalysis = JSON.parse(seoRaw);

  return { content, outline, seoAnalysis };
}

// ---------- 辅助函数 ----------
function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1] : '未命名';
}

export function extractKeywords(content: string): string[] {
  // 提取 Markdown 标题中的关键词
  const headings = content.match(/^#{1,3}\s+(.+)/gm) || [];
  return headings.map((h) => h.replace(/^#{1,3}\s+/, '').trim());
}

export function countWords(content: string): number {
  // 中文字符 + 英文单词
  const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
  return chineseChars + englishWords;
}