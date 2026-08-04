# 灵笔 (LingBi) — AI 博客生成工具

> 输入一个主题，AI 自动完成从大纲到正文的全流程创作，并实时给出 SEO 优化建议。

## 功能概览

### 核心创作流程
- **提示词输入** — 一句话描述主题，支持多种语言和写作风格
- **AI 流式生成** — SSE 实时推送大纲 → 正文 → SEO 分析三步流水线
- **三栏编辑器** — 左侧大纲导航 + 中间 Markdown 编辑/预览 + 右侧 SEO 面板

### 深度 SEO 优化
- **6 维度评分** — 标题优化、关键词密度、内容结构、可读性、内链机会、元描述
- **SERP 预览** — Google 搜索结果实时预览，SEO 标题/描述字符计数
- **关键词分析** — 主/次关键词密度可视化，理想区间标注，各位置分布统计
- **检查清单** — 逐项 SEO 检查，分类展示通过/未通过项

### 博客管理
- 列表搜索、状态筛选、分页
- 博客详情编辑、保存、删除
- 导出 Markdown / HTML（含完整 SEO 元数据）

### 数据分析
- 总博客数、平均 SEO 分、已发布数、AI 生成次数
- SEO 评分趋势柱状图
- 博客状态分布
- 最近创作列表

### 用户体验
- 暗/亮色主题切换
- 自动保存 + 草稿恢复（localStorage）
- 键盘快捷键支持
- 全局错误边界和 404 页面
- 响应式设计（移动端适配）

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) + TypeScript |
| 样式 | Tailwind CSS |
| 数据库 | PostgreSQL + Prisma ORM |
| 认证 | NextAuth.js (Credentials Provider) |
| AI | OpenAI 兼容 API (GPT-4o) |
| 部署 | Docker + docker-compose |

## 快速开始

### 环境要求
- Node.js 20+
- PostgreSQL 16+
- OpenAI API Key（或兼容接口）

### 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local，填入 DATABASE_URL 和 OPENAI_API_KEY

# 3. 初始化数据库
npx prisma db push
npx prisma db seed

# 4. 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### Docker 部署

```bash
# 1. 创建 .env 文件
cp .env.local.example .env
# 编辑 .env，填入 OPENAI_API_KEY 和 NEXTAUTH_SECRET

# 2. 一键启动
docker-compose up -d

# 3. 查看日志
docker-compose logs -f app
```

应用启动在 http://localhost:3000，PostgreSQL 在 localhost:5432。

### 演示账号

种子数据包含一个演示用户：
- 邮箱：`demo@lingbi.com`
- 密码：`demo123456`

## 项目结构

```
lingbi-app/
├── app/                        # Next.js App Router
│   ├── (dashboard)/            # 需要登录的路由组
│   │   ├── page.tsx            # 创作中心
│   │   ├── editor/             # 新建博客
│   │   ├── blogs/              # 博客列表 + 详情
│   │   ├── analytics/          # 数据分析
│   │   └── settings/           # 用户设置
│   ├── api/                    # API 路由
│   │   ├── auth/               # 认证 (NextAuth + 注册)
│   │   ├── generate/           # AI 生成 (一次性 + SSE 流式)
│   │   ├── blogs/              # 博客 CRUD + 导出
│   │   ├── seo/                # SEO 分析
│   │   └── stats/              # 用户统计
│   ├── auth/                   # 登录/注册页面
│   ├── layout.tsx              # 根布局
│   ├── page.tsx                # 落地页
│   ├── not-found.tsx           # 404 页面
│   └── globals.css             # 全局样式
├── components/
│   ├── layout/                 # Header, Providers, ErrorBoundary, ThemeProvider
│   ├── editor/                 # Editor, SEOPanel, OutlineSidebar
│   ├── seo/                    # SEODashboard, SERPPreview, KeywordDensityChart
│   ├── blog/                   # BlogCard, BlogList, AnalyticsPanel
│   └── ui/                     # Loading, EmptyState
├── lib/
│   ├── ai.ts                   # AI 服务调用 (OpenAI 兼容)
│   ├── auth.ts                 # NextAuth 配置
│   ├── db.ts                   # Prisma Client
│   ├── utils.ts                # 工具函数
│   └── hooks/                  # React Hooks (useAutoSave, useKeyboardShortcuts)
├── types/                      # TypeScript 类型定义
├── prisma/
│   ├── schema.prisma           # 数据库 Schema
│   └── seed.ts                 # 种子数据
├── middleware.ts               # 路由守卫
├── Dockerfile                  # Docker 构建
├── docker-compose.yml          # 容器编排
└── package.json
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/[...nextauth]` | 登录/登出 (NextAuth) |
| POST | `/api/generate` | 一次性生成博客 |
| POST | `/api/generate/stream` | SSE 流式生成 |
| GET | `/api/blogs` | 获取博客列表 |
| POST | `/api/blogs` | 创建博客 |
| GET | `/api/blogs/[id]` | 获取博客详情 |
| PATCH | `/api/blogs/[id]` | 更新博客 |
| DELETE | `/api/blogs/[id]` | 删除博客 |
| GET | `/api/blogs/[id]/export` | 导出博客 (markdown/html) |
| POST | `/api/seo` | SEO 分析 |
| GET | `/api/seo` | 获取 SEO 分析历史 |
| GET | `/api/stats` | 获取用户统计数据 |

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | — |
| `NEXTAUTH_URL` | 应用 URL | http://localhost:3000 |
| `NEXTAUTH_SECRET` | NextAuth 密钥 | — |
| `OPENAI_API_KEY` | OpenAI API 密钥 | — |
| `OPENAI_BASE_URL` | AI 服务地址 | https://api.openai.com/v1 |
| `AI_MODEL` | 使用的模型 | gpt-4o |

## 开发路线图

### Phase 1 — MVP 核心生成流程 ✅
- 项目脚手架、类型定义、数据库 Schema
- 认证系统 (注册/登录)
- AI 生成 API (大纲 → 正文 → SEO)
- 三栏编辑器 (大纲 + 编辑 + SEO 面板)
- 博客 CRUD 和列表管理

### Phase 2 — 深度 SEO 集成 ✅
- SSE 流式生成 API
- SEODashboard 四标签页 (总览/关键词/SERP/检查清单)
- SERP 预览和元数据编辑器
- 关键词密度可视化
- 博客导出 (Markdown/HTML)
- 数据分析面板
- 用户设置页面

### Phase 3 — 体验打磨 ✅
- Docker 部署配置
- 自动保存 + 草稿恢复
- 键盘快捷键系统
- 全局错误边界和 404 页面
- 暗/亮色主题切换

## License

MIT