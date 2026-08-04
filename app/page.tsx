import Link from 'next/link';
import { Sparkles, Zap, TrendingUp, FileText, PenLine, BarChart3, ArrowRight, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-surface-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">灵笔</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="btn-ghost">登录</Link>
            <Link href="/auth/register" className="btn-primary">免费注册</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm mb-8">
          <Sparkles className="w-4 h-4" />
          AI 驱动的智能博客创作平台
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          让每一篇博客
          <br />
          <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent">
            都能被搜索引擎看见
          </span>
        </h1>
        <p className="text-lg md:text-xl text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          输入一个主题，灵笔自动完成从大纲到正文的全流程创作，
          并实时给出 SEO 优化建议，让你的内容获得更多自然流量。
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/register" className="btn-primary text-lg px-8 py-4">
            免费开始创作
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/auth/login" className="btn-secondary text-lg px-8 py-4">
            已有账号？登录
          </Link>
        </div>

        {/* 数据展示 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto mt-16">
          <div className="glass-card p-5">
            <div className="text-2xl font-bold text-white mb-1">AI 驱动</div>
            <div className="text-sm text-surface-500">GPT-4o 级别模型</div>
          </div>
          <div className="glass-card p-5">
            <div className="text-2xl font-bold text-primary-400 mb-1">SEO 优化</div>
            <div className="text-sm text-surface-500">实时评分与建议</div>
          </div>
          <div className="glass-card p-5">
            <div className="text-2xl font-bold text-green-400 mb-1">秒级生成</div>
            <div className="text-sm text-surface-500">大纲到全文一键完成</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            三步完成高质量博客创作
          </h2>
          <p className="text-surface-400 max-w-xl mx-auto">
            不需要复杂的配置，也不需要 SEO 专业知识，灵笔让创作回归简单
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: PenLine,
              step: '01',
              title: '输入主题',
              desc: '只需一句话描述你的博客主题，可以是关键词、问题或完整标题。灵笔支持多种语言和风格。',
            },
            {
              icon: Zap,
              step: '02',
              title: 'AI 自动生成',
              desc: '灵笔自动分析主题，生成结构化大纲，撰写完整文章，整个过程仅需数十秒。',
            },
            {
              icon: TrendingUp,
              step: '03',
              title: 'SEO 优化发布',
              desc: '获得实时 SEO 评分和优化建议，一键优化关键词、标题、结构，发布即可获得搜索流量。',
            },
          ].map((feature) => (
            <div key={feature.step} className="glass-card p-6 group hover:border-primary-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-primary-400" />
                </div>
                <span className="text-sm font-bold text-surface-600">{feature.step}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-surface-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SEO Feature Highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="glass-card p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs mb-4">
                <BarChart3 className="w-3.5 h-3.5" />
                核心差异化能力
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                不只是生成内容，更是 SEO 优化引擎
              </h2>
              <p className="text-surface-400 mb-6 leading-relaxed">
                每篇文章生成后，灵笔自动进行 6 维度 SEO 分析：标题优化、关键词密度、内容结构、可读性、内链机会、元描述。每一项都有具体的优化建议，让你知道从何改起。
              </p>
              <ul className="space-y-3">
                {[
                  '实时 SEO 评分，立即了解优化空间',
                  '关键词密度分析，避免过度优化',
                  '结构化检查清单，逐项优化',
                  '元描述自动生成，提升点击率',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-surface-300">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-surface-800/50 rounded-2xl p-6 border border-surface-700/50">
              <div className="text-xs text-surface-500 uppercase tracking-wider mb-4">SEO 评分预览</div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-surface-800 border-2 border-green-500/30 flex items-center justify-center text-3xl font-bold text-green-400">
                  78
                </div>
                <div>
                  <div className="text-sm font-semibold text-green-400">良好</div>
                  <div className="text-xs text-surface-500">综合评分</div>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: '标题优化', score: 80 },
                  { label: '关键词密度', score: 70 },
                  { label: '内容结构', score: 90 },
                  { label: '可读性', score: 80 },
                  { label: '内链机会', score: 60 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-surface-400">{item.label}</span>
                      <span className="text-surface-500">{item.score}/100</span>
                    </div>
                    <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.score >= 80 ? 'bg-green-500' : item.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-700/50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-white font-semibold">灵笔</span>
          </div>
          <p className="text-sm text-surface-500">
            AI 驱动的内容创作与 SEO 优化平台
          </p>
        </div>
      </footer>
    </main>
  );
}