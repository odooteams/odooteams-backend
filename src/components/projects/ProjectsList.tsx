import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { Project } from '@/hooks/useProjects';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProjectsContactDialog from './ProjectsContactDialog';
import useWhatsAppShare from '@/hooks/useWhatsAppShare';
import { createProjectSlug } from '@/lib/projectUtils';
interface ProjectsListProps {
  projects: Project[];
  isGridView: boolean;
  onContactRequest: () => void;
}
const ProjectsList: React.FC<ProjectsListProps> = ({
  projects,
  isGridView,
  onContactRequest
}) => {
  const {
    t,
    language
  } = useLanguage();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const {
    shareToWhatsApp
  } = useWhatsAppShare();
  const handleContactClick = (project: Project) => {
    setSelectedProject(project);
    setContactDialogOpen(true);
    onContactRequest(); // Call the original onContactRequest function
  };
  const handleSendToWhatsApp = (formData: any) => {
    if (!selectedProject) return;
    const message = `
*${t('Project Inquiry:', 'استفسار عن مشروع:')}* ${selectedProject.title}
*${t('Name:', 'الاسم:')}* ${formData.name}
*${t('Email:', 'البريد الإلكتروني:')}* ${formData.email}
*${t('Phone:', 'رقم الهاتف:')}* ${formData.phone}
${formData.message ? `*${t('Message:', 'الرسالة:')}* ${formData.message}` : ''}
    `.trim();
    shareToWhatsApp(message);
  };
  if (projects.length === 0) {
    return <div className="text-center py-20">
        <h3 className="text-2xl font-bold text-gray-700">
          {t('No projects found', 'لم يتم العثور على مشاريع')}
        </h3>
        <p className="text-gray-500 mt-2">
          {t('Try adjusting your search or filter', 'حاول تعديل البحث أو الفلتر')}
        </p>
      </div>;
  }

  // Get a color for the category badge based on the category name
  const getCategoryColor = (category: string): string => {
    // Create a simple hash of the category name
    const hash = category.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);

    // List of background colors for category badges
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-orange-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-rose-500'];

    // Use the hash to select a color from the list
    return colors[hash % colors.length];
  };
  return <>
      <div className={isGridView ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"}>
        {projects.map(project => {
        const mainImage = project.images && project.images.length > 0 ? project.images[0] : '/placeholder.svg';
        const categoryColor = getCategoryColor(project.category);
        return <Card key={project.id} className={`overflow-hidden ${isGridView ? 'flex flex-col' : 'flex flex-col md:flex-row'} hover:shadow-lg transition-shadow h-full`}>
              <div className={`${isGridView ? 'w-full relative' : 'md:w-1/3 relative'}`}>
                <img src={mainImage} alt={project.title} className="h-48 md:h-full w-full object-cover" />
                {/* Category label on bottom left of image */}
                <span className={`absolute left-2 bottom-2 px-3 py-1 rounded-md text-xs font-semibold text-white ${categoryColor}`} style={{
              direction: 'ltr'
            }}>
                  {project.category}
                </span>
                
                {/* Cost label on right bottom of image if cost exists */}
                {project.cost && <span className="absolute right-2 bottom-2 px-4 py-1 rounded-full font-bold text-sm bg-gradient-to-r from-odoo-purple via-orange-400 to-odoo-magenta text-white shadow" style={{
              minWidth: '90px',
              textAlign: 'center',
              direction: 'ltr'
            }}>
                    {project.cost}
                  </span>}
              </div>
              <div className={`${isGridView ? 'w-full' : 'md:w-2/3'} flex flex-col h-full`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      {project.clientName && <CardDescription>{project.clientName}</CardDescription>}
                    </div>
                    {project.featured && <Badge className="bg-odoo-gold text-black">
                        {t('Featured', 'مميز')}
                      </Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 line-clamp-3">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {project.technologies && project.technologies.map((tech, index) => <Badge key={index} variant="secondary" className="text-xs" style={{
                  direction: language === 'ar' ? 'rtl' : 'ltr'
                }}>
                        {tech}
                      </Badge>)}
                  </div>
                </CardContent>
                <CardFooter className="flex-row gap-2 justify-center mt-auto border-t pt-3 sticky bottom-0 bg-white">
                  <Button variant="outline" asChild>
                    <Link to={`/projects/${createProjectSlug(project.title)}`}>
                      {t('View Details', 'عرض التفاصيل')}
                    </Link>
                  </Button>
                  <Button onClick={() => handleContactClick(project)} className="bg-odoo-gold hover:bg-yellow-500 text-odoo-purple">
                    {t('Contact Us', 'اتصل بنا')}
                  </Button>
                </CardFooter>
              </div>
            </Card>;
      })}
      </div>
      
      <ProjectsContactDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} projectTitle={selectedProject?.title} projectCost={selectedProject?.cost} onSendToWhatsApp={handleSendToWhatsApp} />
    </>;
};
export default ProjectsList;