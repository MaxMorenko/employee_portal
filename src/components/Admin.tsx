import { useEffect, useMemo, useState } from 'react';
import { UserPlus, Users, FolderKanban, Newspaper, Loader2, LayoutDashboard, Trash2, Edit3, BarChart3 } from 'lucide-react';
import { createNews, createProject, createUser, deleteUser, getAdminOverview, getAdminUsers, updateUser } from '../api/client';
import type { AdminOverview, Project, User } from '../api/types';

interface AdminProps {
  token: string;
  user: User;
}

const projectStatuses = ['Планування', 'В роботі', 'Тестування', 'Завершено'];
const userStatuses = ['Активний', 'Втомився', 'Скоро відпустка', 'У відпустці'];

export function Admin({ token, user }: AdminProps) {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'projects' | 'news'>('overview');
  const [projectForm, setProjectForm] = useState({
    name: '',
    owner: '',
    status: 'В роботі',
    dueDate: '',
    progress: 50,
  });
  const [newsForm, setNewsForm] = useState({
    title: '',
    excerpt: '',
    category: '',
    author: user.name,
    image: '',
    featured: false,
  });
  const [userForm, setUserForm] = useState({
    id: 0,
    name: '',
    email: '',
    department: '',
    password: '',
    jobTitle: '',
    phone: '',
    location: '',
    tags: '',
    status: 'Активний',
  });
  const [submitting, setSubmitting] = useState(false);

  const totalUsers = useMemo(() => users.length, [users]);
  const activeProjects = useMemo(() => overview?.projects.length ?? 0, [overview]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAdminOverview(token);
        const loadedUsers = await getAdminUsers(token);
        setOverview(data);
        setUsers(loadedUsers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не вдалося завантажити дані адміністратора');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const handleProjectSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!overview) return;

    setSubmitting(true);
    try {
      const created = await createProject(token, {
        ...projectForm,
        progress: Number(projectForm.progress),
      });
      setOverview({
        ...overview,
        projects: [created, ...overview.projects],
      });
      setProjectForm({ name: '', owner: '', status: 'В роботі', dueDate: '', progress: 50 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося створити проєкт');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewsSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!overview) return;

    setSubmitting(true);
    try {
      const created = await createNews(token, newsForm);
      setOverview({
        ...overview,
        news: [created, ...overview.news],
      });
      setNewsForm({ title: '', excerpt: '', category: '', author: user.name, image: '', featured: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося створити новину');
    } finally {
      setSubmitting(false);
    }
  };

  const resetUserForm = () =>
    setUserForm({
      id: 0,
      name: '',
      email: '',
      department: '',
      password: '',
      jobTitle: '',
      phone: '',
      location: '',
      tags: '',
      status: 'Активний',
    });

  const handleUserSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: userForm.name,
        email: userForm.email,
        department: userForm.department,
        password: userForm.password,
        jobTitle: userForm.jobTitle,
        phone: userForm.phone,
        location: userForm.location,
        tags: userForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        status: userForm.status,
      };

      if (!userForm.password) {
        delete (payload as { password?: string }).password;
      }

      if (userForm.id) {
        const updated = await updateUser(token, userForm.id, payload);
        setUsers(users.map((u) => (u.id === userForm.id ? updated : u)));
      } else {
        const created = await createUser(token, payload as User & { password: string });
        setUsers([created, ...users]);
      }
      resetUserForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося зберегти користувача');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = (target: User) => {
    setUserForm({
      id: target.id,
      name: target.name,
      email: target.email,
      department: target.department,
      password: '',
      jobTitle: target.jobTitle || '',
      phone: target.phone || '',
      location: target.location || '',
      tags: (target.tags || []).join(', '),
      status: target.status || 'Активний',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteUser = async (id: number) => {
    setSubmitting(true);
    try {
      await deleteUser(token, id);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося видалити користувача');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-gray-600">
        <Loader2 className="w-5 h-5 animate-spin" /> Завантаження адмін-панелі...
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!overview) {
    return <p className="text-gray-600">Немає даних для відображення.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-blue-700 font-medium flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Адміністратор: {user.name}
          </p>
          <h1 className="text-gray-900">Адміністративний центр</h1>
          <p className="text-gray-600">Керуйте користувачами, проєктами та новинами порталу</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Огляд', icon: LayoutDashboard },
            { id: 'users', label: 'Користувачі', icon: Users },
            { id: 'projects', label: 'Проєкти', icon: FolderKanban },
            { id: 'news', label: 'Новини', icon: Newspaper },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as typeof activeTab)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  activeTab === item.id ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Користувачі</p>
                  <p className="text-3xl font-semibold text-gray-900">{totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Активні проєкти</p>
                  <p className="text-3xl font-semibold text-gray-900">{activeProjects}</p>
                </div>
                <div className="w-12 h-12 bg-green-50 text-green-700 rounded-full flex items-center justify-center">
                  <FolderKanban className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Новини</p>
                  <p className="text-3xl font-semibold text-gray-900">{overview.news.length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 text-orange-700 rounded-full flex items-center justify-center">
                  <Newspaper className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Перегляди новин</p>
                  <p className="text-3xl font-semibold text-gray-900">{overview.stats.newsViews}</p>
                  <p className="text-xs text-gray-500 mt-1">Останній логін: {overview.stats.lastLogin || '—'}</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-gray-900">Активні проєкти</h2>
                <span className="text-sm text-gray-500">Відстеження прогресу</span>
              </div>
              <div className="space-y-3">
                {overview.projects.map((project: Project) => (
                  <div key={project.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-gray-900 font-medium">{project.name}</p>
                        <p className="text-sm text-gray-500">Відповідальний: {project.owner}</p>
                      </div>
                      <span className="text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-700">{project.status}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Дедлайн: {project.dueDate}</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-blue-600" style={{ width: `${project.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-gray-900">Огляд активності</h2>
                <span className="text-sm text-gray-500">Активні сесії</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 font-medium">Активні користувачі</p>
                    <p className="text-gray-500 text-sm">Поточні сесії в системі</p>
                  </div>
                  <div className="text-2xl font-semibold text-blue-700">{overview.stats.activeUsers}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 font-medium">Середній прогрес проєктів</p>
                    <p className="text-gray-500 text-sm">По всіх активних проєктах</p>
                  </div>
                  <div className="text-2xl font-semibold text-green-700">{Math.round(
                    overview.projects.reduce((acc, p) => acc + p.progress, 0) / (overview.projects.length || 1),
                  )}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 lg:col-span-1">
            <h2 className="text-gray-900 mb-4">{userForm.id ? 'Редагувати користувача' : 'Додати користувача'}</h2>
            <form className="space-y-3" onSubmit={handleUserSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Ім’я</label>
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Відділ</label>
                <input
                  type="text"
                  value={userForm.department}
                  onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Посада</label>
                  <input
                    type="text"
                    value={userForm.jobTitle}
                    onChange={(e) => setUserForm({ ...userForm, jobTitle: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Телефон</label>
                  <input
                    type="text"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Локація</label>
                <input
                  type="text"
                  value={userForm.location}
                  onChange={(e) => setUserForm({ ...userForm, location: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Теги (через кому)</label>
                <input
                  type="text"
                  value={userForm.tags}
                  onChange={(e) => setUserForm({ ...userForm, tags: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Статус</label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {userStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Пароль</label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={userForm.id ? 'Залиште порожнім щоб не змінювати' : 'Вкажіть пароль'}
                    required={!userForm.id}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Збереження...' : userForm.id ? 'Оновити' : 'Додати'}
                </button>
                {userForm.id ? (
                  <button
                    type="button"
                    onClick={resetUserForm}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Скасувати
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-900">Користувачі</h2>
              <span className="text-sm text-gray-500">Повний список акаунтів</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Ім’я</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Відділ</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Теги</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Дії</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{u.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{u.department}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{(u.tags || []).join(', ') || '—'}</td>
                      <td className="px-4 py-3 text-sm flex items-center gap-2">
                        <button
                          onClick={() => handleEditUser(u)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          <Edit3 className="w-4 h-4" />
                          Редагувати
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                          Видалити
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 lg:col-span-1">
            <h2 className="text-gray-900 mb-4">Створити проєкт</h2>
            <form className="space-y-3" onSubmit={handleProjectSubmit}>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Назва</label>
                <input
                  type="text"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Відповідальний</label>
                <input
                  type="text"
                  value={projectForm.owner}
                  onChange={(e) => setProjectForm({ ...projectForm, owner: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Статус</label>
                <select
                  value={projectForm.status}
                  onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {projectStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Термін</label>
                <input
                  type="date"
                  value={projectForm.dueDate}
                  onChange={(e) => setProjectForm({ ...projectForm, dueDate: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Прогрес (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={projectForm.progress}
                  onChange={(e) => setProjectForm({ ...projectForm, progress: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Збереження...' : 'Додати проєкт'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-900">Активні проєкти</h2>
              <span className="text-sm text-gray-500">Відстеження прогресу</span>
            </div>
            <div className="space-y-3">
              {overview.projects.map((project: Project) => (
                <div key={project.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-gray-900 font-medium">{project.name}</p>
                      <p className="text-sm text-gray-500">Відповідальний: {project.owner}</p>
                    </div>
                    <span className="text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-700">{project.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Дедлайн: {project.dueDate}</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-blue-600" style={{ width: `${project.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'news' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 lg:col-span-1">
            <h2 className="text-gray-900 mb-4">Додати новину</h2>
            <form className="space-y-3" onSubmit={handleNewsSubmit}>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Заголовок</label>
                <input
                  type="text"
                  value={newsForm.title}
                  onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Короткий опис</label>
                <textarea
                  value={newsForm.excerpt}
                  onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Категорія</label>
                  <input
                    type="text"
                    value={newsForm.category}
                    onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Автор</label>
                  <input
                    type="text"
                    value={newsForm.author}
                    onChange={(e) => setNewsForm({ ...newsForm, author: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Зображення (посилання)</label>
                <input
                  type="url"
                  value={newsForm.image}
                  onChange={(e) => setNewsForm({ ...newsForm, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={newsForm.featured}
                  onChange={(e) => setNewsForm({ ...newsForm, featured: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Показувати як важливу новину
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Збереження...' : 'Опублікувати новину'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-900">Останні новини</h2>
              <span className="text-sm text-gray-500">Всього: {overview.news.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overview.news.slice(0, 6).map((news) => (
                <div key={news.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700">{news.category}</span>
                    <span className="text-xs text-gray-500">{news.date}</span>
                  </div>
                  <p className="text-gray-900 font-medium mb-1">{news.title}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{news.excerpt}</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>Автор: {news.author}</span>
                    <span>{news.viewCount ?? 0} переглядів</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
