CREATE TABLE public.about_code_card (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_name text NOT NULL,
  property_value text NOT NULL DEFAULT '',
  value_type text NOT NULL DEFAULT 'string',
  display_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.about_code_card TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.about_code_card TO authenticated;
GRANT ALL ON public.about_code_card TO service_role;

ALTER TABLE public.about_code_card ENABLE ROW LEVEL SECURITY;

CREATE POLICY about_code_card_anon_read ON public.about_code_card
  FOR SELECT TO anon USING (visible = true);
CREATE POLICY about_code_card_auth_read ON public.about_code_card
  FOR SELECT TO authenticated USING (visible = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY about_code_card_admin_write ON public.about_code_card
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER about_code_card_set_updated_at
  BEFORE UPDATE ON public.about_code_card
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.about_code_card (property_name, property_value, value_type, display_order) VALUES
  ('name', 'Dima Ejel', 'string', 0),
  ('role', 'CS Graduate', 'string', 1),
  ('skills', 'Java, React, Node.js', 'array', 2),
  ('available', 'true', 'boolean', 3),
  ('coffee', 'Infinity', 'raw', 4);