
-- Contact submissions: the contact form is public (anonymous submissions allowed).
-- The table has no user_id column, so per-user isolation isn't possible with current schema.
-- The existing RLS is correct: only admins can SELECT/UPDATE/DELETE, anyone can INSERT with valid data.
-- No changes needed - the current RLS already prevents non-admin access.
-- But let's add an extra safety layer: ensure the anon role cannot SELECT at all.

-- Verify current state - existing policies are RESTRICTIVE (Permissive: No)
-- "Admins can view all submissions" SELECT with has_role check
-- "Anyone can submit contact form with valid data" INSERT with validation
-- These are already secure. Contact form is anonymous, no user_id to isolate by.

-- Add explicit denial for non-admin SELECT to be extra safe
-- Actually the existing RESTRICTIVE policies already handle this correctly.
-- Let's just confirm by adding a comment migration.

SELECT 1; -- No schema changes needed - RLS is already properly configured
