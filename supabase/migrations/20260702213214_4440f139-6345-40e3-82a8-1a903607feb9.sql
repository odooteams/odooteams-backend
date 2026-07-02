
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS og_image TEXT,
  ADD COLUMN IF NOT EXISTS canonical_url TEXT,
  ADD COLUMN IF NOT EXISTS robots TEXT DEFAULT 'index, follow',
  ADD COLUMN IF NOT EXISTS focus_keyword_en TEXT,
  ADD COLUMN IF NOT EXISTS focus_keyword_ar TEXT,
  ADD COLUMN IF NOT EXISTS structured_data JSONB;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS og_image TEXT,
  ADD COLUMN IF NOT EXISTS canonical_url TEXT,
  ADD COLUMN IF NOT EXISTS robots TEXT DEFAULT 'index, follow',
  ADD COLUMN IF NOT EXISTS focus_keyword_en TEXT,
  ADD COLUMN IF NOT EXISTS focus_keyword_ar TEXT,
  ADD COLUMN IF NOT EXISTS structured_data JSONB;

ALTER TABLE public.blogs
  ADD COLUMN IF NOT EXISTS og_image TEXT,
  ADD COLUMN IF NOT EXISTS canonical_url TEXT,
  ADD COLUMN IF NOT EXISTS robots TEXT DEFAULT 'index, follow',
  ADD COLUMN IF NOT EXISTS focus_keyword_en TEXT,
  ADD COLUMN IF NOT EXISTS focus_keyword_ar TEXT,
  ADD COLUMN IF NOT EXISTS structured_data JSONB;

ALTER TABLE public.learn_resources
  ADD COLUMN IF NOT EXISTS og_image TEXT,
  ADD COLUMN IF NOT EXISTS canonical_url TEXT,
  ADD COLUMN IF NOT EXISTS robots TEXT DEFAULT 'index, follow',
  ADD COLUMN IF NOT EXISTS focus_keyword_en TEXT,
  ADD COLUMN IF NOT EXISTS focus_keyword_ar TEXT,
  ADD COLUMN IF NOT EXISTS structured_data JSONB;
