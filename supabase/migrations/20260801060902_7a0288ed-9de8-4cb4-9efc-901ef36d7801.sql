CREATE TABLE public.about_section (
  id integer PRIMARY KEY DEFAULT 1,
  eyebrow text NOT NULL DEFAULT 'About Me',
  heading text NOT NULL DEFAULT 'Crafting Code,',
  heading_accent text NOT NULL DEFAULT 'Solving Problems.',
  description text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}'::text[],
  stats jsonb NOT NULL DEFAULT '[]'::jsonb,
  code_file_name text NOT NULL DEFAULT 'developer.ts',
  code_name text NOT NULL DEFAULT '',
  code_role text NOT NULL DEFAULT 'CS Graduate',
  code_skills text[] NOT NULL DEFAULT '{}'::text[],
  code_available boolean NOT NULL DEFAULT true,
  code_coffee text NOT NULL DEFAULT 'Infinity',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT about_section_singleton CHECK (id = 1)
);

GRANT SELECT ON public.about_section TO anon;
GRANT SELECT, UPDATE ON public.about_section TO authenticated;
GRANT ALL ON public.about_section TO service_role;

ALTER TABLE public.about_section ENABLE ROW LEVEL SECURITY;

CREATE POLICY about_section_public_read ON public.about_section FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY about_section_admin_update ON public.about_section FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER about_section_set_updated_at BEFORE UPDATE ON public.about_section
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.about_section (id, description, tags, stats, code_name, code_skills)
VALUES (
  1,
  E'I''m a Computer Science graduate with a deep passion for software development and technology. My academic journey has equipped me with strong foundations in algorithms, data structures, software engineering principles, and full-stack development.\n\nI love breaking down complex problems into elegant solutions. Whether it''s building efficient backend systems, designing intuitive web interfaces, or modeling relational databases — I approach every challenge with curiosity and discipline.\n\nMy goal is to join a forward-thinking team where I can contribute meaningful code from day one, grow as an engineer, and help build products that make a real difference.',
  ARRAY['Problem Solving','Clean Code','Continuous Learning','Team Collaboration'],
  '[{"value":"4+","label":"Projects Completed"},{"value":"10+","label":"Technologies"}]'::jsonb,
  'Dima Ejel',
  ARRAY['Java','React','Node.js']
);

DROP TABLE IF EXISTS public.achievements;