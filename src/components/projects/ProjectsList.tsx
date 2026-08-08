import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { Project } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, ArrowRight } from 'lucide-react';
import ProjectsContactDialog from './ProjectsContactDialog';
import ProjectCardSkeleton from './ProjectCardSkeleton';
import useWhatsAppShare from '@/hooks/useWhatsAppShare';
import { createProjectSlug } from '@/lib/projectUtils';

interface ProjectsListProps {
  projects: Project[];
  isGridView: boolean;
  onContactRequest: () => void;
  loading?: boolean;
}

const ProjectsList: React.FC<ProjectsListProps> = ({
  projects,
  isGridView,
  onContactRequest,
  loading = false
}) => {
  const { t, language } = useLanguage();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { shareToWhatsApp } = useWhatsAppShare();

  const handleContactClick = (project: Project) => {
    setSelectedProject(project);
    setContactDialogOpen(true);
    onContactRequest();
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

  // Show skeleton loading state
  if (loading) {
    return (
      <>
        <ProjectCardSkeleton isFeatured />
        <div>
          <div className="h-7 w-40 bg-muted rounded mb-6 animate-pulse" />
          <div className={isGridView ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-8"}>
            {[...Array(4)].map((_, index) => (
              <ProjectCardSkeleton key={index} isGridView={isGridView} />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="15" y1="9" y2="15"/><line x1="15" x2="9" y1="9" y2="15"/></svg>
        </div>
        <h3 className="text-2xl font-bold mb-2">
          {t('No projects found', 'لم يتم العثور على مشاريع')}
        </h3>
        <p className="text-muted-foreground">
          {t('Try adjusting your search or filter', 'حاول تعديل البحث أو الفلتر')}
        </p>
      </div>
    );
  }

  const [featuredProject, ...otherProjects] = projects;
  const featuredImage = featuredProject.images && featuredProject.images.length > 0 ? featuredProject.images[0] : '/placeholder.svg';

  return (
    <>
      {/* Featured Large Card */}
      <article className="group relative overflow-hidden rounded-3xl bg-card border transition-all duration-500 hover:shadow-2xl mb-16 animate-fade-in">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <Link 
            to={`/projects/${createProjectSlug(featuredProject.title)}`}
            className="relative overflow-hidden aspect-[4/3] md:aspect-auto md:min-h-[600px]"
          >
            <img 
              src={featuredImage} 
              alt={featuredProject.title} 
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute bottom-8 left-8 right-8">
                <div className="flex items-center gap-3 text-white">
                  <span className="text-lg font-medium">{t('View Project', 'عرض المشروع')}</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-6 left-6">
              <Badge className="bg-primary/90 backdrop-blur-sm text-lg px-4 py-2">
                {featuredProject.category}
              </Badge>
            </div>

            {featuredProject.cost && (
              <div className="absolute top-6 right-6">
                <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground backdrop-blur-sm text-lg px-4 py-2">
                  {featuredProject.cost}
                </Badge>
              </div>
            )}

            {featuredProject.featured && (
              <div className="absolute bottom-6 right-6">
                <Badge variant="secondary" className="backdrop-blur-sm text-base px-4 py-2">
                  ⭐ {t('Featured', 'مميز')}
                </Badge>
              </div>
            )}
          </Link>

          {/* Content Section */}
          <div className="flex flex-col p-8 md:p-12">
            <div className="flex-1 space-y-6">
              {featuredProject.clientName && (
                <p className="text-base text-muted-foreground font-medium">
                  {featuredProject.clientName}
                </p>
              )}

              <Link to={`/projects/${createProjectSlug(featuredProject.title)}`}>
                <h2 className="text-4xl md:text-5xl font-bold leading-tight group-hover:text-primary transition-colors">
                  {featuredProject.title}
                </h2>
              </Link>

              <div 
                className="text-lg text-muted-foreground leading-relaxed [&>p]:mb-0"
                dangerouslySetInnerHTML={{ __html: featuredProject.description }}
              />

              {featuredProject.technologies && featuredProject.technologies.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {featuredProject.technologies.map((tech, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className="text-sm px-3 py-1"
                      style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-8 mt-auto">
              <Button 
                variant="default" 
                size="lg"
                className="flex-1"
                asChild
              >
                <Link to={`/projects/${createProjectSlug(featuredProject.title)}`}>
                  {t('View Details', 'عرض التفاصيل')}
                </Link>
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => handleContactClick(featuredProject)}
              >
                <ExternalLink className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </article>

      {/* Other Projects Grid - 4 Cards Per Row */}
      {otherProjects.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-6">
            {t('More Projects', 'المزيد من المشاريع')}
          </h3>
          <div className={isGridView ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-8"}>
          {otherProjects.map((project, index) => {
            const mainImage = project.images && project.images.length > 0 ? project.images[0] : '/placeholder.svg';
            
            return (
              <article 
                key={project.id} 
                className={`group relative overflow-hidden rounded-2xl bg-card border transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 animate-fade-in ${isGridView ? 'flex flex-col' : 'flex flex-col md:flex-row'}`}
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
              >
                {/* Image Container */}
                <Link 
                  to={`/projects/${createProjectSlug(project.title)}`}
                  className={`relative overflow-hidden ${isGridView ? 'aspect-[4/3]' : 'md:w-2/5 aspect-square md:aspect-auto'}`}
                >
                  <img 
                    src={mainImage} 
                    alt={project.title} 
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 text-white">
                        <span className="text-sm font-medium">{t('View Project', 'عرض المشروع')}</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-primary/90 backdrop-blur-sm">
                      {project.category}
                    </Badge>
                  </div>

                  {/* Cost Badge */}
                  {project.cost && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground backdrop-blur-sm">
                        {project.cost}
                      </Badge>
                    </div>
                  )}

                  {/* Featured Badge */}
                  {project.featured && (
                    <div className="absolute bottom-4 right-4">
                      <Badge variant="secondary" className="backdrop-blur-sm">
                        ⭐ {t('Featured', 'مميز')}
                      </Badge>
                    </div>
                  )}
                </Link>

                {/* Content */}
                <div className={`flex flex-col p-6 ${isGridView ? '' : 'md:w-3/5'}`}>
                  <div className="flex-1 space-y-4">
                    {/* Client Name */}
                    {project.clientName && (
                      <p className="text-sm text-muted-foreground font-medium">
                        {project.clientName}
                      </p>
                    )}

                    {/* Title */}
                    <Link to={`/projects/${createProjectSlug(project.title)}`}>
                      <h3 className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {project.title}
                      </h3>
                    </Link>

                    {/* Description */}
                    <div 
                      className="text-muted-foreground line-clamp-3 [&>p]:mb-0"
                      dangerouslySetInnerHTML={{ __html: project.description }}
                    />

                    {/* Technologies */}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.slice(0, 4).map((tech, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className="text-xs"
                            style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
                          >
                            {tech}
                          </Badge>
                        ))}
                        {project.technologies.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.technologies.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-6 mt-auto border-t">
                    <Button 
                      variant="default" 
                      className="flex-1"
                      asChild
                    >
                      <Link to={`/projects/${createProjectSlug(project.title)}`}>
                        {t('View Details', 'عرض التفاصيل')}
                      </Link>
                    </Button>
                    <Button 
                      variant="outline"
                      size="icon"
                      onClick={() => handleContactClick(project)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
          </div>
        </div>
      )}
      
      <ProjectsContactDialog 
        open={contactDialogOpen} 
        onOpenChange={setContactDialogOpen} 
        projectTitle={selectedProject?.title} 
        projectCost={selectedProject?.cost} 
        onSendToWhatsApp={handleSendToWhatsApp} 
      />
    </>
  );
};

export default ProjectsList;
