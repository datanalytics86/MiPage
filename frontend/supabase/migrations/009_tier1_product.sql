-- 009: producto (fotos, aviso transaccional, mayoría de edad). Idempotente.
-- Aplicar antes de desplegar el frontend de esta fase. No editar 002–008.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age_declared_at timestamptz;

ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS age_declared_at timestamptz;

ALTER TABLE public.providers DROP CONSTRAINT IF EXISTS providers_age_adult_check;
ALTER TABLE public.providers
  ADD CONSTRAINT providers_age_adult_check CHECK (age IS NULL OR age >= 18);

UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'gallery';

DROP POLICY IF EXISTS "Users upload own listing drafts" ON storage.objects;
CREATE POLICY "Users upload own listing drafts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'gallery'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (storage.foldername(name))[2] = 'draft'
  );

DROP POLICY IF EXISTS "Users delete own listing drafts" ON storage.objects;
CREATE POLICY "Users delete own listing drafts"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'gallery'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (storage.foldername(name))[2] = 'draft'
  );

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_safe public.user_role;
  v_consent text;
  v_age_ok boolean;
BEGIN
  v_role := lower(trim(coalesce(NEW.raw_user_meta_data->>'role', 'user')));
  v_age_ok := lower(trim(coalesce(NEW.raw_user_meta_data->>'age_declared', ''))) IN ('true', '1');
  IF v_role = 'provider' AND public.provider_registration_open() AND v_age_ok THEN
    v_safe := 'provider';
  ELSE
    v_safe := 'user';
  END IF;

  v_consent := lower(trim(coalesce(NEW.raw_user_meta_data->>'privacy_consent', '')));

  INSERT INTO public.profiles (
    id, email, name, role, privacy_consent_at, privacy_consent_version, age_declared_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(trim(coalesce(NEW.raw_user_meta_data->>'name', '')), ''),
    v_safe,
    CASE WHEN v_consent IN ('true', '1', 'yes') THEN now() ELSE NULL END,
    NULLIF(trim(coalesce(NEW.raw_user_meta_data->>'privacy_consent_version', '')), ''),
    CASE WHEN v_age_ok THEN now() ELSE NULL END
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.submit_provider_listing(p_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_confirmed timestamptz;
  v_id uuid;
  v_slug text;
  v_name text;
  v_category text;
  v_city text;
  v_bio text;
  v_whatsapp text;
  v_instagram text;
  v_price integer;
  v_age integer;
  v_urls text[];
  v_url text;
  v_meta jsonb;
  v_service_name text;
  v_service_price text;
  v_existing boolean;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  SELECT email_confirmed_at INTO v_confirmed FROM auth.users WHERE id = v_uid;
  IF v_confirmed IS NULL THEN
    RAISE EXCEPTION 'Confirma tu correo antes de enviar el aviso';
  END IF;

  IF coalesce(p_payload->>'age_declared', '') NOT IN ('true', '1') THEN
    RAISE EXCEPTION 'Debes declarar que eres mayor de 18 años';
  END IF;

  SELECT id INTO v_id FROM public.providers WHERE user_id = v_uid LIMIT 1;
  v_existing := v_id IS NOT NULL;

  IF NOT v_existing AND NOT public.provider_registration_open() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'El registro de profesionales está cerrado';
  END IF;

  v_name := left(regexp_replace(trim(coalesce(p_payload->>'display_name', '')), '<[^>]*>', '', 'g'), 80);
  IF length(v_name) < 2 THEN
    RAISE EXCEPTION 'Nombre público requerido';
  END IF;

  v_category := lower(trim(coalesce(p_payload->>'category', 'masajes')));
  IF v_category !~ '^[a-z0-9-]{2,40}$' THEN
    v_category := 'masajes';
  END IF;

  v_city := left(regexp_replace(trim(coalesce(p_payload->>'city', '')), '<[^>]*>', '', 'g'), 80);
  IF length(v_city) < 2 THEN
    RAISE EXCEPTION 'Ciudad requerida';
  END IF;

  v_bio := left(regexp_replace(coalesce(p_payload->>'bio', ''), '<[^>]*>', '', 'g'), 2000);
  v_whatsapp := left(regexp_replace(trim(coalesce(p_payload->>'whatsapp', '')), '<[^>]*>', '', 'g'), 32);
  v_instagram := left(regexp_replace(trim(coalesce(p_payload->>'instagram', '')), '<[^>]*>', '', 'g'), 80);

  IF coalesce(p_payload->>'price_min', '') = '' THEN
    v_price := NULL;
  ELSIF p_payload->>'price_min' !~ '^[0-9]{1,8}$' THEN
    RAISE EXCEPTION 'Precio inválido';
  ELSE
    v_price := (p_payload->>'price_min')::integer;
  END IF;

  IF coalesce(p_payload->>'age', '') = '' THEN
    v_age := NULL;
  ELSIF p_payload->>'age' !~ '^[0-9]{1,2}$' OR (p_payload->>'age')::integer < 18 THEN
    RAISE EXCEPTION 'La edad debe ser 18 o más';
  ELSE
    v_age := (p_payload->>'age')::integer;
  END IF;

  SELECT coalesce(array_agg(t.value ORDER BY t.ord), '{}')
  INTO v_urls
  FROM jsonb_array_elements_text(coalesce(p_payload->'photos', '[]'::jsonb)) WITH ORDINALITY AS t(value, ord);

  IF coalesce(array_length(v_urls, 1), 0) < 3 OR coalesce(array_length(v_urls, 1), 0) > 6 THEN
    RAISE EXCEPTION 'Se requieren entre 3 y 6 fotos';
  END IF;

  FOREACH v_url IN ARRAY v_urls LOOP
    IF v_url IS NULL
       OR length(v_url) > 2000
       OR v_url !~ '^https?://'
       OR position('..' in v_url) > 0
       OR v_url ~* '\.(mp4|mov|webm|svg)(\?|$)' THEN
      RAISE EXCEPTION 'Foto inválida';
    END IF;
    IF position('/gallery/' || v_uid::text || '/draft/' in v_url) = 0
       AND (v_id IS NULL OR position('/gallery/' || v_id::text || '/' in v_url) = 0) THEN
      RAISE EXCEPTION 'La foto no está en tu carpeta';
    END IF;
  END LOOP;

  v_meta := CASE
    WHEN jsonb_typeof(p_payload->'metadata') = 'object' THEN p_payload->'metadata'
    ELSE '{}'::jsonb
  END;
  IF octet_length(v_meta::text) > 8000 THEN
    RAISE EXCEPTION 'Metadata demasiado grande';
  END IF;

  IF v_id IS NULL THEN
    v_slug := lower(regexp_replace(v_name, '[^a-z0-9]+', '-', 'g'));
    v_slug := trim(both '-' from v_slug);
    IF length(v_slug) < 3 THEN
      v_slug := 'aviso';
    END IF;
    v_slug := left(v_slug, 40) || '-' || substr(replace(v_uid::text, '-', ''), 1, 8);
    WHILE EXISTS (SELECT 1 FROM public.providers WHERE slug = v_slug) LOOP
      v_slug := left(v_slug, 48) || '-' || substr(md5(random()::text || clock_timestamp()::text), 1, 4);
    END LOOP;

    INSERT INTO public.providers (
      user_id, slug, display_name, category, city, bio, whatsapp, instagram,
      price_min, age, age_declared_at, photos, cover_photo, metadata,
      status, is_featured, is_verified, rating, review_count, view_count, submitted_at
    )
    VALUES (
      v_uid, v_slug, v_name, v_category, v_city, nullif(v_bio, ''), nullif(v_whatsapp, ''), nullif(v_instagram, ''),
      v_price, v_age, now(), v_urls, v_urls[1], v_meta,
      'pending', false, false, 0, 0, 0, now()
    )
    RETURNING id INTO v_id;
  ELSE
    UPDATE public.providers
    SET display_name = v_name,
        category = v_category,
        city = v_city,
        bio = nullif(v_bio, ''),
        whatsapp = nullif(v_whatsapp, ''),
        instagram = nullif(v_instagram, ''),
        price_min = v_price,
        age = v_age,
        age_declared_at = coalesce(age_declared_at, now()),
        photos = v_urls,
        cover_photo = v_urls[1],
        metadata = v_meta,
        status = 'pending',
        rejection_reason = NULL,
        submitted_at = now(),
        updated_at = now()
    WHERE id = v_id;
  END IF;

  DELETE FROM public.gallery WHERE provider_id = v_id;
  INSERT INTO public.gallery (provider_id, type, url, is_cover, sort_order)
  SELECT v_id, 'image'::public.media_type, t.value, t.ord = 1, (t.ord - 1)::integer
  FROM unnest(v_urls) WITH ORDINALITY AS t(value, ord);

  v_service_name := left(regexp_replace(trim(coalesce(p_payload->>'service_name', '')), '<[^>]*>', '', 'g'), 80);
  v_service_price := coalesce(p_payload->>'service_price', '');
  IF v_service_name <> '' AND v_service_price ~ '^[0-9]{1,8}$' THEN
    UPDATE public.services
    SET name = v_service_name,
        price = v_service_price::integer,
        duration = NULLIF(left(trim(coalesce(p_payload->>'service_duration', '')), 40), ''),
        is_active = true
    WHERE id = (
      SELECT id FROM public.services
      WHERE provider_id = v_id
      ORDER BY sort_order, created_at
      LIMIT 1
    );
    IF NOT FOUND THEN
      INSERT INTO public.services (provider_id, name, price, duration, is_active, sort_order)
      VALUES (
        v_id,
        v_service_name,
        v_service_price::integer,
        NULLIF(left(trim(coalesce(p_payload->>'service_duration', '')), 40), ''),
        true,
        0
      );
    END IF;
  END IF;

  UPDATE public.profiles
  SET age_declared_at = coalesce(age_declared_at, now())
  WHERE id = v_uid;

  UPDATE public.profiles
  SET role = 'provider'
  WHERE id = v_uid
    AND role = 'user'
    AND (public.provider_registration_open() OR public.is_admin() OR v_existing);

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_provider_listing(jsonb) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.submit_provider_listing(jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.list_public_providers(
  p_category text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_verified boolean DEFAULT NULL,
  p_search text DEFAULT NULL,
  p_sort text DEFAULT 'featured',
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS SETOF public.providers
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_search text := NULLIF(regexp_replace(coalesce(p_search, ''), '[%_\\(),*]', '', 'g'), '');
  v_limit integer := least(greatest(coalesce(p_limit, 20), 1), 48);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
  v_sort text := coalesce(NULLIF(p_sort, ''), 'featured');
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM public.providers p
  WHERE p.status = 'approved'
    AND (p_category IS NULL OR p_category = '' OR p.category = p_category)
    AND (p_city IS NULL OR p_city = '' OR p.city = p_city)
    AND (p_verified IS NULL OR p.is_verified = p_verified)
    AND (
      v_search IS NULL
      OR p.display_name ILIKE '%' || v_search || '%'
      OR coalesce(p.bio, '') ILIKE '%' || v_search || '%'
    )
  ORDER BY
    CASE
      WHEN v_sort = 'featured' AND p.is_featured AND (p.featured_until IS NULL OR p.featured_until > now()) THEN 1
      ELSE 0
    END DESC,
    CASE WHEN v_sort IN ('featured', 'rating') THEN p.rating END DESC NULLS LAST,
    CASE WHEN v_sort = 'price_low' THEN p.price_min END ASC NULLS LAST,
    CASE WHEN v_sort = 'price_high' THEN p.price_min END DESC NULLS LAST,
    CASE WHEN v_sort = 'newest' THEN p.created_at END DESC NULLS LAST,
    p.created_at DESC
  LIMIT v_limit
  OFFSET v_offset;
END;
$$;

REVOKE ALL ON FUNCTION public.list_public_providers(text, text, boolean, text, text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_public_providers(text, text, boolean, text, text, integer, integer) TO anon, authenticated, service_role;
