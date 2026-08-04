import { useEffect, useRef, useState, useCallback } from 'react';

interface UseAutoSaveOptions {
  data: unknown;
  onSave: (data: unknown) => Promise<void> | void;
  interval?: number; // 自动保存间隔（毫秒）
  debounce?: number; // 输入后延迟保存（毫秒）
  enabled?: boolean;
  storageKey?: string; // localStorage 草稿恢复 key
}

interface AutoSaveState {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

/**
 * 自动保存 + 草稿恢复 Hook
 * - 防抖保存：停止输入后自动保存
 * - 定时保存：间隔触发保存
 * - 草稿恢复：内容写入 localStorage，刷新后可恢复
 */
export function useAutoSave({
  data,
  onSave,
  interval = 30000,
  debounce = 2000,
  enabled = true,
  storageKey,
}: UseAutoSaveOptions) {
  const [state, setState] = useState<AutoSaveState>({
    status: 'idle',
    lastSaved: null,
    hasUnsavedChanges: false,
  });

  const dataRef = useRef(data);
  const savedRef = useRef(data);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 更新引用
  useEffect(() => {
    dataRef.current = data;
    if (JSON.stringify(data) !== JSON.stringify(savedRef.current)) {
      setState((s) => ({ ...s, hasUnsavedChanges: true }));

      // 草稿写入 localStorage
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(data));
        } catch {
          // localStorage 不可用时静默失败
        }
      }
    }
  }, [data, storageKey]);

  // 执行保存
  const save = useCallback(async () => {
    const current = dataRef.current;
    if (JSON.stringify(current) === JSON.stringify(savedRef.current)) {
      return; // 没有变更
    }

    setState((s) => ({ ...s, status: 'saving' }));
    try {
      await onSave(current);
      savedRef.current = current;
      const now = new Date();
      setState({ status: 'saved', lastSaved: now, hasUnsavedChanges: false });

      // 3 秒后恢复 idle
      setTimeout(() => {
        setState((s) => (s.status === 'saved' ? { ...s, status: 'idle' } : s));
      }, 3000);
    } catch {
      setState((s) => ({ ...s, status: 'error' }));
    }
  }, [onSave]);

  // 防抖保存
  useEffect(() => {
    if (!enabled) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      save();
    }, debounce);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, enabled, debounce, save]);

  // 定时保存
  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = setInterval(() => {
      save();
    }, interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, interval, save]);

  // 页面离开前保存
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => {
      if (state.hasUnsavedChanges) {
        save();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, state.hasUnsavedChanges, save]);

  // 从 localStorage 恢复草稿
  const recoverDraft = useCallback((): unknown | null => {
    if (!storageKey) return null;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // 解析失败
    }
    return null;
  }, [storageKey]);

  // 清除草稿
  const clearDraft = useCallback(() => {
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  return {
    ...state,
    save,
    recoverDraft,
    clearDraft,
  };
}