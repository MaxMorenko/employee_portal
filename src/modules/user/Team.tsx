import { Mail, Phone, MapPin, Search, Users as UsersIcon, LayoutGrid, GitGraph } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { TeamTree, TeamMember } from './TeamTree';
import { EmployeeProfile } from './EmployeeProfile';

export function Team() {
  const departments = [
    { id: 'all', name: 'Всі відділи', count: 48 },
    { id: 'management', name: 'Менеджмент', count: 1 },
    { id: 'dev', name: 'Розробка', count: 18 },
    { id: 'design', name: 'Дизайн', count: 8 },
    { id: 'marketing', name: 'Маркетинг', count: 12 },
    { id: 'hr', name: 'HR', count: 5 },
    { id: 'sales', name: 'Продажі', count: 4 },
  ];

  const teamMembers: TeamMember[] = [
    {
      id: 0,
      name: 'Олександр Клименко',
      position: 'CEO',
      department: 'Менеджмент',
      email: 'oleksandr.klymenko@company.com',
      phone: '+380 67 000 1122',
      location: 'Київ',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop',
      managerId: null,
      startDate: '2015-03-15',
      birthday: '12 квітня',
      projects: ['Стратегія 2025', 'Міжнародна експансія'],
      interests: ['Гольф', 'Інвестиції', 'Подорожі'],
      about: 'Засновник компанії. Має понад 15 років досвіду в IT-менеджменті. Захоплюється побудовою ефективних команд та інноваціями.'
    },
    {
      id: 1,
      name: 'Олена Шевченко',
      position: 'Head of Development',
      department: 'Розробка',
      email: 'olena.shevchenko@company.com',
      phone: '+380 67 111 2233',
      location: 'Київ',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
      managerId: 0,
      startDate: '2016-08-01',
      birthday: '25 серпня',
      projects: ['Core Platform', 'Architecture Review'],
      interests: ['Туризм', 'Читання', 'Йога'],
      about: 'Відповідає за технічну стратегію та розвиток команди розробників. Любить складні архітектурні задачі.'
    },
    {
      id: 2,
      name: 'Дмитро Бондаренко',
      position: 'Senior Backend Developer',
      department: 'Розробка',
      email: 'dmytro.bondarenko@company.com',
      phone: '+380 67 222 3344',
      location: 'Київ',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      managerId: 1,
      startDate: '2018-11-10',
      birthday: '5 лютого',
      projects: ['API Gateway', 'Data Migration'],
      interests: ['Велоспорт', 'Open Source', 'Кава'],
      about: 'Експерт з Node.js та баз даних. Активний контриб\'ютор в Open Source проєкти.'
    },
    {
      id: 3,
      name: 'Анна Коваль',
      position: 'UX/UI Designer',
      department: 'Дизайн',
      email: 'anna.koval@company.com',
      phone: '+380 67 333 4455',
      location: 'Львів',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
      managerId: 9,
      startDate: '2020-02-20',
      birthday: '15 травня',
      projects: ['Mobile App Redesign', 'Design System'],
      interests: ['Живопис', 'Фотографія', 'Подорожі'],
      about: 'Створює інтуїтивно зрозумілі та естетичні інтерфейси. Завжди ставить користувача на перше місце.'
    },
    {
      id: 4,
      name: 'Максим Іванов',
      position: 'Marketing Manager',
      department: 'Маркетинг',
      email: 'maksym.ivanov@company.com',
      phone: '+380 67 444 5566',
      location: 'Київ',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
      managerId: 0,
      startDate: '2019-05-12',
      birthday: '30 жовтня',
      projects: ['Q4 Campaign', 'Brand Awareness'],
      interests: ['Маркетинг', 'Психологія', 'Футбол'],
      about: 'Креативний маркетолог з аналітичним складом розуму. Вміє знаходити нестандартні рішення для просування продуктів.'
    },
    {
      id: 5,
      name: 'Софія Ткаченко',
      position: 'HR Manager',
      department: 'HR',
      email: 'sofia.tkachenko@company.com',
      phone: '+380 67 555 6677',
      location: 'Київ',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
      managerId: 0,
      startDate: '2021-09-01',
      birthday: '10 липня',
      projects: ['Team Building 2024', 'Recruitment Drive'],
      interests: ['Психологія', 'Кулінарія', 'Танці'],
      about: 'Піклується про атмосферу в колективі та розвиток талантів. Організовує найкращі корпоративні заходи.'
    },
    {
      id: 6,
      name: 'Андрій Мельник',
      position: 'Frontend Developer',
      department: 'Розробка',
      email: 'andriy.melnyk@company.com',
      phone: '+380 67 666 7788',
      location: 'Харків',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
      managerId: 1,
      startDate: '2022-01-15',
      birthday: '3 березня',
      projects: ['Client Portal', 'Dashboard UI'],
      interests: ['Gaming', 'React', 'Snowboarding'],
      about: 'Спеціалізується на створенні швидких та адаптивних інтерфейсів. Любить експериментувати з новими технологіями.'
    },
    {
      id: 7,
      name: 'Марія Петренко',
      position: 'Product Manager',
      department: 'Розробка',
      email: 'maria.petrenko@company.com',
      phone: '+380 67 777 8899',
      location: 'Київ',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop',
      managerId: 1,
      startDate: '2019-11-05',
      birthday: '18 вересня',
      projects: ['Roadmap 2024', 'Customer Feedback'],
      interests: ['Agile', 'Книги', 'Біг'],
      about: 'Вміє перетворювати складні ідеї на чіткі завдання. Завжди тримає руку на пульсі потреб клієнтів.'
    },
    {
      id: 8,
      name: 'Ігор Сидоренко',
      position: 'Sales Director',
      department: 'Продажі',
      email: 'igor.sydorenko@company.com',
      phone: '+380 67 888 9900',
      location: 'Одеса',
      image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop',
      managerId: 0,
      startDate: '2017-04-20',
      birthday: '22 грудня',
      projects: ['Enterprise Sales', 'Partner Network'],
      interests: ['Переговори', 'Автомобілі', 'Риболовля'],
      about: 'Професіонал у сфері B2B продажів. Вміє будувати довгострокові відносини з ключовими клієнтами.'
    },
    {
      id: 9,
      name: 'Тетяна Бойко',
      position: 'Lead Designer',
      department: 'Дизайн',
      email: 'tetiana.boiko@company.com',
      phone: '+380 67 999 0011',
      location: 'Львів',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
      managerId: 0,
      startDate: '2018-06-10',
      birthday: '7 червня',
      projects: ['Rebranding', 'Design Culture'],
      interests: ['Мистецтво', 'Ілюстрація', 'Мода'],
      about: 'Надихає команду на створення креативних рішень. Має бездоганний смак та увагу до деталей.'
    },
  ];

  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'tree'>('grid');
  const [selectedMemberId, setSelectedMemberId] = useState<number | string | null>(null);

  const filteredMembers = selectedDepartment === 'all'
    ? teamMembers
    : teamMembers.filter(member => {
        const dept = departments.find(d => d.id === selectedDepartment);
        return member.department === dept?.name;
      });

  const selectedMember = selectedMemberId !== null 
    ? teamMembers.find(m => m.id === selectedMemberId) || null 
    : null;

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMemberId(member.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-gray-900 mb-2">Наша команда</h1>
          <p className="text-gray-600">{teamMembers.length} співробітників</p>
        </div>
        
        <div className="flex gap-4 items-center">
           <div className="bg-white border border-gray-200 rounded-lg p-1 flex gap-1">
             <button
               onClick={() => setViewMode('grid')}
               className={`p-2 rounded-md transition-colors ${
                 viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
               }`}
               title="Список"
             >
               <LayoutGrid size={20} />
             </button>
             <button
               onClick={() => setViewMode('tree')}
               className={`p-2 rounded-md transition-colors ${
                 viewMode === 'tree' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
               }`}
               title="Дерево (Структура)"
             >
               <GitGraph size={20} />
             </button>
           </div>

           <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Пошук..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <>
          {/* Department Filter (Only for Grid View) */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDepartment(dept.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedDepartment === dept.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <UsersIcon className="w-4 h-4" />
                <span>{dept.name}</span>
                <span className={`px-2 py-0.5 rounded-full ${
                  selectedDepartment === dept.id
                    ? 'bg-blue-500'
                    : 'bg-gray-100'
                }`}>
                  {dept.count}
                </span>
              </button>
            ))}
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleMemberClick(member)}
              >
                <div className="flex items-start gap-4 mb-4">
                  <ImageWithFallback
                    src={member.image}
                    alt={member.name}
                    className="w-16 h-16 rounded-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{member.name}</h3>
                    <p className="text-gray-600 mb-1">{member.position}</p>
                    <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                      {member.department}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {member.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{member.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{member.location}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button 
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle "Write" action
                    }}
                  >
                    Написати
                  </button>
                  <button 
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMemberClick(member);
                    }}
                  >
                    Профіль
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <TeamTree members={teamMembers} onMemberClick={handleMemberClick} />
      )}

      <EmployeeProfile 
        member={selectedMember}
        isOpen={!!selectedMember}
        onClose={() => setSelectedMemberId(null)}
        allMembers={teamMembers}
      />
    </div>
  );
}
