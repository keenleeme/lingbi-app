import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/layout/Providers';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '灵笔 - AI 博客生成工具',
  description: '智能创作 + SEO 自动优化，让每一篇博客都能被搜索引擎看见',
  keywords: ['AI博客', 'SEO优化', '内容创作', '博客生成'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={inter.className}>
        <ThemeProvider>
          <Providers>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: '#1e293b',
                  color: '#f8fafc',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                },
              }}
            />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}