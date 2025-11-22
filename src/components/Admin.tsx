import { useEffect, useMemo, useState } from 'react';
import { UserPlus, Users, FolderKanban, Newspaper, Loader2 } from 'lucide-react';
import { createNews, createProject, getAdminOverview } from '../api/client';
import type { AdminOverview, Project, User } from '../api/types';

interface AdminProps {
  token: string;
  user: User;
}

const projectStatuses = ['Планування', 'В роботі', 'Тестування', 'Завершено'];

export function Admin({ token, user }: AdminProps) {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const [submitting, setSubmitting] = useState(false);

  const totalUsers = useMemo(() => overview?.users.length ?? 0, [overview]);
  const activeProjects = useMemo(() => overview?.projects.length ?? 0, [overview]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAdminOverview(token);
        setOverview(data);
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
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
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
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
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 lg:col-span-2">
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
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Роль</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {overview.users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.department}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          u.is_admin ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {u.is_admin ? 'Адміністратор' : 'Співробітник'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
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
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
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
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
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
              <p className="text-xs text-gray-500 mt-2">Автор: {news.author}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
