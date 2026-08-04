import Link from 'next/link';
import { Home, FileText } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="text-8xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">页面不存在</h1>
        <p className="text-surface-400 mb-8">
          你访问的页面可能已被移动或删除。
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="btn-primary">
            <Home className="w-4 h-4" />
            返回首页
          </Link>
          <Link href="/dashboard" className="btn-secondary">
            <FileText className="w-4 h-4" />
            创作中心
          </Link>
        </div>
      </div>
    </div>
  );
}