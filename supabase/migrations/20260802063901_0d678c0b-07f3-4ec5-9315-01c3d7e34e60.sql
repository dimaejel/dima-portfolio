CREATE TABLE public.skill_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  visible boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.skill_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skill_categories TO authenticated;
GRANT ALL ON public.skill_categories TO service_role;

ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY skill_categories_anon_read ON public.skill_categories
  FOR SELECT TO anon USING (visible = true);
CREATE POLICY skill_categories_auth_read ON public.skill_categories
  FOR SELECT TO authenticated USING (visible = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY skill_categories_admin_write ON public.skill_categories
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER skill_categories_set_updated_at
  BEFORE UPDATE ON public.skill_categories
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.skill_categories (name, display_order)
SELECT category, (row_number() OVER (ORDER BY MIN(display_order), category))::int * 10
FROM public.skills
GROUP BY category
ON CONFLICT (name) DO NOTHING;