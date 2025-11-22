export interface User {
  id: number;
  name: string;
  email: string;
  department: string;
}

export interface DashboardStat {
  label: string;
  value: string;
  icon: string;
  color: string;
}

export interface DashboardData {
  greeting: string;
  stats: DashboardStat[];
  upcomingEvents: { id: number; title: string; time: string; date: string }[];
  recentNews: { id: number; title: string; date: string; category: string }[];
  tasks: { id: number; title: string; completed: boolean }[];
}

export interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  image: string;
  featured: boolean;
}

export interface NewsResponse {
  items: NewsItem[];
  categories: string[];
}

export interface DocumentFolder {
  id: number;
  name: string;
  files: number;
  icon: string;
}

export interface DocumentItem {
  id: number;
  name: string;
  type: string;
  size: string;
  modified: string;
  category: string;
}

export interface DocumentsResponse {
  folders: DocumentFolder[];
  recentDocuments: DocumentItem[];
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegistrationRequest {
  email: string;
  name?: string;
  department?: string;
}

export interface RegistrationRequestResponse {
  message: string;
  confirmationLink?: string;
  expiresAt: string;
}

export interface CompleteRegistrationPayload {
  token: string;
  password: string;
  confirmPassword: string;
}
