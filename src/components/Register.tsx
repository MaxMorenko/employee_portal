import { useState } from 'react';
import { Mail, User, Lock, Briefcase, CheckCircle2 } from 'lucide-react';
import { completeRegistration, requestRegistration } from '../api/client';
import type { LoginResponse } from '../api/types';

interface RegistrationRequestProps {
  onSuccess: (email: string, tokenHint?: string) => void;
  onBack: () => void;
}

interface RegistrationRequestSentProps {
  email: string;
  onBack: () => void;
  onEnterCode: () => void;
}

export function RegistrationRequest({ onSuccess, onBack }: RegistrationRequestProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await requestRegistration({ email, name, department });
      setMessage(response.message);
      onSuccess(email, response.confirmationLink);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося надіслати запит');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <Briefcase className="text-white" size={32} />
          </div>
          <h1 className="text-gray-900 mb-2">Створення акаунту</h1>
          <p className="text-gray-600">Надішліть запит і отримайте лист для завершення реєстрації</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm text-gray-700 mb-2">
                Ваше ім'я
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="text-gray-400" size={20} />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ім'я та прізвище"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm text-gray-700 mb-2">
                Робочий email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={20} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@company.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="department" className="block text-sm text-gray-700 mb-2">
                Відділ (необов'язково)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="text-gray-400" size={20} />
                </div>
                <input
                  id="department"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Команда чи відділ"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {message && <p className="text-green-700 text-sm">{message}</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-70"
            >
              {loading ? 'Відправляємо...' : 'Надіслати запит'}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full text-sm text-blue-600 hover:text-blue-800"
            >
              Повернутись до входу
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function RegistrationRequestSent({ email, onBack, onEnterCode }: RegistrationRequestSentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4 shadow-lg">
            <CheckCircle2 className="text-white" size={32} />
          </div>
          <h1 className="text-gray-900 mb-2">Запит на створення акаунту відправлено</h1>
          <p className="text-gray-600">
            Ми надіслали інструкції для підтвердження на {email || 'ваш email'}. Перейдіть за посиланням у
            листі, щоб завершити реєстрацію.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 space-y-4">
          <button
            type="button"
            onClick={onEnterCode}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            Ввести код підтвердження
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full text-sm text-blue-600 hover:text-blue-800"
          >
            Повернутись до входу
          </button>
        </div>
      </div>
    </div>
  );
}

interface CompleteRegistrationProps {
  defaultEmail?: string;
  tokenHint?: string;
  onRegistered: (response: LoginResponse) => void;
  onBack: () => void;
}

export function CompleteRegistration({ defaultEmail, tokenHint, onRegistered, onBack }: CompleteRegistrationProps) {
  const [token, setToken] = useState(tokenHint || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await completeRegistration({ token, password, confirmPassword });
      setSuccess('Реєстрацію успішно завершено!');
      onRegistered(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося завершити реєстрацію');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-gray-900 mb-2">Завершення реєстрації</h1>
          <p className="text-gray-600">
            Введіть токен з листа{defaultEmail ? `, надісланого на ${defaultEmail}` : ''} та встановіть пароль
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="token" className="block text-sm text-gray-700 mb-2">
                Код підтвердження
              </label>
              <input
                id="token"
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Вставте код із листа"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              {tokenHint && (
                <p className="text-xs text-gray-500 mt-1">Попередній код для тестів: {tokenHint}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-gray-700 mb-2">
                Новий пароль
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm text-gray-700 mb-2">
                Підтвердження пароля
              </label>
              <input
                id="confirm"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {success && <p className="text-green-700 text-sm">{success}</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-70"
            >
              {loading ? 'Зберігаємо...' : 'Завершити реєстрацію'}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full text-sm text-blue-600 hover:text-blue-800"
            >
              Назад до входу
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
