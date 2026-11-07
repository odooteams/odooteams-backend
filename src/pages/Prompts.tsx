import React, { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import TopHeader from '@/components/layout/TopHeader';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BottomNavigation from '@/components/layout/BottomNavigation';
import StickyContact from '@/components/common/StickyContact';
import SEOHead from '@/components/seo/SEOHead';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, Search, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { PromptItem } from '@/components/admin/PromptFormDialog';

const Prompts = () => {
  const { t, dir, language } = useLanguage();
  const isAr = language === 'ar';
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('prompts')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });
        if (error) throw error;
        setPrompts((data || []) as PromptItem[]);
      } catch (err) {
        console.error('Error loading prompts:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    prompts.forEach((p) => {
      const c = isAr ? p.category_ar : p.category_en;
      if (c) set.add(c);
    });
    return Array.from(set);
  }, [prompts, isAr]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return prompts.filter((p) => {
      const cat = isAr ? p.category_ar : p.category_en;
      if (category !== 'all' && cat !== category) return false;
      if (!q) return true;
      return [p.name_en, p.name_ar, p.category_en, p.category_ar, p.prompt_text]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [prompts, query, category, isAr]);

  const handleCopy = async (prompt: PromptItem) => {
    try {
      await navigator.clipboard.writeText(prompt.prompt_text);
      setCopiedId(prompt.id);
      toast.success(t('Copied', 'تم النسخ'));
      setTimeout(() => setCopiedId((id) => (id === prompt.id ? null : id)), 2000);
      setPrompts((prev) =>
        prev.map((p) => (p.id === prompt.id ? { ...p, copies_count: (p.copies_count || 0) + 1 } : p))
      );
      const { data: newCount, error: rpcError } = await (supabase as any).rpc('increment_prompt_copies', {
        _prompt_id: prompt.id,
      });
      if (rpcError) {
        console.error('Copy count failed:', rpcError);
      } else if (typeof newCount === 'number') {
        setPrompts((prev) => prev.map((p) => (p.id === prompt.id ? { ...p, copies_count: newCount } : p)));
      }
    } catch (err) {
      console.error('Copy failed:', err);
      toast.error(t('Could not copy', 'تعذر النسخ'));
    }
  };

  return (
    <div className={dir === 'rtl' ? 'rtl' : 'ltr'} dir={dir}>
      <SEOHead
        title={t('AI Prompts Library | OdooTeams', 'مكتبة برومبتات الذكاء الاصطناعي | OdooTeams')}
        description={t(
          'Browse and copy ready-made AI prompts for Odoo, business and marketing tasks.',
          'تصفح وانسخ برومبتات جاهزة للذكاء الاصطناعي لأودو والأعمال والتسويق.'
        )}
        canonicalUrl="https://odooteams.com/prompts"
      />
      <TopHeader />
      <Navbar />

      <main className="min-h-screen bg-background">
        <section className="bg-gradient-hero text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <Sparkles className="h-10 w-10 mx-auto mb-4 text-odoo-gold" />
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{t('Al Prompts', 'آل برومبتس')}</h1>
            <p className="text-white/80 max-w-2xl mx-auto">
              {t(
                'A curated library of ready-to-use prompts. Pick one and copy it with a single click.',
                'مكتبة مختارة من البرومبتات الجاهزة. اختر واحدًا وانسخه بنقرة واحدة.'
              )}
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row gap-4 md:items-center mb-8">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('Search prompts...', 'ابحث في البرومبتات...')}
                className="ps-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={category === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategory('all')}
              >
                {t('All', 'الكل')}
              </Button>
              {categories.map((c) => (
                <Button
                  key={c}
                  variant={category === c ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategory(c)}
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              {t('No prompts available yet.', 'لا توجد برومبتات متاحة بعد.')}
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => {
                const name = isAr ? p.name_ar : p.name_en;
                const cat = isAr ? p.category_ar : p.category_en;
                const desc = isAr ? p.description_ar : p.description_en;
                return (
                  <Card key={p.id} className="flex flex-col hover:border-primary/50 transition-colors">
                    {p.image && (
                      <img
                        src={p.image}
                        alt={name}
                        loading="lazy"
                        className="h-40 w-full object-cover rounded-t-lg"
                      />
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg">{name}</CardTitle>
                        {cat && <Badge variant="secondary">{cat}</Badge>}
                      </div>
                      {desc && <p className="text-sm text-muted-foreground mt-1">{desc}</p>}
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1 gap-4">
                      <pre className="text-sm whitespace-pre-wrap bg-muted rounded-md p-3 max-h-40 overflow-y-auto font-sans text-muted-foreground">
                        {p.prompt_text}
                      </pre>
                      <div className="mt-auto flex items-center justify-between gap-3">
                        <span className="text-xs text-muted-foreground">
                          {t('Copied', 'نُسخ')} {p.copies_count || 0}×
                        </span>
                        <Button size="sm" onClick={() => handleCopy(p)}>
                          {copiedId === p.id ? (
                            <Check className="h-4 w-4 me-2" />
                          ) : (
                            <Copy className="h-4 w-4 me-2" />
                          )}
                          {copiedId === p.id ? t('Copied', 'تم النسخ') : t('Copy prompt', 'نسخ البرومبت')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
      <BottomNavigation />
      <StickyContact />
    </div>
  );
};

export default Prompts;
