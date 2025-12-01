import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { teamQueries } from '@/lib/supabase/queries';
import { Facebook, Linkedin, MessageSquare, Instagram, Twitter, Mail, Loader2 } from 'lucide-react';

interface TeamMember {
  id: string;
  name_en: string;
  name_ar: string;
  position_en: string;
  position_ar: string;
  bio_en: string;
  bio_ar: string;
  image: string;
  linkedin_url?: string;
  twitter_url?: string;
  email?: string;
}

const TeamSection = () => {
  const { t, dir, language } = useLanguage();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getTeamData = async () => {
      try {
        setLoading(true);
        const data = await teamQueries.getAll();

        const teamMembers: TeamMember[] = data.map(member => ({
          id: member.id,
          name_en: member.name_en,
          name_ar: member.name_ar,
          position_en: member.position_en,
          position_ar: member.position_ar,
          bio_en: member.bio_en || '',
          bio_ar: member.bio_ar || '',
          image: member.image || '/placeholder.svg',
          linkedin_url: member.linkedin_url || '',
          twitter_url: member.twitter_url || '',
          email: member.email || ''
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
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-odoo-purple mb-6">
            {t('Meet Our Team', 'تعرف على فريقنا')}
          </h2>
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 text-odoo-purple animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-odoo-purple mb-6">
            {t('Meet Our Team', 'تعرف على فريقنا')}
          </h2>
          <div className="bg-red-50 p-4 rounded-md text-red-500 max-w-lg mx-auto">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-odoo-purple mb-6">
          {t('Meet Our Team', 'تعرف على فريقنا')}
        </h2>
        <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          {t('Our team of certified Odoo experts is dedicated to helping your business succeed with the perfect ERP solution.', 'فريقنا من خبراء أودو المعتمدين مكرس لمساعدة عملك على النجاح مع حل ERP المثالي.')}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map(member => (
            <div key={member.id} className="group bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-border/50">
              <div className="relative overflow-hidden h-72">
                <img 
                  src={member.image} 
                  alt={language === 'en' ? member.name_en : member.name_ar}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex justify-center gap-3">
                    {member.linkedin_url && (
                      <a 
                        href={member.linkedin_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="bg-background/90 backdrop-blur-sm p-3 rounded-full text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110" 
                        aria-label="LinkedIn"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {member.twitter_url && (
                      <a 
                        href={member.twitter_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="bg-background/90 backdrop-blur-sm p-3 rounded-full text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110" 
                        aria-label="Twitter"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                    {member.email && (
                      <a 
                        href={`mailto:${member.email}`} 
                        className="bg-background/90 backdrop-blur-sm p-3 rounded-full text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110" 
                        aria-label="Email"
                      >
                        <Mail className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6 text-center bg-card">
                <h3 className="text-xl font-bold mb-2 text-foreground">
                  {language === 'en' ? member.name_en : member.name_ar}
                </h3>
                <p className="text-primary font-semibold mb-4 text-sm uppercase tracking-wide">
                  {language === 'en' ? member.position_en : member.position_ar}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {language === 'en' ? member.bio_en : member.bio_ar}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
