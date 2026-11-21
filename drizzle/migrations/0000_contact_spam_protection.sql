CREATE TABLE public.contact_rate_limits (visitor_key text PRIMARY KEY CHECK (length(visitor_key) = 64), window_started_at timestamptz NOT NULL DEFAULT now(), attempts integer NOT NULL DEFAULT 1 CHECK (attempts > 0));
GRANT ALL ON public.contact_rate_limits TO service_role;
ALTER TABLE public.contact_rate_limits ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.claim_contact_submission(p_key text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE claimed integer;
BEGIN
  IF p_key !~ '^[a-f0-9]{64}$' THEN RAISE EXCEPTION 'Invalid visitor key'; END IF;
  DELETE FROM public.contact_rate_limits WHERE window_started_at < now() - interval '1 day';
  INSERT INTO public.contact_rate_limits AS limits (visitor_key, window_started_at, attempts) VALUES (p_key, now(), 1)
  ON CONFLICT (visitor_key) DO UPDATE SET
    attempts = CASE WHEN limits.window_started_at <= now() - interval '10 minutes' THEN 1 ELSE limits.attempts + 1 END,
    window_started_at = CASE WHEN limits.window_started_at <= now() - interval '10 minutes' THEN now() ELSE limits.window_started_at END
  RETURNING attempts INTO claimed;
  RETURN claimed <= 3;
END; $$;
REVOKE ALL ON FUNCTION public.claim_contact_submission(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_contact_submission(text) TO service_role;
REVOKE INSERT ON public.contact_messages FROM anon, authenticated;
DROP POLICY IF EXISTS contact_public_insert ON public.contact_messages;