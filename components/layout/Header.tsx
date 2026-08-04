'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  PenLine,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';

const NAV_ITEMS = [
  { href: '/dashboard', label: '创作中心', icon: PenLine },
  { href: '/dashboard/editor', label: '新建博客', icon: Sparkles },
  { href: '/dashboard/blogs', label: '我的博客', icon: FileText },
  { href: '/dashboard/analytics', label: '数据分析', icon: BarChart3 },
  { href: '/dashboard/settings', label: '设置', icon: Settings },
];

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-surface-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors">
              灵笔
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary-500/10 text-primary-400'
                      : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href="/dashboard/editor"
                  className="btn-primary btn-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  新建博客
                </Link>
                <div className="flex items-center gap-2 pl-3 border-l border-surface-700">
                  <ThemeToggle />
                  <Link
                    href="/dashboard"
                    className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center"
                  >
                    <User className="w-4 h-4 text-primary-400" />
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="btn-ghost btn-sm text-surface-500 hover:text-surface-300"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="btn-ghost btn-sm">
                  登录
                </Link>
                <Link href="/auth/register" className="btn-primary btn-sm">
                  免费注册
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden btn-ghost p-2"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 border-t border-surface-700/50 pt-3 animate-enter">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary-500/10 text-primary-400'
                      : 'text-surface-400 hover:text-surface-200'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-2 pt-3 border-t border-surface-700/50">
              {session ? (
                <button
                  onClick={() => {
                    signOut({ callbackUrl: '/' });
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-400 hover:text-surface-200 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              ) : (
                <div className="flex gap-2 px-3">
                  <Link href="/auth/login" className="btn-secondary btn-sm flex-1">
                    登录
                  </Link>
                  <Link href="/auth/register" className="btn-primary btn-sm flex-1">
                    注册
                  </Link>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}