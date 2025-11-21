import { useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Profile } from './components/Profile';
import { News } from './components/News';
import { Calendar } from './components/Calendar';
import { Documents } from './components/Documents';
import { Team } from './components/Team';
import { Login } from './components/Login';

export type Page = 'dashboard' | 'profile' | 'news' | 'calendar' | 'documents' | 'team';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'profile':
        return <Profile />;
      case 'news':
        return <News />;
      case 'calendar':
        return <Calendar />;
      case 'documents':
        return <Documents />;
      case 'team':
        return <Team />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderPage()}
      </main>
    </div>
  );
}