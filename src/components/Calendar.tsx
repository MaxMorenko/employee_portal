import { ChevronLeft, ChevronRight, Clock, MapPin, Users, Plus } from 'lucide-react';
import { useState } from 'react';

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 21)); // November 21, 2025

  const events = [
    {
      id: 1,
      title: 'Планування спринту',
      date: new Date(2025, 10, 21),
      time: '10:00 - 11:00',
      location: 'Конференц-зала А',
      attendees: ['Команда розробки'],
      color: 'bg-blue-500',
    },
    {
      id: 2,
      title: 'Презентація проєкту',
      date: new Date(2025, 10, 21),
      time: '14:30 - 15:30',
      location: 'Онлайн (Zoom)',
      attendees: ['Керівництво', 'Проєктна команда'],
      color: 'bg-purple-500',
    },
    {
      id: 3,
      title: 'Зустріч команди',
      date: new Date(2025, 10, 21),
      time: '16:00 - 17:00',
      location: 'Конференц-зала B',
      attendees: ['Вся команда'],
      color: 'bg-green-500',
    },
    {
      id: 4,
      title: 'Навчання: TypeScript Advanced',
      date: new Date(2025, 10, 24),
      time: '10:00 - 12:00',
      location: 'Навчальний центр',
      attendees: ['Розробники'],
      color: 'bg-orange-500',
    },
    {
      id: 5,
      title: 'Корпоративний обід',
      date: new Date(2025, 10, 28),
      time: '12:00 - 14:00',
      location: 'Ресторан "Panorama"',
      attendees: ['Весь офіс'],
      color: 'bg-pink-500',
    },
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
  ];

  const dayNames = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  const getEventsForDay = (day: number) => {
    return events.filter(event => {
      const eventDate = event.date;
      return eventDate.getDate() === day &&
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const todayEvents = events.filter(event => {
    const today = new Date(2025, 10, 21);
    return event.date.getDate() === today.getDate() &&
           event.date.getMonth() === today.getMonth() &&
           event.date.getFullYear() === today.getFullYear();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Календар</h1>
          <p className="text-gray-600">Ваші зустрічі та події</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Додати подію
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-gray-600 py-2">
                {day}
              </div>
            ))}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square"></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = day === 21 && currentDate.getMonth() === 10;

              return (
                <div
                  key={day}
                  className={`aspect-square p-2 border rounded-lg cursor-pointer transition-colors ${
                    isToday
                      ? 'bg-blue-50 border-blue-300'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`${event.color} h-1 rounded-full`}
                      ></div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500">+{dayEvents.length - 2}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Events */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-gray-900 mb-4">Події сьогодні</h2>
          <div className="space-y-4">
            {todayEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-1 h-16 ${event.color} rounded-full`}></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 mb-2">{event.title}</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{event.attendees.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
