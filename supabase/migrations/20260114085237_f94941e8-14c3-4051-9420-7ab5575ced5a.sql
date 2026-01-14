-- Drop and recreate the overly permissive INSERT policies with better validation

-- 1. Contact submissions: Add validation that required fields are provided
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact form with valid data" 
ON public.contact_submissions 
FOR INSERT 
TO public
WITH CHECK (
  full_name IS NOT NULL AND 
  full_name <> '' AND 
  email IS NOT NULL AND 
  email <> '' AND 
  message IS NOT NULL AND 
  message <> ''
);

-- 2. Page views: Add validation that page_path is provided
DROP POLICY IF EXISTS "Users can insert page views" ON public.page_views;
CREATE POLICY "Anyone can insert valid page views" 
ON public.page_views 
FOR INSERT 
TO public
WITH CHECK (
  page_path IS NOT NULL AND 
  page_path <> ''
);