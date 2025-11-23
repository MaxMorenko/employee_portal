import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Login } from './components/Login';
import { getProfile, login as loginApi, logout as logoutApi } from './api/client';
import type { LoginResponse, User } from './api/types';
import {
  CompleteRegistration,
  RegistrationRequest,
  RegistrationRequestSent,
} from './components/Register';
import { AdminPage, type AdminTab } from './modules/admin/AdminPage';
import { Calendar } from './modules/user/Calendar';
import { Dashboard } from './modules/user/Dashboard';
import { Documents } from './modules/user/Documents';
import { News } from './modules/user/News';
import { Profile } from './modules/user/Profile';
import { Team } from './modules/user/Team';

export type Page =
  | 'dashboard'
  | 'profile'
  | 'news'
  | 'calendar'
  | 'documents'
  | 'team'
  | 'admin-overview'
  | 'admin-news'
  | 'admin-projects'
  | 'admin-users'
  | 'admin-documents';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register' | 'complete' | 'registerSent'>(
    'login',
  );
  const [pendingEmail, setPendingEmail] = useState('');
  const [tokenHint, setTokenHint] = useState('');

  const normalizeUser = (value: User): User => ({ ...value, is_admin: Boolean(value.is_admin) });

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

  useEffect(() => {
    const storedSession = sessionStorage.getItem('authSession');

    if (!storedSession) return;

    try {
      const parsed: { token?: string; user?: User } = JSON.parse(storedSession);

      if (parsed.token && parsed.user) {
        const restoredUser = normalizeUser(parsed.user as User);
        setSessionToken(parsed.token);
        setUser(restoredUser);
        setIsAuthenticated(true);
        setCurrentPage(restoredUser.is_admin ? 'admin-overview' : 'dashboard');
      }
    } catch (err) {
      console.error('Не вдалося відновити сесію', err);
      sessionStorage.removeItem('authSession');
    }
  }, []);

  useEffect(() => {
    if (!sessionToken) return;

    getProfile(sessionToken)
      .then((profile) => setUser(normalizeUser(profile)))
      .catch((err) => console.error('Не вдалося оновити профіль', err));
  }, [sessionToken]);

  const persistSession = (token: string, sessionUser: User) => {
    setSessionToken(token);
    sessionStorage.setItem('authSession', JSON.stringify({ token, user: sessionUser }));
  };

  const clearSession = () => {
    setSessionToken(null);
    sessionStorage.removeItem('authSession');
  };

  const startSession = (response: LoginResponse) => {
    const normalizedUser = normalizeUser(response.user);
    setUser(normalizedUser);
    setIsAuthenticated(true);
    persistSession(response.token, normalizedUser);
    setAuthView('login');
    setCurrentPage(normalizedUser.is_admin ? 'admin-overview' : 'dashboard');
  };

  const handleLogin = async (email: string, password: string) => {
    const response = await loginApi(email, password);
    startSession(response);
  };

  const handleRegistrationDone = (response: LoginResponse) => {
    startSession(response);
  };

  const handleLogout = async () => {
    if (sessionToken) {
      try {
        await logoutApi(sessionToken);
      } catch (err) {
        console.error('Не вдалося завершити сесію', err);
      }
    }

    clearSession();
    setUser(null);
    setIsAuthenticated(false);
    setAuthView('login');
    setCurrentPage('dashboard');
  };

  const renderAuthView = () => {
    switch (authView) {
      case 'register':
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
      case 'registerSent':
        return (
          <RegistrationRequestSent
            email={pendingEmail}
            onBack={() => setAuthView('login')}
            onEnterCode={() => setAuthView('complete')}
          />
        );
      case 'complete':
        return (
          <CompleteRegistration
            defaultEmail={pendingEmail}
            tokenHint={tokenHint}
            onRegistered={handleRegistrationDone}
            onBack={() => setAuthView('login')}
          />
        );
      default:
        return <Login onLogin={handleLogin} onShowRegister={() => setAuthView('register')} />;
    }
  };

  if (!isAuthenticated) {
    return renderAuthView();
  }

  const renderAdminTab = (initialTab: AdminTab) =>
    user && sessionToken ? <AdminPage token={sessionToken} user={user} initialTab={initialTab} /> : null;

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} user={user} />;
      case 'profile':
        return user && sessionToken ? <Profile user={user} token={sessionToken} onUserUpdate={setUser} /> : null;
      case 'news':
        return <News />;
      case 'calendar':
        return <Calendar />;
      case 'documents':
        return <Documents />;
      case 'team':
        return <Team />;
      case 'admin-overview':
        return renderAdminTab('home');
      case 'admin-news':
        return renderAdminTab('news');
      case 'admin-projects':
        return renderAdminTab('projects');
      case 'admin-users':
        return renderAdminTab('users');
      case 'admin-documents':
        return renderAdminTab('documents');
      default:
        return <Dashboard onNavigate={setCurrentPage} user={user} />;
    }
  };

  const isAdminView = Boolean(user?.is_admin && currentPage.startsWith('admin'));

  return (
    <div
      className={`min-h-screen ${
        isAdminView ? 'admin-theme bg-slate-950 text-slate-100' : 'bg-gray-50 text-gray-900'
      }`}
    >
      <Header
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
        user={user}
        theme={isAdminView ? 'admin' : 'user'}
      />
      <main className="max-w-7xl mx-auto px-4 py-8">{renderPage()}</main>
    </div>
  );
}
