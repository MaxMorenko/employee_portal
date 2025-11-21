import { FileText, Download, Search, Filter, Folder, File } from 'lucide-react';

export function Documents() {
  const folders = [
    { id: 1, name: 'Політики компанії', files: 12, icon: Folder },
    { id: 2, name: 'Шаблони документів', files: 24, icon: Folder },
    { id: 3, name: 'Презентації', files: 8, icon: Folder },
    { id: 4, name: 'Звіти', files: 15, icon: Folder },
  ];

  const recentDocuments = [
    {
      id: 1,
      name: 'Політика відпусток 2025',
      type: 'PDF',
      size: '2.4 MB',
      modified: '21 листопада 2025',
      category: 'HR',
    },
    {
      id: 2,
      name: 'Квартальний звіт Q3',
      type: 'XLSX',
      size: '5.1 MB',
      modified: '20 листопада 2025',
      category: 'Фінанси',
    },
    {
      id: 3,
      name: 'Презентація продукту',
      type: 'PPTX',
      size: '15.2 MB',
      modified: '19 листопада 2025',
      category: 'Продукт',
    },
    {
      id: 4,
      name: 'Інструкція з безпеки',
      type: 'PDF',
      size: '1.8 MB',
      modified: '18 листопада 2025',
      category: 'HR',
    },
    {
      id: 5,
      name: 'Шаблон договору',
      type: 'DOCX',
      size: '245 KB',
      modified: '17 листопада 2025',
      category: 'Юридичні',
    },
    {
      id: 6,
      name: 'Технічна документація API',
      type: 'PDF',
      size: '3.7 MB',
      modified: '16 листопада 2025',
      category: 'Технічні',
    },
  ];

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
            const Icon = folder.icon;
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
