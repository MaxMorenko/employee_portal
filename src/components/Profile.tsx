import { useMemo, useState } from 'react';
import { Mail, Phone, MapPin, Briefcase, Calendar, Award, Edit, Sparkles } from 'lucide-react';
import { updateProfileStatus } from '../api/client';
import type { User } from '../api/types';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProfileProps {
  user: User;
  token: string;
  onUserUpdate: (user: User) => void;
}

const statusPresets = ['Активний', 'Втомився', 'Скоро відпустка', 'У відпустці', 'Працюю над пріоритетом'];

export function Profile({ user, token, onUserUpdate }: ProfileProps) {
  const [status, setStatus] = useState(user.status || 'Активний');
  const [updating, setUpdating] = useState(false);

  const skills = useMemo(() => user.tags || ['React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'Docker'], [user.tags]);

  const achievements = [
    { id: 1, title: 'Працівник місяця', date: 'Жовтень 2025', icon: Award },
    { id: 2, title: '5 років в компанії', date: 'Вересень 2025', icon: Calendar },
    { id: 3, title: 'Завершено 50+ проєктів', date: 'Серпень 2025', icon: Briefcase },
  ];

  const handleStatusSave = async (nextStatus: string) => {
    setStatus(nextStatus);
    setUpdating(true);
    try {
      const updated = await updateProfileStatus(token, nextStatus);
      onUserUpdate(updated);
    } catch (error) {
      console.error('Не вдалося оновити статус', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
              alt={user.name}
              className="w-32 h-32 rounded-full border-4 border-white object-cover"
            />
            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-gray-900">{user.name}</h1>
                  <p className="text-gray-600">{user.jobTitle || 'Співробітник компанії'}</p>
                  <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    <Sparkles className="w-4 h-4" />
                    {status}
                  </div>
                </div>
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <select
                    value={status}
                    onChange={(e) => handleStatusSave(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={updating}
                  >
                    {statusPresets.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-fit disabled:opacity-60"
                    disabled={updating}
                    onClick={() => handleStatusSave(status)}
                  >
                    <Edit className="w-4 h-4" />
                    {updating ? 'Зберігаю...' : 'Оновити статус'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-gray-900 mb-4">Контактна інформація</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-5 h-5" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-5 h-5" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{user.location}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-600">
                <Briefcase className="w-5 h-5" />
                <span>{user.department}</span>
              </div>
              {user.lastLoginAt && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>Останній вхід: {user.lastLoginAt}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-gray-900 mb-4">Про мене</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {user.bio || 'Заповніть свій профіль, щоб колеги знали чим ви займаєтесь та чим цікавитеся.'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-gray-900 mb-4">Досягнення</h2>
            <div className="space-y-3">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div key={achievement.id} className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-900">{achievement.title}</p>
                      <p className="text-gray-600">{achievement.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-gray-900 mb-4">Теги та навички</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-gray-900 mb-4">Статистика</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Завершені проєкти</span>
                  <span className="text-gray-900">52</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '87%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Відвідуваність</span>
                  <span className="text-gray-900">98%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Оцінка роботи</span>
                  <span className="text-gray-900">4.9/5</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
