import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  accentClassName?: string;
  helperText?: string;
}

export function StatCard({ title, value, icon, accentClassName = 'bg-blue-500 text-white', helperText }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-semibold text-gray-900">{value}</p>
          {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
        </div>
        <div className={`p-3 ${accentClassName} rounded-lg flex items-center justify-center`}>{icon}</div>
      </div>
    </div>
  );
}
