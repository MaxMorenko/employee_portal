import { Home, User, Newspaper, Calendar, FileText, Users, Bell, LogOut } from 'lucide-react';
import type { Page } from '../App';
import type { User } from '../api/types';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  user: User | null;
}

export function Header({ currentPage, onNavigate, onLogout, user }: HeaderProps) {
  const menuItems = [
    { id: 'dashboard' as Page, label: 'Головна', icon: Home },
    { id: 'news' as Page, label: 'Новини', icon: Newspaper },
    { id: 'calendar' as Page, label: 'Календар', icon: Calendar },
    { id: 'documents' as Page, label: 'Документи', icon: FileText },
    { id: 'team' as Page, label: 'Команда', icon: Users },
    { id: 'profile' as Page, label: 'Профіль', icon: User },
    ...(user?.is_admin ? ([{ id: 'admin' as Page, label: 'Адмін', icon: User }] as const) : []),
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
              <span className="text-gray-900">Компанія</span>
            </div>

            <nav className="hidden md:flex gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Вийти</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <nav className="md:hidden flex overflow-x-auto pb-2 gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}