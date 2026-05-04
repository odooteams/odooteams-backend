import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Eye, Monitor, Smartphone } from 'lucide-react';

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

const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

function DesktopCard({ title, description, url, dir }: { title: string; description: string; url: string; dir: 'ltr' | 'rtl' }) {
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
        {truncate(title || 'Page title', 60)}
      </h3>
      <p className="text-sm text-gray-700 mt-1 leading-snug">
        {truncate(description || 'Page description preview shown by Google in search results.', 160)}
      </p>
    </div>
  );
}

function MobileCard({ title, description, url, dir }: { title: string; description: string; url: string; dir: 'ltr' | 'rtl' }) {
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
          {truncate(title || 'Page title', 55)}
        </h3>
        <p className="text-xs text-gray-700 mt-1 leading-snug">
          {truncate(description || 'Page description preview.', 130)}
        </p>
      </div>
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
          <DialogTitle>Google Search Preview</DialogTitle>
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
                <DesktopCard title={data.title_en || ''} description={data.description_en || ''} url={url} dir="ltr" />
              </TabsContent>
              <TabsContent value="ar" className="mt-4 bg-muted/40 p-6 rounded-lg">
                <DesktopCard title={data.title_ar || ''} description={data.description_ar || ''} url={url} dir="rtl" />
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
                <MobileCard title={data.title_en || ''} description={data.description_en || ''} url={url} dir="ltr" />
              </TabsContent>
              <TabsContent value="ar" className="mt-4 bg-muted/40 p-6 rounded-lg">
                <MobileCard title={data.title_ar || ''} description={data.description_ar || ''} url={url} dir="rtl" />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
