import { useEffect, useMemo, useState } from 'react';
import {
  UserPlus,
  Users,
  FolderKanban,
  Newspaper,
  Loader2,
  LayoutDashboard,
  Trash2,
  Edit3,
  BarChart3,
  FileText,
} from 'lucide-react';
import {
  createNews,
  createProject,
  createUser,
  deleteUser,
  getAdminOverview,
  getAdminUsers,
  getDocuments,
  updateUser,
} from '../../api/client';
import type { AdminOverview, DocumentItem, Project, User } from '../../api/types';
import { ContentCard } from '../shared/components/ContentCard';
import { StatCard } from '../shared/components/StatCard';

interface AdminProps {
  token: string;
  user: User;
}

const projectStatuses = ['Планування', 'В роботі', 'Тестування', 'Завершено'];
const userStatuses = ['Активний', 'Втомився', 'Скоро відпустка', 'У відпустці'];

type AdminTab = 'home' | 'users' | 'projects' | 'news' | 'documents';
type ProjectFormState = { name: string; owner: string; status: string; dueDate: string; progress: number | string };
type NewsFormState = { title: string; excerpt: string; category: string; author: string; image: string; featured: boolean };
type UserFormState = {
  id: number;
  name: string;
  email: string;
  department: string;
  password: string;
  jobTitle: string;
  phone: string;
  location: string;
  tags: string;
  status: string;
};

type DocumentFormState = DocumentItem;

export function AdminPage({ token, user }: AdminProps) {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('home');
  const [projectForm, setProjectForm] = useState<ProjectFormState>({
    name: '',
    owner: '',
    status: 'В роботі',
    dueDate: '',
    progress: 50,
  });
  const [newsForm, setNewsForm] = useState<NewsFormState>({
    title: '',
    excerpt: '',
    category: '',
    author: user.name,
    image: '',
    featured: false,
  });
  const [userForm, setUserForm] = useState<UserFormState>({
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
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [documentForm, setDocumentForm] = useState<DocumentFormState>({
    id: 0,
    name: '',
    type: '',
    category: '',
    size: '',
    modified: new Date().toISOString().slice(0, 10),
  });
  const [documentError, setDocumentError] = useState<string | null>(null);

  const totalUsers = useMemo(() => users.length, [users]);
  const activeProjects = useMemo(() => overview?.projects.length ?? 0, [overview]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAdminOverview(token);
        const loadedUsers = await getAdminUsers(token);
        const documentData = await getDocuments();
        setOverview(data);
        setUsers(loadedUsers);
        setDocuments(documentData.recentDocuments);
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
        tags: userForm.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
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

  const resetDocumentForm = () =>
    setDocumentForm({
      id: 0,
      name: '',
      type: '',
      size: '',
      modified: new Date().toISOString().slice(0, 10),
      category: '',
    });

  const handleDocumentSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!documentForm.name.trim() || !documentForm.type.trim()) {
      setDocumentError('Назва та тип документа обов’язкові');
      return;
    }

    const normalized: DocumentItem = {
      ...documentForm,
      modified: documentForm.modified || new Date().toISOString().slice(0, 10),
      size: documentForm.size || '—',
      category: documentForm.category || 'Загальне',
      id: documentForm.id || Date.now(),
    };

    if (documentForm.id) {
      setDocuments(documents.map((doc) => (doc.id === documentForm.id ? normalized : doc)));
    } else {
      setDocuments([normalized, ...documents]);
    }

    resetDocumentForm();
    setDocumentError(null);
  };

  const handleEditDocument = (doc: DocumentItem) => {
    setDocumentForm({ ...doc });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteDocument = (id: number) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
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
          <p className="text-gray-600">
            Головна з оглядом, а також управління користувачами, проєктами, новинами та документами
          </p>
        </div>
        <AdminTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === 'home' && (
        <AdminHomeTab overview={overview} totalUsers={totalUsers} activeProjects={activeProjects} />
      )}

      {activeTab === 'users' && (
        <UserManagementTab
          users={users}
          userForm={userForm}
          submitting={submitting}
          onChange={setUserForm}
          onSubmit={handleUserSubmit}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />
      )}

      {activeTab === 'projects' && (
        <ProjectManagementTab
          overview={overview}
          projectForm={projectForm}
          submitting={submitting}
          onChange={setProjectForm}
          onSubmit={handleProjectSubmit}
        />
      )}

      {activeTab === 'news' && (
        <NewsManagementTab
          overview={overview}
          newsForm={newsForm}
          submitting={submitting}
          onChange={setNewsForm}
          onSubmit={handleNewsSubmit}
        />
      )}

      {activeTab === 'documents' && (
        <DocumentManagementTab
          documents={documents}
          documentForm={documentForm}
          submitting={submitting}
          error={documentError}
          onChange={setDocumentForm}
          onSubmit={handleDocumentSubmit}
          onEdit={handleEditDocument}
          onDelete={handleDeleteDocument}
        />
      )}
    </div>
  );
}

function AdminTabs({ activeTab, onChange }: { activeTab: AdminTab; onChange: (tab: AdminTab) => void }) {
  const tabs: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'home', label: 'Головна', icon: LayoutDashboard },
    { id: 'users', label: 'Користувачі', icon: Users },
    { id: 'projects', label: 'Проєкти (CRUD)', icon: FolderKanban },
    { id: 'news', label: 'Новини (CRUD)', icon: Newspaper },
    { id: 'documents', label: 'Документи (CRUD)', icon: FileText },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
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
  );
}

function AdminHomeTab({
  overview,
  totalUsers,
  activeProjects,
}: {
  overview: AdminOverview;
  totalUsers: number;
  activeProjects: number;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Користувачі" value={totalUsers} icon={<Users className="w-6 h-6" />} />
        <StatCard
          title="Активні проєкти"
          value={activeProjects}
          icon={<FolderKanban className="w-6 h-6" />}
          accentClassName="bg-green-500 text-white"
        />
        <StatCard
          title="Новини"
          value={overview.news.length}
          icon={<Newspaper className="w-6 h-6" />}
          accentClassName="bg-orange-500 text-white"
        />
        <StatCard
          title="Перегляди новин"
          value={overview.stats.newsViews}
          helperText={`Останній логін: ${overview.stats.lastLogin || '—'}`}
          icon={<BarChart3 className="w-6 h-6" />}
          accentClassName="bg-purple-500 text-white"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContentCard title="Активні проєкти" description="Відстеження прогресу">
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
        </ContentCard>

        <ContentCard title="Огляд активності" description="Активні сесії">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 font-medium">Активні користувачі</p>
                <p className="text-gray-500 text-sm">Поточні сесії в системі</p>
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full">{overview.stats.activeUsers}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {overview.news.slice(0, 4).map((news) => (
                <div key={news.id} className="border border-gray-100 rounded-lg p-3">
                  <p className="text-sm text-gray-500">{news.category}</p>
                  <p className="text-gray-900 font-medium">{news.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{news.date}</p>
                </div>
              ))}
            </div>
          </div>
        </ContentCard>
      </div>
    </div>
  );
}

function UserManagementTab({
  users,
  userForm,
  submitting,
  onChange,
  onSubmit,
  onEdit,
  onDelete,
}: {
  users: User[];
  userForm: UserFormState;
  submitting: boolean;
  onChange: (value: UserFormState) => void;
  onSubmit: (event: React.FormEvent) => void;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ContentCard
        title={userForm.id ? 'Редагувати користувача' : 'Створити користувача'}
        description="Заповніть дані співробітника"
        className="lg:col-span-1"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700">Ім'я</label>
            <input
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2"
              value={userForm.name}
              onChange={(e) => onChange({ ...userForm, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Email</label>
            <input
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2"
              type="email"
              value={userForm.email}
              onChange={(e) => onChange({ ...userForm, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Пароль {userForm.id ? '(залиште порожнім, щоб не змінювати)' : ''}</label>
            <input
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2"
              type="password"
              value={userForm.password}
              onChange={(e) => onChange({ ...userForm, password: e.target.value })}
              minLength={userForm.id ? 0 : 6}
              placeholder={userForm.id ? 'Без змін' : 'Мінімум 6 символів'}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-700">Відділ</label>
              <input
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2"
                value={userForm.department}
                onChange={(e) => onChange({ ...userForm, department: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Посада</label>
              <input
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2"
                value={userForm.jobTitle}
                onChange={(e) => onChange({ ...userForm, jobTitle: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-700">Телефон</label>
              <input
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2"
                value={userForm.phone}
                onChange={(e) => onChange({ ...userForm, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Локація</label>
              <input
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2"
                value={userForm.location}
                onChange={(e) => onChange({ ...userForm, location: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-700">Теги (через кому)</label>
            <input
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2"
              value={userForm.tags}
              onChange={(e) => onChange({ ...userForm, tags: e.target.value })}
              placeholder="React, TypeScript, Комунікація"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Статус</label>
            <select
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2"
              value={userForm.status}
              onChange={(e) => onChange({ ...userForm, status: e.target.value })}
            >
              {userStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Збереження...' : userForm.id ? 'Оновити користувача' : 'Створити користувача'}
          </button>
        </form>
      </ContentCard>

      <div className="lg:col-span-2 space-y-4">
        <ContentCard title="Список користувачів" description="Редагування та видалення">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((u) => (
              <div key={u.id} className="border border-gray-100 rounded-lg p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 font-medium">{u.name}</p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">{u.department}</span>
                </div>
                <p className="text-sm text-gray-600">{u.jobTitle || 'Посада не вказана'}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(u)}
                    className="inline-flex items-center gap-1 px-3 py-1 border border-gray-200 rounded-lg text-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    Редагувати
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(u.id)}
                    className="inline-flex items-center gap-1 px-3 py-1 border border-red-200 text-red-600 rounded-lg text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Видалити
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ContentCard>
      </div>
    </div>
  );
}

function ProjectManagementTab({
  overview,
  projectForm,
  submitting,
  onChange,
  onSubmit,
}: {
  overview: AdminOverview;
  projectForm: ProjectFormState;
  submitting: boolean;
  onChange: (value: ProjectFormState) => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ContentCard title="Новий проєкт" description="Додати новий проєкт" className="lg:col-span-1">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700">Назва проєкту</label>
            <input
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2"
              value={projectForm.name}
              onChange={(e) => onChange({ ...projectForm, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Власник</label>
            <input
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2"
              value={projectForm.owner}
              onChange={(e) => onChange({ ...projectForm, owner: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-700">Статус</label>
              <select
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2"
                value={projectForm.status}
                onChange={(e) => onChange({ ...projectForm, status: e.target.value })}
              >
                {projectStatuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700">Дедлайн</label>
              <input
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2"
                type="date"
                value={projectForm.dueDate}
                onChange={(e) => onChange({ ...projectForm, dueDate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-700">Прогрес (%)</label>
            <input
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2"
              type="number"
              min={0}
              max={100}
              value={projectForm.progress}
              onChange={(e) => onChange({ ...projectForm, progress: Number(e.target.value) })}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Створення...' : 'Додати проєкт'}
          </button>
        </form>
      </ContentCard>

      <div className="lg:col-span-2 space-y-4">
        <ContentCard title="Активні проєкти" description="Останні ініціативи">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overview.projects.map((project) => (
              <div key={project.id} className="border border-gray-100 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-gray-900 font-medium">{project.name}</p>
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">{project.status}</span>
                </div>
                <p className="text-sm text-gray-600">Відповідальний: {project.owner}</p>
                <p className="text-sm text-gray-600">Дедлайн: {project.dueDate}</p>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-green-600" style={{ width: `${project.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </ContentCard>
      </div>
    </div>
  );
}

function NewsManagementTab({
  overview,
  newsForm,
  submitting,
  onChange,
  onSubmit,
}: {
  overview: AdminOverview;
  newsForm: NewsFormState;
  submitting: boolean;
  onChange: (value: NewsFormState) => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ContentCard title="Створити новину" description="Публікація новин для співробітників" className="lg:col-span-1">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700">Заголовок</label>
            <input
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2"
              value={newsForm.title}
              onChange={(e) => onChange({ ...newsForm, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Опис</label>
            <textarea
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2"
              rows={3}
              value={newsForm.excerpt}
              onChange={(e) => onChange({ ...newsForm, excerpt: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-700">Категорія</label>
              <input
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2"
                value={newsForm.category}
                onChange={(e) => onChange({ ...newsForm, category: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Автор</label>
              <input
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2"
                value={newsForm.author}
                onChange={(e) => onChange({ ...newsForm, author: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-700">Зображення (URL)</label>
            <input
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2"
              value={newsForm.image}
              onChange={(e) => onChange({ ...newsForm, image: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={newsForm.featured}
              onChange={(e) => onChange({ ...newsForm, featured: e.target.checked })}
            />
            Закріпити як важливу
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Публікація...' : 'Опублікувати'}
          </button>
        </form>
      </ContentCard>

      <div className="lg:col-span-2 space-y-4">
        <ContentCard title="Останні новини" description="Контент для працівників">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overview.news.map((item) => (
              <div key={item.id} className="border border-gray-100 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-gray-900 font-medium">{item.title}</p>
                  <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-xs">{item.category}</span>
                </div>
                <p className="text-sm text-gray-600">Автор: {item.author}</p>
                <p className="text-sm text-gray-500">{item.excerpt}</p>
                <p className="text-xs text-gray-400">Опубліковано: {item.date}</p>
              </div>
            ))}
          </div>
        </ContentCard>
      </div>
    </div>
  );
}

function DocumentManagementTab({
  documents,
  documentForm,
  submitting,
  error,
  onChange,
  onSubmit,
  onEdit,
  onDelete,
}: {
  documents: DocumentItem[];
  documentForm: DocumentFormState;
  submitting: boolean;
  error: string | null;
  onChange: (value: DocumentFormState) => void;
  onSubmit: (event: React.FormEvent) => void;
  onEdit: (doc: DocumentItem) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ContentCard title="Новий документ" description="Додайте або оновіть документ" className="lg:col-span-1">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700">Назва</label>
            <input
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2"
              value={documentForm.name}
              onChange={(e) => onChange({ ...documentForm, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-700">Тип</label>
              <input
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2"
                value={documentForm.type}
                onChange={(e) => onChange({ ...documentForm, type: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Категорія</label>
              <input
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2"
                value={documentForm.category}
                onChange={(e) => onChange({ ...documentForm, category: e.target.value })}
                placeholder="Наприклад, Політики"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-700">Розмір</label>
              <input
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2"
                value={documentForm.size}
                onChange={(e) => onChange({ ...documentForm, size: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Модифіковано</label>
              <input
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2"
                type="date"
                value={documentForm.modified}
                onChange={(e) => onChange({ ...documentForm, modified: e.target.value })}
              />
            </div>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Збереження...' : documentForm.id ? 'Оновити документ' : 'Додати документ'}
          </button>
        </form>
      </ContentCard>

      <div className="lg:col-span-2 space-y-4">
        <ContentCard title="Документи" description="Каталог важливих файлів">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="border border-gray-100 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-gray-900 font-medium">{doc.name}</p>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{doc.type}</span>
                </div>
                <p className="text-sm text-gray-600">Категорія: {doc.category}</p>
                <p className="text-sm text-gray-500">Розмір: {doc.size}</p>
                <p className="text-xs text-gray-400">Модифіковано: {doc.modified}</p>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => onEdit(doc)}
                    className="inline-flex items-center gap-1 px-3 py-1 border border-gray-200 rounded-lg text-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    Редагувати
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(doc.id)}
                    className="inline-flex items-center gap-1 px-3 py-1 border border-red-200 text-red-600 rounded-lg text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Видалити
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ContentCard>
      </div>
    </div>
  );
}
