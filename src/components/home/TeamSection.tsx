
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Facebook, Linkedin, MessageSquare, Loader2, Instagram, Twitter, Mail } from 'lucide-react';
import { teamQueries } from '@/lib/supabase/queries';

interface TeamMember {
  id: string;
  name: { en: string; ar: string };
  title: { en: string; ar: string };
  bio: { en: string; ar: string };
  image: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  whatsapp?: string;
  email?: string;
}

const TeamSection = () => {
  const { t, language, dir } = useLanguage();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const getTeamData = async () => {
      try {
        setLoading(true);
        const data = await teamQueries.getAll();
        
        const teamMembers: TeamMember[] = data.map((member) => ({
          id: member.id,
          name: { 
            en: member.name_en || member.name_ar || '', 
            ar: member.name_ar || member.name_en || '' 
          },
          title: { 
            en: member.position_en || member.position_ar || '', 
            ar: member.position_ar || member.position_en || '' 
          },
          bio: { 
            en: member.bio_en || member.bio_ar || '', 
            ar: member.bio_ar || member.bio_en || '' 
          },
          image: member.image || '/placeholder.svg',
          linkedin: member.linkedin_url || '',
          twitter: member.twitter_url || '',
          email: member.email || ''
        }));
        
        setTeam(teamMembers);
        setError(null);
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError(t('Failed to load team data. Please try again later.', 
                   'فشل تحميل بيانات الفريق. يرجى المحاولة مرة أخرى في وقت لاحق.'));
      } finally {
        setLoading(false);
      }
    };
    
    getTeamData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  if (loading) {
    return (
      <section className={`py-16 bg-gray-50 ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="section-title mb-8">{t('Our Team', 'فريقنا')}</h2>
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 text-odoo-purple animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`py-16 bg-gray-50 ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="section-title mb-8">{t('Our Team', 'فريقنا')}</h2>
          <div className="bg-red-50 p-4 rounded-md text-red-500 max-w-lg mx-auto">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  // Only display the first 5 team members to maintain layout consistency
  const displayTeam = team.slice(0, 5);
  const topRow = displayTeam.slice(0, 3);
  const bottomRow = displayTeam.slice(3, 5);

  return (
    <section className={`py-16 bg-gray-50 ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-title">{t('Our Team', 'فريقنا')}</h2>
          <p className="section-subtitle max-w-3xl mx-auto">
            {t(
              'Meet our team of Odoo experts dedicated to your business success.',
              'تعرف على فريقنا من خبراء أودو المتخصصين في نجاح عملك.'
            )}
          </p>
        </div>

        {topRow.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topRow.map((member) => (
              <div key={member.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden group transform hover:-translate-y-3 hover:scale-[1.02] transition-all duration-500 ease-out backdrop-blur-sm bg-white/95 hover:bg-white relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-transparent before:via-transparent before:to-primary/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
                <div className="relative overflow-hidden h-72">
                  <img 
                    src={member.image} 
                    alt={language === 'en' ? member.name.en : member.name.ar} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-odoo-purple/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <div className="flex justify-center space-x-3 space-x-reverse:rtl">
                      {member.facebook && (
                        <a href={member.facebook} target="_blank" rel="noopener noreferrer" className="bg-white/90 backdrop-blur-sm p-3 rounded-full text-odoo-purple hover:text-white hover:bg-odoo-magenta transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl" aria-label="Facebook">
                          <Facebook className="h-5 w-5" />
                        </a>
                      )}
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="bg-white/90 backdrop-blur-sm p-3 rounded-full text-odoo-purple hover:text-white hover:bg-odoo-magenta transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl" aria-label="LinkedIn">
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                      {member.twitter && (
                        <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="bg-white p-2 rounded-full text-odoo-purple hover:text-odoo-magenta transition-colors" aria-label="Twitter">
                          <Twitter className="h-5 w-5" />
                        </a>
                      )}
                      {member.instagram && (
                        <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="bg-white p-2 rounded-full text-odoo-purple hover:text-odoo-magenta transition-colors" aria-label="Instagram">
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                      {member.whatsapp && (
                        <a href={`https://wa.me/${member.whatsapp}`} target="_blank" rel="noopener noreferrer" className="bg-white p-2 rounded-full text-odoo-purple hover:text-odoo-magenta transition-colors" aria-label="WhatsApp">
                          <MessageSquare className="h-5 w-5" />
                        </a>
                      )}
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="bg-white p-2 rounded-full text-odoo-purple hover:text-odoo-magenta transition-colors" aria-label="Email">
                          <Mail className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-8 text-center relative z-10">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6 w-12 h-1 bg-gradient-to-r from-odoo-purple to-odoo-magenta rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <h3 className="text-xl font-bold mb-2 text-odoo-purple group-hover:text-odoo-magenta transition-colors duration-300">
                    {language === 'en' ? member.name.en : member.name.ar}
                  </h3>
                  <p className="text-odoo-magenta font-semibold mb-4 text-sm uppercase tracking-wider">
                    {language === 'en' ? member.title.en : member.title.ar}
                  </p>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {language === 'en' ? member.bio.en : member.bio.ar}
                  </p>
                  <div className="mt-6 h-px bg-gradient-to-r from-transparent via-odoo-purple/20 to-transparent"></div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {bottomRow.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {bottomRow.map((member) => (
              <div key={member.id} className="card group hover:-translate-y-2 transition-transform duration-300">
                <div className="flex flex-col md:flex-row">
                  <div className="relative overflow-hidden h-64 md:h-auto md:w-1/3">
                    <img 
                      src={member.image} 
                      alt={language === 'en' ? member.name.en : member.name.ar} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-odoo-purple to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6 md:w-2/3">
                    <h3 className="text-xl font-bold mb-1 text-odoo-purple">
                      {language === 'en' ? member.name.en : member.name.ar}
                    </h3>
                    <p className="text-odoo-magenta font-medium mb-3">
                      {language === 'en' ? member.title.en : member.title.ar}
                    </p>
                    <p className="text-gray-600 mb-4">
                      {language === 'en' ? member.bio.en : member.bio.ar}
                    </p>
                    <div className="flex space-x-3 space-x-reverse:rtl">
                      {member.facebook && (
                        <a href={member.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-odoo-magenta transition-colors" aria-label="Facebook">
                          <Facebook className="h-5 w-5" />
                        </a>
                      )}
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-odoo-magenta transition-colors" aria-label="LinkedIn">
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                      {member.twitter && (
                        <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-odoo-magenta transition-colors" aria-label="Twitter">
                          <Twitter className="h-5 w-5" />
                        </a>
                      )}
                      {member.instagram && (
                        <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-odoo-magenta transition-colors" aria-label="Instagram">
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                      {member.whatsapp && (
                        <a href={`https://wa.me/${member.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-odoo-magenta transition-colors" aria-label="WhatsApp">
                          <MessageSquare className="h-5 w-5" />
                        </a>
                      )}
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="text-gray-600 hover:text-odoo-magenta transition-colors" aria-label="Email">
                          <Mail className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TeamSection;
