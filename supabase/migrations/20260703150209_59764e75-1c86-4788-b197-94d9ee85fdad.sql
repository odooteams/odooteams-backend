
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS schema_type TEXT DEFAULT 'Service';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS schema_type TEXT DEFAULT 'CreativeWork';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS schema_type TEXT DEFAULT 'Article';
ALTER TABLE public.learn_resources ADD COLUMN IF NOT EXISTS schema_type TEXT DEFAULT 'Article';
