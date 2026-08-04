'use client';

import { BlogOutline } from '@/types';
import { X, GripVertical } from 'lucide-react';

interface OutlineSidebarProps {
  outline: BlogOutline;
  onClose: () => void;
}

export function OutlineSidebar({ outline, onClose }: OutlineSidebarProps) {
  return (
    <div className="w-64 border-r border-surface-700/50 bg-surface-900/40 overflow-y-auto flex-shrink-0">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-surface-300">大纲结构</h3>
          <button onClick={onClose} className="btn-ghost p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1">
          {outline.sections.map((section) => (
            <div key={section.id} className="group">
              <div
                className={`flex items-start gap-2 px-2 py-2 rounded-lg cursor-pointer hover:bg-surface-800/50 transition-colors ${
                  section.level === 2 ? 'pl-2' : 'pl-6'
                }`}
              >
                <GripVertical className="w-3 h-3 text-surface-600 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                <div className="min-w-0">
                  <div
                    className={`text-xs font-medium truncate ${
                      section.level === 2 ? 'text-surface-200' : 'text-surface-400'
                    }`}
                  >
                    {section.title}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {section.keyPoints.map((point, i) => (
                      <span key={i} className="text-[10px] text-surface-600">
                        {point}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {section.children?.map((child) => (
                <div
                  key={child.id}
                  className="flex items-start gap-2 pl-8 pr-2 py-1.5 rounded-lg cursor-pointer hover:bg-surface-800/50 transition-colors"
                >
                  <span className="text-[10px] text-surface-500 truncate">{child.title}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}