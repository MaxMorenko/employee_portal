import type { ReactNode } from 'react';

interface ContentCardProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  variant?: 'light' | 'dark';
}

export function ContentCard({ title, description, actions, children, className = '', variant = 'light' }: ContentCardProps) {
  const isDark = variant === 'dark';
  return (
    <div
      className={`${
        isDark
          ? 'bg-slate-900/60 border border-slate-800 text-slate-100'
          : 'bg-white rounded-xl shadow-sm border border-gray-100 text-gray-900'
      } rounded-xl shadow-sm p-6 ${className}`}
    >
      {(title || description || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
          <div>
            {title && <h2 className={isDark ? 'text-slate-50' : 'text-gray-900'}>{title}</h2>}
            {description && <p className={isDark ? 'text-slate-300' : 'text-gray-600'}>{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
