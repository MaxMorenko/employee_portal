import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  accentClassName?: string;
  helperText?: string;
  variant?: 'light' | 'dark';
}

export function StatCard({
  title,
  value,
  icon,
  accentClassName = 'bg-blue-500 text-white',
  helperText,
  variant = 'light',
}: StatCardProps) {
  const isDark = variant === 'dark';
  return (
    <div className={`${isDark ? 'bg-slate-900/60 text-slate-100 border border-slate-800' : 'bg-white'} p-6 rounded-xl shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-500'}`}>{title}</p>
          <p className={`text-3xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
          {helperText && <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{helperText}</p>}
        </div>
        <div className={`p-3 ${accentClassName} rounded-lg flex items-center justify-center`}>{icon}</div>
      </div>
    </div>
  );
}
