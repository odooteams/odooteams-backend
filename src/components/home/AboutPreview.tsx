
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { ArrowRight, ArrowLeft, Facebook, Linkedin, MessageSquare, Instagram, Twitter, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchSheetData, GOOGLE_SHEETS_CONFIG } from '@/lib/googleSheets';

interface TeamMember {
  id: number;
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

const AboutPreview = () => {
  const { t, dir, language } = useLanguage();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const [teamLeader, setTeamLeader] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const getTeamData = async () => {
      try {
        setLoading(true);
        const data = await fetchSheetData(
          GOOGLE_SHEETS_CONFIG.API_KEY,
          GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID,
          GOOGLE_SHEETS_CONFIG.SHEETS.TEAM
        );
        
        if (data && data.length > 0) {
          // Get the team leader (first entry or entry marked as leader)
          const leader = data.find(member => member.isLeader === 'true') || data[0];
          
          const teamLeader: TeamMember = {
            id: 1,
            name: { 
              en: leader.Name_en || '', 
              ar: leader.Name_ar || '' 
            },
            title: { 
              en: leader.Position_en || '', 
              ar: leader.Position_ar || '' 
            },
            bio: { 
              en: leader.bio_en || '', 
              ar: leader.bio_ar || '' 
            },
            image: leader.image || '/placeholder.svg',
            facebook: leader.Facebook || '',
            linkedin: leader.LinkedIn || '',
            twitter: leader.Twitter || '',
            instagram: leader.Instagram || '',
            whatsapp: leader.WhatsApp || '',
            email: leader.Email || ''
          };
          
          setTeamLeader(teamLeader);
        }
      } catch (err) {
        console.error('Error fetching team leader data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    getTeamData();
  }, []);
  
  return (
    <section className={`py-20 ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className={`${dir === 'rtl' ? 'lg:order-2' : ''}`}>
            <img 
              src="/lovable-uploads/e8433aef-9332-4de5-a325-42043909dbab.png" 
              alt={t('About OdooTeams', 'عن أودو تيمز')} 
              className="rounded-2xl shadow-xl w-full h-auto object-cover animate-scale-in"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/placeholder.svg';
              }}
            />
          </div>
          
          <div className={`${dir === 'rtl' ? 'lg:order-1' : ''}`}>
            <h2 className="section-title animate-slide-in-right">
              {t('We Are OdooTeams', 'نحن أودو تيمز')}
            </h2>
            
            <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
              {t(
                'OdooTeams is a specialized consultancy providing top-tier Odoo ERP solutions for businesses across various industries. With years of experience and a passion for excellence, our team ensures successful implementation and continued support for all your Odoo needs.',
                'أودو تيمز هي شركة استشارية متخصصة تقدم حلول أودو ERP عالية المستوى للشركات عبر مختلف الصناعات. بفضل سنوات من الخبرة وشغف بالتميز، يضمن فريقنا التنفيذ الناجح والدعم المستمر لجميع احتياجات أودو الخاصة بك.'
              )}
            </p>
            
            {teamLeader && (
              <div className="mb-8 p-6 bg-muted/50 rounded-xl">
                <h3 className="text-xl font-bold text-primary mb-2">
                  {language === 'en' ? teamLeader.name.en : teamLeader.name.ar}
                </h3>
                <p className="text-muted-foreground mb-3">{language === 'en' ? teamLeader.title.en : teamLeader.title.ar}</p>
                <p className="text-foreground/80 mb-4">
                  {language === 'en' ? teamLeader.bio.en : teamLeader.bio.ar}
                </p>
                
                <div className="flex items-center gap-4">
                  {teamLeader.facebook && (
                    <a href={teamLeader.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition duration-300" aria-label="Facebook">
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  {teamLeader.linkedin && (
                    <a href={teamLeader.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition duration-300" aria-label="LinkedIn">
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {teamLeader.twitter && (
                    <a href={teamLeader.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition duration-300" aria-label="Twitter">
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {teamLeader.instagram && (
                    <a href={teamLeader.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition duration-300" aria-label="Instagram">
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {teamLeader.whatsapp && (
                    <a href={`https://wa.me/${teamLeader.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition duration-300" aria-label="WhatsApp">
                      <MessageSquare className="h-5 w-5" />
                    </a>
                  )}
                  {teamLeader.email && (
                    <a href={`mailto:${teamLeader.email}`} className="text-muted-foreground hover:text-primary transition duration-300" aria-label="Email">
                      <Mail className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            )}
            
            <Link 
              to="/about" 
              className="btn-primary inline-flex items-center"
            >
              {t('Learn More About Us', 'تعرف علينا أكثر')}
              <Arrow className="ml-2 mr-reverse:rtl h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
