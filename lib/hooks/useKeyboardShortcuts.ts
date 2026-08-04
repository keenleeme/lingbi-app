import { useEffect, useCallback } from 'react';

type ShortcutModifier = 'ctrl' | 'cmd' | 'shift' | 'alt';
type ShortcutKey = string;

interface ShortcutHandler {
  key: ShortcutKey;
  modifiers?: ShortcutModifier[];
  handler: (e: KeyboardEvent) => void;
  preventDefault?: boolean;
}

/**
 * 键盘快捷键 Hook
 * 注册全局快捷键，自动处理修饰键检测
 */
export function useKeyboardShortcuts(handlers: ShortcutHandler[]) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      for (const shortcut of handlers) {
        const { key, modifiers = [], handler, preventDefault = true } = shortcut;

        // 检查修饰键
        const ctrlRequired = modifiers.includes('ctrl');
        const cmdRequired = modifiers.includes('cmd');
        const shiftRequired = modifiers.includes('shift');
        const altRequired = modifiers.includes('alt');

        const ctrlOrCmd = e.ctrlKey || e.metaKey;
        const matchesCtrl = ctrlRequired || cmdRequired ? ctrlOrCmd : !ctrlOrCmd;
        const matchesShift = shiftRequired ? e.shiftKey : true;
        const matchesAlt = altRequired ? e.altKey : !e.altKey;

        // 键不区分大小写
        const matchesKey = e.key.toLowerCase() === key.toLowerCase();

        if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
          if (preventDefault) e.preventDefault();
          handler(e);
          return;
        }
      }
    },
    [handlers]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * 快捷键提示文本
 */
export const SHORTCUT_LABELS: Record<string, string> = {
  'cmd+s': '保存',
  'cmd+enter': '生成',
  'cmd+p': '预览',
  'cmd+/': '切换大纲',
  'cmd+e': '导出',
  'cmd+k': '搜索',
  'esc': '取消',
};

/**
 * 格式化快捷键显示
 */
export function formatShortcut(key: string, modifiers: string[] = []): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');
  const mod = isMac ? '⌘' : 'Ctrl';
  const shift = isMac ? '⇧' : 'Shift';
  const alt = isMac ? '⌥' : 'Alt';

  const parts: string[] = [];
  if (modifiers.includes('cmd') || modifiers.includes('ctrl')) parts.push(mod);
  if (modifiers.includes('shift')) parts.push(shift);
  if (modifiers.includes('alt')) parts.push(alt);
  parts.push(key.toUpperCase());

  return parts.join(isMac ? '' : '+');
}