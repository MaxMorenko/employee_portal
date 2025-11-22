import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Profile } from './components/Profile';
import { News } from './components/News';
import { Calendar } from './components/Calendar';
import { Documents } from './components/Documents';
import { Team } from './components/Team';
import { Login } from './components/Login';
import { login as loginApi } from './api/client';
import type { User } from './api/types';
import {
  CompleteRegistration,
  RegistrationRequest,
  RegistrationRequestSent,
} from './components/Register';

export type Page = 'dashboard' | 'profile' | 'news' | 'calendar' | 'documents' | 'team';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register' | 'complete' | 'registerSent'>(
    'login',
  );
  const [pendingEmail, setPendingEmail] = useState('');
  const [tokenHint, setTokenHint] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email') || '';
    const path = window.location.pathname.toLowerCase();

    if (token) {
      setPendingEmail(email);
      setTokenHint(token);
      setAuthView('complete');
      return;
    }

    if (path.includes('register')) {
      setPendingEmail(email);
      setAuthView('register');
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const response = await loginApi(email, password);
    setUser(response.user);
    setIsAuthenticated(true);
  };

  const handleRegistrationDone = (response: { user: User }) => {
    setUser(response.user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    if (authView === 'register') {
      return (
        <RegistrationRequest
          onBack={() => setAuthView('login')}
          onSuccess={(email, hint) => {
            setPendingEmail(email);
            setTokenHint(hint || '');
            setAuthView('registerSent');
          }}
        />
      );
    }

    if (authView === 'registerSent') {
      return (
        <RegistrationRequestSent
          email={pendingEmail}
          onBack={() => setAuthView('login')}
          onEnterCode={() => setAuthView('complete')}
        />
      );
    }

    if (authView === 'complete') {
      return (
        <CompleteRegistration
          defaultEmail={pendingEmail}
          tokenHint={tokenHint}
          onRegistered={handleRegistrationDone}
          onBack={() => setAuthView('login')}
        />
      );
    }

    return <Login onLogin={handleLogin} onShowRegister={() => setAuthView('register')} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} user={user} />;
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
        return <Dashboard onNavigate={setCurrentPage} user={user} />;
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
