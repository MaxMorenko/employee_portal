import { Mail, Phone, MapPin, Calendar, Clock, Briefcase, User, Users, Trophy, Heart } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { Badge } from '../../components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../../components/ui/sheet';
import { TeamMember } from './TeamTree';

function getDuration(startDateStr: string) {
  const start = new Date(startDateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  
  if (years > 0) {
    return months > 0 ? `${years} р. ${months} міс.` : `${years} р.`;
  }
  return `${months} міс.`;
}

interface EmployeeProfileProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
  allMembers: TeamMember[];
}

export function EmployeeProfile({ member, isOpen, onClose, allMembers }: EmployeeProfileProps) {
  if (!member) return null;

  const manager = member.managerId ? allMembers.find(m => m.id === member.managerId) : null;
  const directReports = allMembers.filter(m => m.managerId === member.id);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-md w-full">
        <SheetHeader className="text-left">
          <SheetTitle>Профіль співробітника</SheetTitle>
          <SheetDescription>
            Детальна інформація про співробітника компанії.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex flex-col items-center text-center">
          <ImageWithFallback
            src={member.image}
            alt={member.name}
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-50 mb-4 shadow-md"
          />
          <h2 className="text-2xl font-bold text-gray-900">{member.name}</h2>
          <p className="text-blue-600 font-medium text-lg">{member.position}</p>
          <Badge variant="secondary" className="mt-2 px-3 py-1 text-sm">{member.department}</Badge>
        </div>

        <div className="mt-8 space-y-8 pb-6">
          {/* Contact Info */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Контактна інформація</h3>
            <div className="space-y-4">
              {member.email && (
                <div className="flex items-center gap-3 text-gray-700 group">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                    <Mail size={18} />
                  </div>
                  <span className="font-medium">{member.email}</span>
                </div>
              )}
              {member.phone && (
                <div className="flex items-center gap-3 text-gray-700 group">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                    <Phone size={18} />
                  </div>
                  <span className="font-medium">{member.phone}</span>
                </div>
              )}
              {member.location && (
                <div className="flex items-center gap-3 text-gray-700 group">
                   <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                    <MapPin size={18} />
                  </div>
                  <span className="font-medium">{member.location}</span>
                </div>
              )}
            </div>
          </section>

          {/* Work Info */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Робота в компанії</h3>
            <div className="space-y-4">
              {member.startDate && (
                <div className="flex items-center gap-3 text-gray-700">
                   <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Працює в команді</p>
                    <p className="font-medium">{getDuration(member.startDate)}</p>
                  </div>
                </div>
              )}
              
              {manager && (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Керівник</p>
                    <p className="font-medium">{manager.name}</p>
                  </div>
                </div>
              )}

              {directReports.length > 0 && (
                <div className="flex items-start gap-3 text-gray-700">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Підлеглі ({directReports.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {directReports.map(report => (
                        <Badge key={report.id} variant="outline" className="font-normal bg-white hover:bg-gray-50">
                          {report.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

           {/* Personal Info */}
           <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Особисте</h3>
            <div className="space-y-4">
              {member.birthday && (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-600">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">День народження</p>
                    <p className="font-medium">{member.birthday}</p>
                  </div>
                </div>
              )}
              
              {member.projects && member.projects.length > 0 && (
                <div className="flex items-start gap-3 text-gray-700">
                   <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                    <Briefcase size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-2">Проєкти</p>
                    <div className="flex flex-wrap gap-2">
                      {member.projects.map((proj: string) => (
                        <Badge key={proj} variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-100">
                          {proj}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

               {member.interests && member.interests.length > 0 && (
                <div className="flex items-start gap-3 text-gray-700">
                   <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                    <Heart size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-2">Інтереси & Хобі</p>
                    <div className="flex flex-wrap gap-2">
                      {member.interests.map((interest: string) => (
                        <Badge key={interest} variant="outline" className="bg-green-50/50 hover:bg-green-50 border-green-100 text-green-700">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {member.about && (
                 <div className="flex items-start gap-3 text-gray-700">
                   <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 shrink-0">
                    <Trophy size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Досягнення / Про себе</p>
                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {member.about}
                    </p>
                  </div>
                </div>
              )}

            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
