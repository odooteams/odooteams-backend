import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/seo/SEOHead';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function Policy() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPolicy();
  }, [slug]);

  const loadPolicy = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setPolicy(data);
    } catch (error) {
      console.error('Error loading policy:', error);
      toast.error('Policy not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <SEOHead title="Loading..." description="Loading policy" />
        <div className="min-h-screen py-20">
          <div className="container max-w-4xl mx-auto px-4">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </>
    );
  }

  if (!policy) {
    return null;
  }

  const title = language === 'ar' ? policy.title_ar : policy.title_en;
  const content = language === 'ar' ? policy.content_ar : policy.content_en;

  return (
    <>
      <SEOHead
        title={title}
        description={`${title} - Read our ${policy.policy_type} policy`}
      />
      <div className="min-h-screen py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container max-w-4xl mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'رجوع' : 'Back'}
          </Button>

          <div className="bg-card rounded-lg shadow-lg p-8 md:p-12">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm capitalize">{policy.policy_type.replace('_', ' ')}</span>
            </div>

            <h1 className="text-4xl font-bold mb-4">{title}</h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b">
              {policy.version && (
                <span>
                  {language === 'ar' ? 'الإصدار' : 'Version'}: {policy.version}
                </span>
              )}
              {policy.effective_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {language === 'ar' ? 'تاريخ السريان' : 'Effective Date'}:{' '}
                    {new Date(policy.effective_date).toLocaleDateString(
                      language === 'ar' ? 'ar-SA' : 'en-US'
                    )}
                  </span>
                </div>
              )}
            </div>

            <div
              className="prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}
            />

            <div className="mt-12 pt-8 border-t">
              <p className="text-sm text-muted-foreground">
                {language === 'ar'
                  ? 'آخر تحديث'
                  : 'Last updated'}:{' '}
                {new Date(policy.updated_at).toLocaleDateString(
                  language === 'ar' ? 'ar-SA' : 'en-US'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
