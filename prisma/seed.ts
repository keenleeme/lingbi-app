import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始初始化种子数据...');

  // 创建演示用户
  const passwordHash = await hash('demo123456', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@lingbi.com' },
    update: {},
    create: {
      name: '演示用户',
      email: 'demo@lingbi.com',
      passwordHash,
    },
  });

  console.log(`✅ 演示用户已创建: ${user.email} (密码: demo123456)`);

  // 创建示例博客
  const sampleBlogs = [
    {
      title: '2026 年远程办公效率指南',
      prompt: '远程办公效率指南',
      content: `# 2026 年远程办公效率指南

## 引言

远程办公已成为全球 62% 知识工作者的默认工作方式。但大多数团队仍然没有找到真正高效的远程协作模式。

## 核心策略

### 异步优先的沟通模式

高效的远程团队无一例外地采用异步协作作为默认工作模式。核心原则包括：

1. 文档化一切决策
2. 设定合理的响应期待
3. 建立深度工作时间块

### 工具选择与流程优化

选择合适的工具组合是远程协作的基础。推荐工具栈：

- 即时通讯：Slack / 飞书
- 文档协作：Notion / 飞书文档
- 项目管理：Linear / 飞书多维表格
- 视频会议：Zoom / 飞书会议

## 总结

远程办公不是权宜之计，而是需要系统化设计的全新工作模式。`,
    },
    {
      title: 'AI 如何改变内容创作行业',
      prompt: 'AI 内容创作',
      content: `# AI 如何改变内容创作行业

## 行业变革

AI 正在从根本上改变内容创作的每一个环节，从选题策划到最终发布。

## 关键影响

### 效率提升

AI 工具可以将内容创作效率提升 5-10 倍，让创作者有更多时间专注于策略和创意。

### 质量保障

AI 辅助的语法检查、风格优化和 SEO 分析，显著提升了内容质量的下限。

## 未来展望

AI 不会取代创作者，但使用 AI 的创作者会取代不使用的。`,
    },
  ];

  for (const blog of sampleBlogs) {
    await prisma.blog.create({
      data: {
        userId: user.id,
        title: blog.title,
        prompt: blog.prompt,
        content: blog.content,
        status: 'COMPLETED',
        wordCount: blog.content.length,
        seoScore: 75,
        tags: {
          create: [{ tagName: 'AI创作' }, { tagName: '效率' }],
        },
      },
    });
  }

  console.log(`✅ 示例博客已创建 (${sampleBlogs.length} 篇)`);
  console.log('🎉 种子数据初始化完成！');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });