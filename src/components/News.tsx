import { Newspaper, Calendar, User, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function News() {
  const newsItems = [
    {
      id: 1,
      title: 'Запуск нового продукту: AI Platform 2.0',
      excerpt: 'Раді оголосити про запуск нашої нової платформи штучного інтелекту, яка допоможе клієнтам автоматизувати їх бізнес-процеси.',
      category: 'Продукт',
      author: 'Марія Петренко',
      date: '21 листопада 2025',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=300&fit=crop',
      featured: true,
    },
    {
      id: 2,
      title: 'Корпоративний зимовий захід',
      excerpt: 'Запрошуємо всіх співробітників на щорічний зимовий захід 15 грудня. Буде багато розваг, подарунків та сюрпризів!',
      category: 'Події',
      author: 'Андрій Коваль',
      date: '20 листопада 2025',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=300&fit=crop',
      featured: false,
    },
    {
      id: 3,
      title: 'Оновлення політики відпусток',
      excerpt: 'З 1 грудня набувають чинності нові правила оформлення та узгодження відпусток. Ознайомтесь з деталями.',
      category: 'HR',
      author: 'Олена Сидоренко',
      date: '19 листопада 2025',
      image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&h=300&fit=crop',
      featured: false,
    },
    {
      id: 4,
      title: 'Квартальні результати: рекордний ріст',
      excerpt: 'Третій квартал виявився найуспішнішим в історії компанії. Дякуємо всім за вашу наполегливу працю!',
      category: 'Фінанси',
      author: 'Ігор Мельник',
      date: '18 листопада 2025',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop',
      featured: false,
    },
    {
      id: 5,
      title: 'Програма навчання для співробітників',
      excerpt: 'Стартує нова програма професійного розвитку з курсами по лідерству, технологіям та soft skills.',
      category: 'Навчання',
      author: 'Тетяна Бойко',
      date: '17 листопада 2025',
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=300&fit=crop',
      featured: false,
    },
    {
      id: 6,
      title: 'Екологічні ініціативи компанії',
      excerpt: 'Наша компанія приєдналась до програми Carbon Neutral. Дізнайтесь, як ми зменшуємо наш вплив на довкілля.',
      category: 'CSR',
      author: 'Максим Гончар',
      date: '16 листопада 2025',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=300&fit=crop',
      featured: false,
    },
  ];

  const categories = ['Всі', 'Продукт', 'Події', 'HR', 'Фінанси', 'Навчання', 'CSR'];
  const [selectedCategory, setSelectedCategory] = useState('Всі');

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
