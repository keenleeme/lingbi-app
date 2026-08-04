'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/Loading';
import { Save, User, Palette, FileText, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserPreferences {
  defaultLanguage: string;
  defaultStyle: string;
  defaultLength: string;
  defaultTopicType: string;
  autoSeoAnalysis: boolean;
  emailNotifications: boolean;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [prefs, setPrefs] = useState<UserPreferences>({
    defaultLanguage: 'zh-CN',
    defaultStyle: '专业',
    defaultLength: 'medium',
    defaultTopicType: '通用',
    autoSeoAnalysis: true,
    emailNotifications: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session) return null;

  const handleSave = () => {
    setLoading(true);
    // 模拟保存（实际项目中调用 API）
    setTimeout(() => {
      setLoading(false);
      toast.success('设置已保存');
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">设置</h1>
        <p className="text-sm text-surface-500">管理你的账号和创作偏好</p>
      </div>

      {/* 账号信息 */}
      <section className="glass-card p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-primary-400" />
          <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
            账号信息
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-surface-400 mb-1.5">用户名</label>
            <input
              defaultValue={session.user?.name || ''}
              className="input-field"
              placeholder="用户名"
            />
          </div>
          <div>
            <label className="block text-sm text-surface-400 mb-1.5">邮箱</label>
            <input
              defaultValue={session.user?.email || ''}
              disabled
              className="input-field opacity-60 cursor-not-allowed"
            />
          </div>
        </div>
      </section>

      {/* 创作偏好 */}
      <section className="glass-card p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Palette className="w-4 h-4 text-primary-400" />
          <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
            创作偏好
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-surface-400 mb-1.5">默认语言</label>
            <select
              value={prefs.defaultLanguage}
              onChange={(e) => setPrefs({ ...prefs, defaultLanguage: e.target.value })}
              className="input-field"
            >
              <option value="zh-CN">中文</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-surface-400 mb-1.5">默认风格</label>
            <select
              value={prefs.defaultStyle}
              onChange={(e) => setPrefs({ ...prefs, defaultStyle: e.target.value })}
              className="input-field"
            >
              <option value="专业">专业</option>
              <option value="轻松">轻松</option>
              <option value="教程">教程</option>
              <option value="评论">评论</option>
              <option value="故事">故事</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-surface-400 mb-1.5">默认篇幅</label>
            <select
              value={prefs.defaultLength}
              onChange={(e) => setPrefs({ ...prefs, defaultLength: e.target.value })}
              className="input-field"
            >
              <option value="short">短篇 (800-1500字)</option>
              <option value="medium">中篇 (1500-3000字)</option>
              <option value="long">长篇 (3000-5000字)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-surface-400 mb-1.5">默认类型</label>
            <select
              value={prefs.defaultTopicType}
              onChange={(e) => setPrefs({ ...prefs, defaultTopicType: e.target.value })}
              className="input-field"
            >
              <option value="通用">通用</option>
              <option value="技术">技术</option>
              <option value="营销">营销</option>
              <option value="教育">教育</option>
              <option value="生活方式">生活方式</option>
            </select>
          </div>
        </div>
      </section>

      {/* 功能设置 */}
      <section className="glass-card p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <FileText className="w-4 h-4 text-primary-400" />
          <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
            功能设置
          </h2>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm text-surface-200">自动 SEO 分析</div>
              <div className="text-xs text-surface-500 mt-0.5">
                生成博客后自动进行 SEO 分析
              </div>
            </div>
            <Toggle
              checked={prefs.autoSeoAnalysis}
              onChange={(v) => setPrefs({ ...prefs, autoSeoAnalysis: v })}
            />
          </label>
        </div>
      </section>

      {/* 通知设置 */}
      <section className="glass-card p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-4 h-4 text-primary-400" />
          <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
            通知设置
          </h2>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm text-surface-200">邮件通知</div>
              <div className="text-xs text-surface-500 mt-0.5">
                接收博客生成完成等通知
              </div>
            </div>
            <Toggle
              checked={prefs.emailNotifications}
              onChange={(v) => setPrefs({ ...prefs, emailNotifications: v })}
            />
          </label>
        </div>
      </section>

      {/* 保存按钮 */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={loading} className="btn-primary">
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              保存中...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              保存设置
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? 'bg-primary-500' : 'bg-surface-600'
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}