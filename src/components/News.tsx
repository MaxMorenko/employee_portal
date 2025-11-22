import { Calendar, User, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getNews } from '../api/client';
import type { NewsItem } from '../api/types';

export function News() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['Всі']);
  const [selectedCategory, setSelectedCategory] = useState('Всі');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const response = await getNews();
        setNewsItems(response.items);
        setCategories(response.categories);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не вдалося отримати новини');
      }
    };

    loadNews();
  }, []);

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!newsItems.length) {
    return <p className="text-gray-600">Завантаження новин...</p>;
  }

  const filteredNews = selectedCategory === 'Всі'
    ? newsItems
    : newsItems.filter(item => item.category === selectedCategory);

  const featuredNews = newsItems.find(item => item.featured);
  const regularNews = filteredNews.filter(item => !item.featured);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Новини компанії</h1>
          <p className="text-gray-600">Останні оновлення та оголошення</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Featured News */}
      {featuredNews && selectedCategory === 'Всі' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-6">
            <ImageWithFallback
              src={featuredNews.image}
              alt={featuredNews.title}
              className="w-full h-full object-cover min-h-64"
            />
            <div className="p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full">
                  {featuredNews.category}
                </span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                  Важливо
                </span>
              </div>
              <h2 className="text-gray-900 mb-3">{featuredNews.title}</h2>
              <p className="text-gray-600 mb-4">{featuredNews.excerpt}</p>
              <div className="flex items-center gap-4 text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{featuredNews.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{featuredNews.date}</span>
                </div>
              </div>
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                Читати далі
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regularNews.map((news) => (
          <div
            key={news.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          >
            <ImageWithFallback
              src={news.image}
              alt={news.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                  {news.category}
                </span>
              </div>
              <h3 className="text-gray-900 mb-2">{news.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{news.excerpt}</p>
              <div className="flex flex-col gap-2 text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{news.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{news.date}</span>
                </div>
              </div>
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                Читати далі
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
