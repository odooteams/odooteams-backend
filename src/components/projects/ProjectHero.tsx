import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import ProjectContactDialog from './ProjectContactDialog';
import useWhatsAppShare from '@/hooks/useWhatsAppShare';
interface ProjectHeroProps {
  project: {
    id: string;
    title: string;
    category: string;
    description: string;
    technologies: string[];
    images: string[];
    projectUrl?: string;
    cost?: string;
  };
  onContactRequest: () => void;
  onVisitProject: () => void;
}
const ProjectHero: React.FC<ProjectHeroProps> = ({
  project,
  onContactRequest,
  onVisitProject
}) => {
  const {
    t,
    dir
  } = useLanguage();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const {
    shareToWhatsApp
  } = useWhatsAppShare();
  const handleContactClick = () => {
    setContactDialogOpen(true);
  };
  const handleSendToWhatsApp = (formData: any) => {
    const message = `
*${t('Project Inquiry:', 'استفسار عن مشروع:')}* ${project.title}
*${t('Name:', 'الاسم:')}* ${formData.name}
*${t('Email:', 'البريد الإلكتروني:')}* ${formData.email}
*${t('Phone:', 'رقم الهاتف:')}* ${formData.phone}
${formData.message ? `*${t('Message:', 'الرسالة:')}* ${formData.message}` : ''}
    `.trim();
    shareToWhatsApp(message);
  };
  return <section className="py-6 md:py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-6 md:gap-8">
          {/* Mobile-first layout */}
          <div className="md:hidden">
            <Badge className="mb-2">{project.category}</Badge>
            <h1 className="text-2xl font-bold mb-3">{project.title}</h1>
            
            {/* Mobile Image Carousel */}
            <div className="mb-4">
              <Carousel className="w-full">
                <CarouselContent>
                  {project.images.map((image, index) => <CarouselItem key={index}>
                      <div className="h-[200px] w-full p-1">
                        <img src={image} alt={`${project.title} - ${index + 1}`} className="w-full h-full object-cover rounded-lg shadow-lg" />
                      </div>
                    </CarouselItem>)}
                </CarouselContent>
                <CarouselPrevious className={`${dir === 'rtl' ? '-right-8 left-auto' : ''} bg-white/80 hover:bg-white h-8 w-8`} />
                <CarouselNext className="mx-[32px]" />
              </Carousel>
            </div>
            
            <p className="text-gray-600 mb-4 text-sm">{project.description}</p>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {project.technologies.slice(0, 3).map((tech, index) => <Badge key={index} variant="outline" className="text-xs">
                  {tech}
                </Badge>)}
              {project.technologies.length > 3 && <Badge variant="outline" className="text-xs">
                  +{project.technologies.length - 3}
                </Badge>}
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleContactClick} className="bg-odoo-magenta hover:bg-odoo-purple flex-1 text-sm" size="sm">
                {t('Contact Us', 'اتصل بنا')}
              </Button>
              {project.projectUrl && <Button onClick={onVisitProject} variant="outline" size="sm" className="flex-1 text-sm">
                  {t('Visit', 'زيارة')} 
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>}
            </div>
          </div>

          {/* Desktop layout */}
          <div className="hidden md:flex md:flex-row gap-8">
            <div className="md:w-1/2">
              <Badge className="mb-2">{project.category}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{project.title}</h1>
              <p className="text-lg text-gray-600 mb-6">{project.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {project.technologies.map((tech, index) => <Badge key={index} variant="outline" className="text-sm">
                    {tech}
                  </Badge>)}
              </div>
              
              <div className="flex gap-3">
                <Button onClick={handleContactClick} className="bg-odoo-magenta hover:bg-odoo-purple">
                  {t('Contact Us', 'اتصل بنا')}
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/projects">
                    {t('View All Projects', 'عرض جميع المشاريع')}
                  </Link>
                </Button>
                {project.projectUrl && <Button onClick={onVisitProject} variant="default" className="bg-odoo-gold hover:bg-yellow-500 text-odoo-purple">
                    {t('Visit Project', 'زيارة المشروع')} 
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </Button>}
              </div>
            </div>
            
            <div className="md:w-1/2">
              <Carousel className="w-full">
                <CarouselContent>
                  {project.images.map((image, index) => <CarouselItem key={index}>
                      <div className="h-[300px] md:h-[350px] w-full p-1">
                        <img src={image} alt={`${project.title} - ${index + 1}`} className="w-full h-full object-cover rounded-lg shadow-lg" />
                      </div>
                    </CarouselItem>)}
                </CarouselContent>
                <CarouselPrevious className={`${dir === 'rtl' ? '-right-12 left-auto' : ''} bg-white/80 hover:bg-white`} />
                <CarouselNext className={`${dir === 'rtl' ? '-left-12 right-auto' : ''} bg-white/80 hover:bg-white`} />
              </Carousel>
            </div>
          </div>
        </div>
        
        <ProjectContactDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} projectTitle={project.title} projectCost={project.cost} onSendToWhatsApp={handleSendToWhatsApp} />
      </div>
    </section>;
};
export default ProjectHero;