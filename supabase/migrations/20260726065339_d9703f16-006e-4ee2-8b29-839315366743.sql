ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS full_description text,
  ADD COLUMN IF NOT EXISTS gallery text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS duration text,
  ADD COLUMN IF NOT EXISTS features text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS challenges text,
  ADD COLUMN IF NOT EXISTS solutions text,
  ADD COLUMN IF NOT EXISTS results text,
  ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true;

DROP POLICY IF EXISTS projects_public_read ON public.projects;
CREATE POLICY projects_public_read ON public.projects
  FOR SELECT TO anon, authenticated
  USING (((visible = true) AND (published = true)) OR public.has_role(auth.uid(), 'admin'::app_role));