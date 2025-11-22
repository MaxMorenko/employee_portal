import { useEffect, useState } from 'react';
import { Calendar, FileText, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import type { Page } from '../App';
import { getDashboard } from '../api/client';
import type { DashboardData, User } from '../api/types';

interface DashboardProps {
  onNavigate: (page: Page) => void;
  user: User | null;
}

const iconMap: Record<string, typeof TrendingUp> = {
  'trending-up': TrendingUp,
  calendar: Calendar,
  'file-text': FileText,
  users: Users,
};

export function Dashboard({ onNavigate, user }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await getDashboard();
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не вдалося завантажити дані');
      }
    };

    loadDashboard();
  }, []);

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!data) {
    return <p className="text-gray-600">Завантаження дашборду...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Доброго дня, {user?.name || data.greeting}!</h1>
        <p className="text-gray-600">Ось що відбувається сьогодні</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.stats.map((stat) => {
          const Icon = iconMap[stat.icon] || TrendingUp;
          return (
            <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">{stat.label}</p>
                  <p className="text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900">Найближчі події</h2>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-blue-600 hover:text-blue-700"
            >
              Всі
            </button>
          </div>
          <div className="space-y-3">
            {data.upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900">{event.title}</p>
                  <p className="text-gray-600">{event.date}, {event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent News */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900">Останні новини</h2>
            <button
              onClick={() => onNavigate('news')}
              className="text-blue-600 hover:text-blue-700"
            >
              Всі
            </button>
          </div>
          <div className="space-y-3">
            {data.recentNews.map((news) => (
              <div key={news.id} className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors">
                <div className="flex items-start gap-2 mb-1">
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                    {news.category}
                  </span>
                </div>
                <p className="text-gray-900 mb-1">{news.title}</p>
                <p className="text-gray-600">{news.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* My Tasks */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900">Мої завдання</h2>
            <span className="text-gray-600">{data.tasks.filter(t => !t.completed).length} активних</span>
          </div>
          <div className="space-y-3">
            {data.tasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <button className={`mt-0.5 ${task.completed ? 'text-green-500' : 'text-gray-300'}`}>
                  <CheckCircle className="w-5 h-5" />
                </button>
                <p className={`flex-1 ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                  {task.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
