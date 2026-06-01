-- Restrict team_members.email column from anonymous visitors
REVOKE SELECT ON public.team_members FROM anon;
GRANT SELECT (id, name_en, name_ar, position_en, position_ar, bio_en, bio_ar, image, linkedin_url, twitter_url, sort_order, is_active, created_at, updated_at, created_by) ON public.team_members TO anon;