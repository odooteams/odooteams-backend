import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Eye, Monitor, Smartphone } from 'lucide-react';
import { SERP_LIMITS, lengthStatus } from '@/lib/seo/schemaTemplates';

interface SerpData {
  title_en?: string | null;
  title_ar?: string | null;
  description_en?: string | null;
  description_ar?: string | null;
  page_path?: string | null;
  canonical_url?: string | null;
}

interface Props {
  data: SerpData;
  trigger?: React.ReactNode;
}

const BASE = 'https://odooteams.com';

function truncateForLocale(s: string, locale: 'en' | 'ar', kind: 'title' | 'desc') {
  const l = SERP_LIMITS[locale];
  const max = kind === 'title' ? l.titleMax : l.descMax;
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

function StatusBadge({ value, locale, kind }: { value: string; locale: 'en' | 'ar'; kind: 'title' | 'desc' }) {
  const status = lengthStatus(value, locale, kind);
  const l = SERP_LIMITS[locale];
  const min = kind === 'title' ? l.titleMin : l.descMin;
  const max = kind === 'title' ? l.titleMax : l.descMax;
  const len = (value || '').length;

  if (status === 'ok') {
    return <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" />{len}/{max}</Badge>;
  }
  if (status === 'empty') {
    return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Missing</Badge>;
  }
  if (status === 'long') {
    return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />{len}/{max} — will truncate</Badge>;
  }
  return <Badge variant="secondary" className="gap-1"><AlertTriangle className="h-3 w-3" />{len}/{max} — below {min}</Badge>;
}

function DesktopCard({ title, description, url, dir, locale }: { title: string; description: string; url: string; dir: 'ltr' | 'rtl'; locale: 'en' | 'ar' }) {
  return (
    <div className="bg-white rounded-lg p-6 border shadow-sm font-sans" dir={dir}>
      <div className="flex items-center gap-2 mb-1">
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-xs font-bold">O</div>
        <div className="leading-tight">
          <div className="text-sm text-gray-800">OdooTeams</div>
          <div className="text-xs text-gray-600">{url}</div>
        </div>
      </div>
      <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer leading-tight mt-1">
        {truncateForLocale(title || (locale === 'ar' ? 'عنوان الصفحة' : 'Page title'), locale, 'title')}
      </h3>
      <p className="text-sm text-gray-700 mt-1 leading-snug">
        {truncateForLocale(description || (locale === 'ar' ? 'وصف الصفحة الظاهر في نتائج البحث.' : 'Page description preview shown by Google in search results.'), locale, 'desc')}
      </p>
    </div>
  );
}

function MobileCard({ title, description, url, dir, locale }: { title: string; description: string; url: string; dir: 'ltr' | 'rtl'; locale: 'en' | 'ar' }) {
  return (
    <div className="mx-auto bg-white rounded-3xl border-8 border-gray-800 shadow-xl" style={{ width: 360 }}>
      <div className="bg-gray-100 rounded-t-2xl px-3 py-2 text-xs text-gray-500 text-center">google.com</div>
      <div className="p-4 font-sans" dir={dir}>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-[10px] font-bold">O</div>
          <div className="leading-tight">
            <div className="text-xs text-gray-800">OdooTeams</div>
            <div className="text-[11px] text-gray-600 truncate max-w-[240px]">{url}</div>
          </div>
        </div>
        <h3 className="text-base text-[#1a0dab] leading-tight mt-1">
          {truncateForLocale(title || (locale === 'ar' ? 'عنوان الصفحة' : 'Page title'), locale, 'title')}
        </h3>
        <p className="text-xs text-gray-700 mt-1 leading-snug">
          {truncateForLocale(description || (locale === 'ar' ? 'وصف الصفحة.' : 'Page description preview.'), locale, 'desc')}
        </p>
      </div>
    </div>
  );
}

function LocalePane({ locale, title, description, url, dir }: { locale: 'en' | 'ar'; title: string; description: string; url: string; dir: 'ltr' | 'rtl' }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="text-muted-foreground">Title:</span>
        <StatusBadge value={title} locale={locale} kind="title" />
        <span className="text-muted-foreground ml-2">Description:</span>
        <StatusBadge value={description} locale={locale} kind="desc" />
      </div>
      <DesktopCard title={title} description={description} url={url} dir={dir} locale={locale} />
      <p className="text-[11px] text-muted-foreground">
        Best-practice range for {locale.toUpperCase()}: title {SERP_LIMITS[locale].titleMin}–{SERP_LIMITS[locale].titleMax} chars, description {SERP_LIMITS[locale].descMin}–{SERP_LIMITS[locale].descMax} chars.
      </p>
    </div>
  );
}

export default function SerpPreview({ data, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const url = data.canonical_url || `${BASE}${data.page_path || '/'}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button type="button" variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" /> SERP Preview
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Google Search Preview — with locale-aware limits</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="desktop">
          <TabsList>
            <TabsTrigger value="desktop"><Monitor className="h-4 w-4 mr-2" />Desktop</TabsTrigger>
            <TabsTrigger value="mobile"><Smartphone className="h-4 w-4 mr-2" />Mobile</TabsTrigger>
          </TabsList>

          <TabsContent value="desktop" className="mt-4">
            <Tabs defaultValue="en">
              <TabsList>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="ar">العربية</TabsTrigger>
              </TabsList>
              <TabsContent value="en" className="mt-4 bg-muted/40 p-6 rounded-lg">
                <LocalePane locale="en" title={data.title_en || ''} description={data.description_en || ''} url={`${url}?lang=en`} dir="ltr" />
              </TabsContent>
              <TabsContent value="ar" className="mt-4 bg-muted/40 p-6 rounded-lg">
                <LocalePane locale="ar" title={data.title_ar || ''} description={data.description_ar || ''} url={`${url}?lang=ar`} dir="rtl" />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="mobile" className="mt-4">
            <Tabs defaultValue="en">
              <TabsList>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="ar">العربية</TabsTrigger>
              </TabsList>
              <TabsContent value="en" className="mt-4 bg-muted/40 p-6 rounded-lg">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 text-xs justify-center">
                    <StatusBadge value={data.title_en || ''} locale="en" kind="title" />
                    <StatusBadge value={data.description_en || ''} locale="en" kind="desc" />
                  </div>
                  <MobileCard title={data.title_en || ''} description={data.description_en || ''} url={`${url}?lang=en`} dir="ltr" locale="en" />
                </div>
              </TabsContent>
              <TabsContent value="ar" className="mt-4 bg-muted/40 p-6 rounded-lg">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 text-xs justify-center">
                    <StatusBadge value={data.title_ar || ''} locale="ar" kind="title" />
                    <StatusBadge value={data.description_ar || ''} locale="ar" kind="desc" />
                  </div>
                  <MobileCard title={data.title_ar || ''} description={data.description_ar || ''} url={`${url}?lang=ar`} dir="rtl" locale="ar" />
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
