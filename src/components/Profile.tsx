import { Mail, Phone, MapPin, Briefcase, Calendar, Award, Edit } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Profile() {
  const skills = ['React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'Docker'];
  
  const achievements = [
    { id: 1, title: 'Працівник місяця', date: 'Жовтень 2025', icon: Award },
    { id: 2, title: '5 років в компанії', date: 'Вересень 2025', icon: Calendar },
    { id: 3, title: 'Завершено 50+ проєктів', date: 'Серпень 2025', icon: Briefcase },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
              alt="Олексій Коваленко"
              className="w-32 h-32 rounded-full border-4 border-white object-cover"
            />
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-gray-900">Олексій Коваленко</h1>
                  <p className="text-gray-600">Senior Full-Stack Developer</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-fit">
                  <Edit className="w-4 h-4" />
                  Редагувати профіль
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-gray-900 mb-4">Контактна інформація</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-5 h-5" />
                <span>oleksiy.kovalenko@company.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="w-5 h-5" />
                <span>+380 67 123 4567</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>Київ, Україна</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Briefcase className="w-5 h-5" />
                <span>Відділ розробки</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span>Дата прийняття: 15 вересня 2020</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-gray-900 mb-4">Про мене</h2>
            <p className="text-gray-600 leading-relaxed">
              Досвідчений Full-Stack розробник з понад 8 років досвіду в створенні веб-додатків. 
              Спеціалізуюся на React, Node.js та хмарних технологіях. Люблю працювати в команді 
              та ділитися знаннями з колегами. У вільний час вивчаю нові технології та беру участь 
              у open-source проєктах.
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

        {/* Skills Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-gray-900 mb-4">Навички</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full"
                >
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
