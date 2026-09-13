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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, Check, Search, Sparkles, X, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { PromptItem } from '@/components/admin/PromptFormDialog';

const ITEMS_PER_PAGE = 12;

const Prompts = () => {
  const { t, dir, language } = useLanguage();
  const isAr = language === 'ar';
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    prompts.forEach((p) => {
      const c = isAr ? p.category_ar : p.category_en;
      if (c) counts[c] = (counts[c] || 0) + 1;
    });
    return counts;
  }, [prompts, isAr]);

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => (categoryCounts[b] || 0) - (categoryCounts[a] || 0));
  }, [categories, categoryCounts]);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [query, category]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));

  const paginatedPrompts = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, safeCurrentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

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
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{t('AI Prompts', 'برومبتات الذكاء الاصطناعي')}</h1>
            <p className="text-white/80 max-w-2xl mx-auto">
              {t(
                'A curated library of ready-to-use prompts. Pick one and copy it with a single click.',
                'مكتبة مختارة من البرومبتات الجاهزة. اختر واحدًا وانسخه بنقرة واحدة.'
              )}
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-8">
          {/* Modern Filter Card */}
          <div className="bg-card/90 border border-border/70 rounded-2xl p-4 md:p-5 shadow-sm mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              {/* Search input with icons */}
              <div className="relative flex-1">
                <Search className="absolute top-1/2 -translate-y-1/2 start-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('Search prompts by name, category, or prompt text...', 'ابحث في البرومبتات بالاسم أو التصنيف أو النص...')}
                  className="ps-10 pe-10 h-11 bg-background border-border/70 rounded-xl text-sm"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute top-1/2 -translate-y-1/2 end-3 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={t('Clear search', 'مسح')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Category Select Dropdown */}
              <div className="w-full md:w-72">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-11 bg-background border-border/70 rounded-xl">
                    <div className="flex items-center gap-2 truncate">
                      <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                      <SelectValue placeholder={t('Filter by Category', 'تصفية حسب التصنيف')} />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    <SelectItem value="all">
                      {t('All Categories', 'جميع التصنيفات')} ({prompts.length})
                    </SelectItem>
                    {sortedCategories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c} ({categoryCounts[c] || 0})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quick Chips for Top Categories with smooth horizontal scroll */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar text-xs">
              <span className="text-xs text-muted-foreground font-medium shrink-0 flex items-center gap-1.5 pe-1">
                <Sparkles className="h-3.5 w-3.5 text-odoo-gold" />
                {t('Popular:', 'الشائعة:')}
              </span>
              <Button
                variant={category === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategory('all')}
                className="rounded-full text-xs h-7 px-3 shrink-0"
              >
                {t('All', 'الكل')} ({prompts.length})
              </Button>
              {sortedCategories.slice(0, 8).map((c) => (
                <Button
                  key={c}
                  variant={category === c ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategory(c)}
                  className="rounded-full text-xs h-7 px-3 shrink-0"
                >
                  {c}
                  <span className="ms-1.5 opacity-60 text-[10px]">
                    {categoryCounts[c]}
                  </span>
                </Button>
              ))}
              {category !== 'all' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCategory('all')}
                  className="rounded-full text-xs h-7 px-2.5 text-muted-foreground hover:text-foreground shrink-0"
                >
                  <X className="h-3.5 w-3.5 me-1" />
                  {t('Reset', 'إعادة ضبط')}
                </Button>
              )}
            </div>

            {/* Results count status */}
            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground">
              <span>
                {filtered.length > 0 ? (
                  <>
                    {t('Showing', 'عرض')}{' '}
                    <span className="font-semibold text-foreground">
                      {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}–
                      {Math.min(safeCurrentPage * ITEMS_PER_PAGE, filtered.length)}
                    </span>{' '}
                    {t('of', 'من')}{' '}
                    <span className="font-semibold text-foreground">{filtered.length}</span>{' '}
                    {t('prompts', 'برومبت')}
                  </>
                ) : (
                  t('No matching prompts found', 'لم يتم العثور على برومبتات مطابقة')
                )}
              </span>
              {category !== 'all' && (
                <Badge variant="secondary" className="font-normal text-[11px] gap-1">
                  {category}
                  <button onClick={() => setCategory('all')} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
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
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedPrompts.map((p) => {
                  const name = isAr ? p.name_ar : p.name_en;
                  const cat = isAr ? p.category_ar : p.category_en;
                  const desc = isAr ? p.description_ar : p.description_en;
                  return (
                    <Card key={p.id} className="group flex flex-col hover:shadow-lg hover:border-primary/50 transition-all duration-300 rounded-xl overflow-hidden bg-card">
                      <div className="h-44 w-full overflow-hidden bg-muted relative">
                        <img
                          src={p.image || '/prompt-default.png'}
                          alt={name}
                          loading="lazy"
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/prompt-default.png';
                          }}
                        />
                        {cat && (
                          <div className="absolute top-3 end-3">
                            <Badge variant="secondary" className="backdrop-blur-md bg-background/80 shadow-sm border border-border/40 font-medium">
                              {cat}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
                          {name}
                        </CardTitle>
                        {desc && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {desc}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="flex flex-col flex-1 gap-4 pt-1">
                        <pre className="text-xs whitespace-pre-wrap bg-muted/60 border border-border/40 rounded-lg p-3 max-h-36 overflow-y-auto font-sans text-muted-foreground leading-relaxed">
                          {p.prompt_text}
                        </pre>
                        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5 text-odoo-gold" />
                            {t('Copied', 'نُسخ')} {p.copies_count || 0}×
                          </span>
                          <Button
                            size="sm"
                            variant={copiedId === p.id ? 'default' : 'outline'}
                            onClick={() => handleCopy(p)}
                            className="transition-all"
                          >
                            {copiedId === p.id ? (
                              <Check className="h-4 w-4 me-1.5 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4 me-1.5" />
                            )}
                            {copiedId === p.id ? t('Copied!', 'تم النسخ!') : t('Copy Prompt', 'نسخ البرومبت')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (safeCurrentPage > 1) handlePageChange(safeCurrentPage - 1);
                          }}
                          className={safeCurrentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => page === 1 || page === totalPages || Math.abs(page - safeCurrentPage) <= 1)
                        .reduce<(number | string)[]>((acc, page, idx, arr) => {
                          if (idx > 0 && (page as number) - (arr[idx - 1] as number) > 1) {
                            acc.push(`ellipsis-${page}`);
                          }
                          acc.push(page);
                          return acc;
                        }, [])
                        .map((item) => (
                          <PaginationItem key={item}>
                            {typeof item === 'string' ? (
                              <PaginationEllipsis />
                            ) : (
                              <PaginationLink
                                href="#"
                                isActive={safeCurrentPage === item}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(item);
                                }}
                                className="cursor-pointer"
                              >
                                {item}
                              </PaginationLink>
                            )}
                          </PaginationItem>
                        ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (safeCurrentPage < totalPages) handlePageChange(safeCurrentPage + 1);
                          }}
                          className={safeCurrentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
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
