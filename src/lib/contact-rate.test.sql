-- Execute with the privileged database test tool. Only this test's random key is touched.
DO $$
DECLARE test_key text := md5(gen_random_uuid()::text) || md5(gen_random_uuid()::text);
BEGIN
  FOR attempt IN 1..3 LOOP
    IF public.claim_contact_submission(test_key) IS DISTINCT FROM true THEN
      RAISE EXCEPTION 'Submission % of three should be allowed', attempt;
    END IF;
  END LOOP;
  IF public.claim_contact_submission(test_key) IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Fourth submission within ten minutes should be blocked';
  END IF;
  UPDATE public.contact_rate_limits SET window_started_at = now() - interval '10 minutes' WHERE visitor_key = test_key;
  IF public.claim_contact_submission(test_key) IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Submission should be allowed after ten minutes';
  END IF;
  DELETE FROM public.contact_rate_limits WHERE visitor_key = test_key;
END;
$$;