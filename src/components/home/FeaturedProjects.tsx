import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { ArrowRight, ArrowLeft, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from '@/hooks/use-toast';
import useWhatsAppShare from '@/hooks/useWhatsAppShare';
import { useQuery } from '@tanstack/react-query';
import { projectsQueries } from '@/lib/supabase/queries';
import { createProjectSlug } from '@/lib/projectUtils';
import { type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProjectItem {
  id: number;
  title: string;
  category: string;
  description: string;
  technologies: string[];
  image: string;
  featured: boolean;
  cost?: string;
  projectUrl?: string;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(6, { message: "Phone number must be at least 6 characters." }),
  message: z.string().optional(),
});

const ProjectCard = ({ 
  project, 
  index, 
  isMobile, 
  expandedQuote, 
  setExpandedQuote, 
  form, 
  handleQuoteSubmit, 
  t, 
  dir 
}: {
  project: ProjectItem;
  index: number;
  isMobile: boolean;
  expandedQuote: number | null;
  setExpandedQuote: (id: number | null) => void;
  form: any;
  handleQuoteSubmit: (values: any, title: string, cost?: string) => void;
  t: (en: string, ar: string) => string;
  dir: string;
}) => {
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  
  const getCategoryColor = (category: string): string => {
    const hash = category.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 
      'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-orange-500',
      'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500',
    ];
    return colors[hash % colors.length];
  };

  const categoryColor = getCategoryColor(project.category);

  if (isMobile) {
    return (
      <Card className="overflow-hidden border-0 shadow-lg rounded-2xl h-full">
        <CardContent className="p-0 flex flex-col h-full">
          {/* Image */}
          <div className="relative overflow-hidden h-48">
            <img 
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <span className={`absolute bottom-3 ${dir === 'rtl' ? 'right-3' : 'left-3'} px-3 py-1.5 rounded-full text-xs font-semibold text-white ${categoryColor} shadow-md`}>
              {project.category}
            </span>
            {project.cost && (
              <Badge className={`absolute top-3 ${dir === 'rtl' ? 'left-3' : 'right-3'} bg-gradient-to-r from-primary to-accent text-primary-foreground px-3 py-1 text-xs shadow-md`}>
                {project.cost}
              </Badge>
            )}
          </div>
          
          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
              {project.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
              {project.description}
            </p>
            
            {/* Technologies */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.technologies.slice(0, 3).map((tech, idx) => (
                <Badge key={idx} variant="secondary" className="px-2 py-0.5 text-xs">
                  {tech}
                </Badge>
              ))}
              {project.technologies.length > 3 && (
                <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                  +{project.technologies.length - 3}
                </Badge>
              )}
            </div>
            
            {/* Buttons */}
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline" className="flex-1 text-xs border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Link to={`/projects/${createProjectSlug(project.title)}`} className="inline-flex items-center justify-center gap-1.5">
                  {t('Details', 'التفاصيل')}
                  <Arrow className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button
                size="sm"
                onClick={() => setExpandedQuote(expandedQuote === project.id ? null : project.id)}
                className="flex-1 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {t('Quote', 'عرض سعر')}
              </Button>
              {project.projectUrl && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => window.open(project.projectUrl, '_blank')}
                  className="px-3"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Desktop layout (alternating)
  const isEven = index % 2 === 0;
  return (
    <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-500 animate-fade-in border-0 shadow-lg">
      <CardContent className="p-0">
        <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} min-h-[400px]`}>
          {/* Image Section */}
          <div className="lg:w-1/2 relative overflow-hidden">
            <img 
              src={project.image}
              alt={project.title}
              className="w-full h-64 lg:h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <span className={`absolute bottom-4 ${dir === 'rtl' ? 'right-4' : 'left-4'} px-4 py-2 rounded-full text-sm font-semibold text-white ${categoryColor} shadow-lg`}>
              {project.category}
            </span>
            {project.cost && (
              <Badge className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-2 text-sm shadow-lg`}>
                {project.cost}
              </Badge>
            )}
          </div>
          
          {/* Content Section */}
          <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-card">
            <div className="space-y-6">
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                {project.title}
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-3">
                {project.technologies.slice(0, 4).map((tech, idx) => (
                  <Badge key={idx} variant="secondary" className="px-3 py-1 text-sm">
                    {tech}
                  </Badge>
                ))}
                {project.technologies.length > 4 && (
                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                    +{project.technologies.length - 4} more
                  </Badge>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className={`flex flex-wrap gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 py-3">
                  <Link to={`/projects/${createProjectSlug(project.title)}`} className="inline-flex items-center justify-center gap-2">
                    {t('View Details', 'عرض التفاصيل')}
                    <Arrow className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  onClick={() => setExpandedQuote(expandedQuote === project.id ? null : project.id)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 inline-flex items-center justify-center gap-2"
                >
                  {t('Get Quote', 'احصل على عرض أسعار')}
                  {expandedQuote === project.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                {project.projectUrl && (
                  <Button
                    onClick={() => window.open(project.projectUrl, '_blank')}
                    variant="secondary"
                    className="px-6 py-3 inline-flex items-center justify-center gap-2"
                  >
                    {t('Visit Project', 'زيارة المشروع')}
                    <Arrow className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {/* Expandable Quote Form */}
              {expandedQuote === project.id && (
                <QuoteForm form={form} project={project} handleQuoteSubmit={handleQuoteSubmit} setExpandedQuote={setExpandedQuote} t={t} />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const QuoteForm = ({ form, project, handleQuoteSubmit, setExpandedQuote, t }: any) => (
  <div className="mt-4 p-5 bg-muted/50 rounded-lg border border-border animate-fade-in">
    <h4 className="text-lg font-semibold mb-4 text-foreground">
      {t('Request Quote for', 'طلب عرض أسعار لـ')} {project.title}
    </h4>
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values: any) => handleQuoteSubmit(values, project.title, project.cost))} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Name', 'الاسم')}</FormLabel>
              <FormControl><Input placeholder={t('Your name', 'اسمك')} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Phone', 'رقم الهاتف')}</FormLabel>
              <FormControl><Input placeholder={t('+1 234 567 890', '+٩٦٦ ٥٠ ١٢٣ ٤٥٦٧')} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>{t('Email', 'البريد الإلكتروني')}</FormLabel>
            <FormControl><Input type="email" placeholder="your@email.com" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="message" render={({ field }) => (
          <FormItem>
            <FormLabel>{t('Message (Optional)', 'الرسالة (اختياري)')}</FormLabel>
            <FormControl><Textarea placeholder={t('Tell us about your requirements...', 'أخبرنا عن متطلباتك...')} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex gap-3">
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {t('Send via WhatsApp', 'إرسال عبر واتساب')}
          </Button>
          <Button type="button" variant="outline" onClick={() => setExpandedQuote(null)}>
            {t('Cancel', 'إلغاء')}
          </Button>
        </div>
      </form>
    </Form>
  </div>
);

const FeaturedProjects = () => {
  const { t, language, dir } = useLanguage();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const [expandedQuote, setExpandedQuote] = useState<number | null>(null);
  const { shareToWhatsApp } = useWhatsAppShare();
  const isMobile = useIsMobile();
  const autoplayPlugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setActiveSlide(carouselApi.selectedScrollSnap());
    carouselApi.on('select', onSelect);
    onSelect();
    return () => { carouselApi.off('select', onSelect); };
  }, [carouselApi]);

  const { data: rawProjects = [], isLoading: loading } = useQuery({
    queryKey: ['projects', language],
    queryFn: () => projectsQueries.getAll(),
  });

  const projects = useMemo(() => {
    const allProjects = rawProjects.map((p: any, i: number) => ({
      id: i + 1,
      title: language === 'ar' ? p.title_ar : p.title_en,
      category: language === 'ar' ? p.category_ar : p.category_en,
      description: language === 'ar' ? p.description_ar : p.description_en,
      technologies: p.technologies || [],
      image: (p.images && p.images[0]) || '/placeholder.svg',
      featured: p.is_featured,
      cost: p.cost,
      projectUrl: p.project_url,
    }));
    return allProjects.filter((p: any) => p.featured).slice(0, 3);
  }, [rawProjects, language]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  const handleQuoteSubmit = (values: z.infer<typeof formSchema>, projectTitle: string, projectCost?: string) => {
    const message = `
${t('New Quote Request', 'طلب عرض أسعار جديد')}
${t('Project:', 'المشروع:')} ${projectTitle}
${projectCost ? `${t('Estimated Cost:', 'التكلفة المقدرة:')} ${projectCost}` : ''}
${t('Name:', 'الاسم:')} ${values.name}
${t('Email:', 'البريد الإلكتروني:')} ${values.email}
${t('Phone:', 'الهاتف:')} ${values.phone}
${values.message ? `${t('Message:', 'الرسالة:')} ${values.message}` : ''}`;
    
    shareToWhatsApp(message);
    setExpandedQuote(null);
    form.reset();
    toast({
      title: t('Thank you!', 'شكراً لك!'),
      description: t('We received your request and will contact you soon.', 'لقد تلقينا طلبك وسنتصل بك قريبًا.')
    });
  };
  
  if (loading) {
    return (
      <section className={`py-12 md:py-16 ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="section-title">{t('Featured Projects', 'مشاريع مميزة')}</h2>
          </div>
          <div className="flex justify-center items-center h-48">
            <div className="animate-pulse text-lg text-muted-foreground">
              {t('Loading projects...', 'جاري تحميل المشاريع...')}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (projects.length === 0) return null;

  return (
    <section className={`py-12 md:py-20 bg-muted/30 ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 animate-fade-in">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="section-title animate-slide-up">{t('Featured Projects', 'مشاريع مميزة')}</h2>
          <p className="section-subtitle max-w-3xl mx-auto text-sm md:text-base">
            {t(
              'Explore our successful project implementations across various industries.',
              'استكشف تنفيذاتنا الناجحة للمشاريع عبر مختلف الصناعات.'
            )}
          </p>
        </div>

        {/* Mobile: Carousel */}
        {isMobile ? (
          <div className="relative">
            <Carousel
              plugins={[autoplayPlugin.current]}
              setApi={setCarouselApi}
              opts={{
                align: "start",
                loop: true,
                direction: dir === 'rtl' ? 'rtl' : 'ltr',
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-3">
                {projects.map((project, index) => (
                  <CarouselItem key={project.id} className="pl-3 basis-[85%]">
                    <ProjectCard
                      project={project}
                      index={index}
                      isMobile={true}
                      expandedQuote={expandedQuote}
                      setExpandedQuote={setExpandedQuote}
                      form={form}
                      handleQuoteSubmit={handleQuoteSubmit}
                      t={t}
                      dir={dir}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {projects.map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-primary/30" />
              ))}
            </div>
          </div>
        ) : (
          /* Desktop: Stacked cards */
          <div className="space-y-8">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                isMobile={false}
                expandedQuote={expandedQuote}
                setExpandedQuote={setExpandedQuote}
                form={form}
                handleQuoteSubmit={handleQuoteSubmit}
                t={t}
                dir={dir}
              />
            ))}
          </div>
        )}
        
        {/* View All Projects Button */}
        <div className="text-center mt-8 md:mt-12">
          <Link 
            to="/projects"
            className="btn-primary inline-flex items-center gap-2 text-sm md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-lg hover:scale-105 transform transition-all duration-300"
          >
            {t('View All Projects', 'عرض جميع المشاريع')}
            <Arrow className="h-5 w-5 md:h-6 md:w-6" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
