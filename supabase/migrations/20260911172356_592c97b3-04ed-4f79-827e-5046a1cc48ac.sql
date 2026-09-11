CREATE OR REPLACE FUNCTION public.increment_prompt_copies(_prompt_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.prompts
     SET copies_count = COALESCE(copies_count, 0) + 1
   WHERE id = _prompt_id AND is_active = true
  RETURNING copies_count INTO v_count;
  RETURN COALESCE(v_count, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.increment_prompt_copies(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.increment_prompt_copies(uuid) TO anon, authenticated;