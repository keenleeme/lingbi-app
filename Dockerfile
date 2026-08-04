# ---------- 构建阶段 ----------
FROM node:20-alpine AS builder

WORKDIR /app

# 安装依赖
COPY package.json package-lock.json* ./
RUN npm ci

# 复制源码
COPY . .

# 确保关键目录存在（避免 Docker COPY 因目录不存在而失败）
RUN mkdir -p public prisma

# 生成 Prisma Client
RUN npx prisma generate

# 构建
RUN npm run build

# ---------- 运行阶段 ----------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 安装必要的系统依赖
RUN apk add --no-cache libc6-compat

# 确保目标目录存在，再复制
RUN mkdir -p public .next/static prisma node_modules/.prisma node_modules/@prisma

COPY --from=builder /app/public/ ./public/
COPY --from=builder /app/.next/standalone/ ./
COPY --from=builder /app/.next/static/ ./.next/static/
COPY --from=builder /app/prisma/ ./prisma/
COPY --from=builder /app/node_modules/.prisma/ ./node_modules/.prisma/
COPY --from=builder /app/node_modules/@prisma/ ./node_modules/@prisma/

# 复制 package.json 用于 prisma 命令
COPY package.json ./

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 启动前执行数据库迁移
CMD ["sh", "-c", "npx prisma db push --skip-generate && node server.js"]