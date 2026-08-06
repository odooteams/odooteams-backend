import React, { useState } from 'react';
import RichText from '@/components/common/RichText';
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
  return <>
    {/* Full-width Image Carousel */}
    <section className="w-full">
      <Carousel className="w-full">
        <CarouselContent>
          {project.images.map((image, index) => <CarouselItem key={index}>
              <div className="h-[250px] md:h-[450px] w-full">
                <img src={image} alt={`${project.title} - ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            </CarouselItem>)}
        </CarouselContent>
        <CarouselPrevious className="left-4 bg-white/80 hover:bg-white h-10 w-10" />
        <CarouselNext className="right-4 bg-white/80 hover:bg-white h-10 w-10" />
      </Carousel>
    </section>

    {/* Project Info */}
    <section className="py-6 md:py-12 bg-white">
      <div className="container mx-auto px-4">
        <Badge className="mb-3">{project.category}</Badge>
        <h1 className="text-2xl md:text-4xl font-bold mb-4">{project.title}</h1>
        <RichText className="text-muted-foreground text-base md:text-lg mb-6" html={project.description} />
        
        <div className="flex flex-wrap gap-2 mb-6">
          {project.technologies.map((tech, index) => <Badge key={index} variant="outline" className="text-sm">
              {tech}
            </Badge>)}
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleContactClick} className="bg-odoo-magenta hover:bg-odoo-purple">
            {t('Contact Us', 'اتصل بنا')}
          </Button>
          <Button variant="outline" asChild>
            <Link to="/projects">
              {t('View All Projects', 'عرض جميع المشاريع')}
            </Link>
          </Button>
          {project.projectUrl && <Button onClick={onVisitProject} variant="default" className="bg-odoo-gold hover:bg-yellow-500 text-odoo-purple inline-flex items-center gap-2">
              {t('Visit Project', 'زيارة المشروع')} 
              <ExternalLink className="w-4 h-4" />
            </Button>}
        </div>
      </div>
      
      <ProjectContactDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} projectTitle={project.title} projectCost={project.cost} onSendToWhatsApp={handleSendToWhatsApp} />
    </section>
  </>;
};
export default ProjectHero;