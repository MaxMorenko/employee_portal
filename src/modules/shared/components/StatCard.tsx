import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  accentClassName?: string;
  helperText?: string;
}

export function StatCard({ title, value, icon, accentClassName = 'bg-blue-50 text-blue-700', helperText }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-semibold text-gray-900">{value}</p>
          {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
        </div>
        <div className={`w-12 h-12 ${accentClassName} rounded-full flex items-center justify-center`}>{icon}</div>
      </div>
    </div>
  );
}
