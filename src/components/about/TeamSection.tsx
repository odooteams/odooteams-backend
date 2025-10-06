import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Facebook, Linkedin, MessageSquare, Instagram, Twitter, Mail, Loader2 } from 'lucide-react';
import { fetchSheetData, GOOGLE_SHEETS_CONFIG } from '@/lib/googleSheets';
interface TeamMember {
  id: number;
  name: {
    en: string;
    ar: string;
  };
  title: {
    en: string;
    ar: string;
  };
  bio: {
    en: string;
    ar: string;
  };
  image: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  whatsapp?: string;
  email?: string;
}
const TeamSection = () => {
  const {
    t,
    dir,
    language
  } = useLanguage();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const getTeamData = async () => {
      try {
        setLoading(true);
        const data = await fetchSheetData(GOOGLE_SHEETS_CONFIG.API_KEY, GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID, GOOGLE_SHEETS_CONFIG.SHEETS.TEAM);

        // Map the sheet data to our TeamMember interface
        const teamMembers: TeamMember[] = data.map((row, index) => ({
          id: index + 1,
          name: {
            en: row.Name_en || '',
            ar: row.Name_ar || ''
          },
          title: {
            en: row.Position_en || '',
            ar: row.Position_ar || ''
          },
          bio: {
            en: row.bio_en || '',
            ar: row.bio_ar || ''
          },
          image: row.image || '/placeholder.svg',
          facebook: row.Facebook || '',
          linkedin: row.LinkedIn || '',
          twitter: row.Twitter || '',
          instagram: row.Instagram || '',
          whatsapp: row.WhatsApp || '',
          email: row.Email || ''
        }));
        setTeam(teamMembers);
        setError(null);
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError(t('Failed to load team data. Please try again later.', 'فشل تحميل بيانات الفريق. يرجى المحاولة مرة أخرى في وقت لاحق.'));
      } finally {
        setLoading(false);
      }
    };
    getTeamData();
  }, [t]);
  if (loading) {
    return <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-odoo-purple mb-6">
            {t('Meet Our Team', 'تعرف على فريقنا')}
          </h2>
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 text-odoo-purple animate-spin" />
          </div>
        </div>
      </section>;
  }
  if (error) {
    return <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-odoo-purple mb-6">
            {t('Meet Our Team', 'تعرف على فريقنا')}
          </h2>
          <div className="bg-red-50 p-4 rounded-md text-red-500 max-w-lg mx-auto">
            <p>{error}</p>
          </div>
        </div>
      </section>;
  }
  return <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-odoo-purple mb-6">
          {t('Meet Our Team', 'تعرف على فريقنا')}
        </h2>
        <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          {t('Our team of certified Odoo experts is dedicated to helping your business succeed with the perfect ERP solution.', 'فريقنا من خبراء أودو المعتمدين مكرس لمساعدة عملك على النجاح مع حل ERP المثالي.')}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map(member => <div key={member.id} className="card group hover:-translate-y-2 transition-transform duration-300">
              <div className="relative overflow-hidden h-64 rounded-t-lg">
                <img src={member.image} alt={language === 'en' ? member.name.en : member.name.ar} className="w-full h-full object-cover rounded-t-lg" />
                <div className="absolute inset-0 bg-gradient-to-t from-odoo-purple to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-300 rounded-t-lg"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex justify-center space-x-4 space-x-reverse:rtl">
                    {member.facebook && <a href={member.facebook} target="_blank" rel="noopener noreferrer" className="bg-white p-2 rounded-full text-odoo-purple hover:text-odoo-magenta transition-colors" aria-label="Facebook">
                        <Facebook className="h-5 w-5" />
                      </a>}
                    {member.linkedin && <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="bg-white p-2 rounded-full text-odoo-purple hover:text-odoo-magenta transition-colors" aria-label="LinkedIn">
                        <Linkedin className="h-5 w-5" />
                      </a>}
                    {member.twitter && <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="bg-white p-2 rounded-full text-odoo-purple hover:text-odoo-magenta transition-colors" aria-label="Twitter">
                        <Twitter className="h-5 w-5" />
                      </a>}
                    {member.instagram && <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="bg-white p-2 rounded-full text-odoo-purple hover:text-odoo-magenta transition-colors" aria-label="Instagram">
                        <Instagram className="h-5 w-5" />
                      </a>}
                    {member.whatsapp && <a href={`https://wa.me/${member.whatsapp}`} target="_blank" rel="noopener noreferrer" className="bg-white p-2 rounded-full text-odoo-purple hover:text-odoo-magenta transition-colors" aria-label="WhatsApp">
                        <MessageSquare className="h-5 w-5" />
                      </a>}
                    {member.email && <a href={`mailto:${member.email}`} className="bg-white p-2 rounded-full text-odoo-purple hover:text-odoo-magenta transition-colors" aria-label="Email">
                        <Mail className="h-5 w-5" />
                      </a>}
                  </div>
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold mb-1 text-odoo-purple">
                  {language === 'en' ? member.name.en : member.name.ar}
                </h3>
                <p className="text-odoo-magenta font-medium mb-3">
                  {language === 'en' ? member.title.en : member.title.ar}
                </p>
                <p className="text-gray-600">
                  {language === 'en' ? member.bio.en : member.bio.ar}
                </p>
              </div>
            </div>)}
        </div>
      </div>
    </section>;
};
export default TeamSection;
