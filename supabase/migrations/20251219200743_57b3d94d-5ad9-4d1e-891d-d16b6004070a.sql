-- Create permissions table for granular access control
CREATE TABLE public.user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  page_name text NOT NULL,
  can_view boolean DEFAULT false,
  can_add boolean DEFAULT false,
  can_edit boolean DEFAULT false,
  can_delete boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, page_name)
);

-- Enable RLS
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins can manage all permissions"
ON public.user_permissions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users can read their own permissions
CREATE POLICY "Users can view their own permissions"
ON public.user_permissions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create function to check user permission
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _page_name text, _action text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin') THEN true
      WHEN _action = 'view' THEN COALESCE((SELECT can_view FROM public.user_permissions WHERE user_id = _user_id AND page_name = _page_name), false)
      WHEN _action = 'add' THEN COALESCE((SELECT can_add FROM public.user_permissions WHERE user_id = _user_id AND page_name = _page_name), false)
      WHEN _action = 'edit' THEN COALESCE((SELECT can_edit FROM public.user_permissions WHERE user_id = _user_id AND page_name = _page_name), false)
      WHEN _action = 'delete' THEN COALESCE((SELECT can_delete FROM public.user_permissions WHERE user_id = _user_id AND page_name = _page_name), false)
      ELSE false
    END
$$;

-- Trigger for updated_at
CREATE TRIGGER update_user_permissions_updated_at
  BEFORE UPDATE ON public.user_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();