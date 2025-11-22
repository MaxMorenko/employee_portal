import { useEffect, useState } from 'react';
import { Download, Search, Filter, Folder, File } from 'lucide-react';
import { getDocuments } from '../api/client';
import type { DocumentFolder, DocumentItem } from '../api/types';

export function Documents() {
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<DocumentItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const response = await getDocuments();
        setFolders(response.folders);
        setRecentDocuments(response.recentDocuments);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не вдалося завантажити документи');
      }
    };

    loadDocuments();
  }, []);

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!folders.length && !recentDocuments.length) {
    return <p className="text-gray-600">Завантаження документів...</p>;
  }

  const getFileIcon = (type: string) => {
    const colors: Record<string, string> = {
      PDF: 'bg-red-100 text-red-600',
      DOCX: 'bg-blue-100 text-blue-600',
      XLSX: 'bg-green-100 text-green-600',
      PPTX: 'bg-orange-100 text-orange-600',
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-gray-900 mb-2">Документи</h1>
          <p className="text-gray-600">Корпоративні документи та файли</p>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Пошук документів..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Фільтр
          </button>
        </div>
      </div>

      {/* Folders */}
      <div>
        <h2 className="text-gray-900 mb-4">Папки</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {folders.map((folder) => {
            const Icon = Folder;
            return (
              <div
                key={folder.id}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-gray-900 mb-1">{folder.name}</h3>
                <p className="text-gray-600">{folder.files} файлів</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Documents */}
      <div>
        <h2 className="text-gray-900 mb-4">Останні документи</h2>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-600">Назва</th>
                  <th className="text-left px-6 py-3 text-gray-600">Категорія</th>
                  <th className="text-left px-6 py-3 text-gray-600">Розмір</th>
                  <th className="text-left px-6 py-3 text-gray-600">Змінено</th>
                  <th className="text-left px-6 py-3 text-gray-600">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getFileIcon(doc.type)}`}>
                          <File className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-gray-900">{doc.name}</p>
                          <p className="text-gray-500">{doc.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{doc.size}</td>
                    <td className="px-6 py-4 text-gray-600">{doc.modified}</td>
                    <td className="px-6 py-4">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Download className="w-5 h-5 text-gray-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
