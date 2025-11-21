import { Calendar, FileText, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import type { Page } from '../App';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const stats = [
    { label: 'Активні проєкти', value: '12', icon: TrendingUp, color: 'bg-blue-500' },
    { label: 'Зустрічі сьогодні', value: '3', icon: Calendar, color: 'bg-green-500' },
    { label: 'Нові документи', value: '8', icon: FileText, color: 'bg-purple-500' },
    { label: 'Члени команди', value: '47', icon: Users, color: 'bg-orange-500' },
  ];

  const upcomingEvents = [
    { id: 1, title: 'Планування спринту', time: '10:00', date: 'Сьогодні' },
    { id: 2, title: 'Презентація проєкту', time: '14:30', date: 'Сьогодні' },
    { id: 3, title: 'Зустріч команди', time: '16:00', date: 'Сьогодні' },
  ];

  const recentNews = [
    { id: 1, title: 'Запуск нового продукту', date: '21 листопада 2025', category: 'Продукт' },
    { id: 2, title: 'Корпоративний захід у грудні', date: '20 листопада 2025', category: 'Події' },
    { id: 3, title: 'Оновлення політики відпусток', date: '19 листопада 2025', category: 'HR' },
  ];

  const tasks = [
    { id: 1, title: 'Завершити квартальний звіт', completed: false },
    { id: 2, title: 'Переглянути PR команди', completed: true },
    { id: 3, title: 'Підготувати презентацію', completed: false },
    { id: 4, title: 'Оновити документацію', completed: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Доброго дня, Олексій!</h1>
        <p className="text-gray-600">Ось що відбувається сьогодні</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
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
            {upcomingEvents.map((event) => (
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
            {recentNews.map((news) => (
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
            <span className="text-gray-600">{tasks.filter(t => !t.completed).length} активних</span>
          </div>
          <div className="space-y-3">
            {tasks.map((task) => (
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
