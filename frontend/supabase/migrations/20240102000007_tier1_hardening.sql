-- =============================================
-- 007: Tier 1 hardening (idempotente)
-- Ejecutar en el SQL Editor después de schema.sql y 002, 004, 005, 006.
-- No incluye el seed demo (ahora en supabase/seed/).
-- Se puede correr dos veces.
--
-- Supabase otorga por defecto las funciones nuevas a anon/authenticated.
-- Cada función revoca eso y vuelve a conceder solo lo necesario.
-- =============================================

-- ---------------------------------------------
-- 1.1 is_admin() — leer profiles sin recursión de RLS
-- ---------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- Marca de un solo uso para que funciones SECURITY DEFINER puedan tocar
-- columnas que el usuario no puede cambiar. No usa un GUC: el cliente puede
-- llamar set_config, pero no puede escribir esta tabla.
CREATE TABLE IF NOT EXISTS public.privileged_writes (
  pid integer PRIMARY KEY,
  op text NOT NULL CHECK (op IN ('rating', 'view', 'response', 'helpful'))
);

ALTER TABLE public.privileged_writes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.privileged_writes FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.begin_privileged_write(p_op text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_op NOT IN ('rating', 'view', 'response', 'helpful') THEN
    RAISE EXCEPTION 'operación interna inválida';
  END IF;
  INSERT INTO public.privileged_writes (pid, op)
  VALUES (pg_backend_pid(), p_op)
  ON CONFLICT (pid) DO UPDATE SET op = EXCLUDED.op;
END;
$$;

CREATE OR REPLACE FUNCTION public.consume_privileged_write(p_op text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_op text;
BEGIN
  DELETE FROM public.privileged_writes
  WHERE pid = pg_backend_pid()
    AND op = p_op
  RETURNING op INTO v_op;
  RETURN v_op IS NOT NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.begin_privileged_write(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.consume_privileged_write(text) FROM PUBLIC, anon, authenticated, service_role;
-- Solo el dueño de las funciones SECURITY DEFINER puede abrir la marca.
-- El trigger corre como el usuario de la sesión y necesita consumirla.
DO $$
BEGIN
  EXECUTE format('GRANT EXECUTE ON FUNCTION public.begin_privileged_write(text) TO %I', current_user);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'grant begin_privileged_write: %', SQLERRM;
END $$;
DO $$
DECLARE
  v_role text;
BEGIN
  FOREACH v_role IN ARRAY ARRAY['postgres', 'supabase_admin', 'service_role']
  LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = v_role) THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION public.begin_privileged_write(text) TO %I', v_role);
    END IF;
  END LOOP;
END $$;
GRANT EXECUTE ON FUNCTION public.consume_privileged_write(text) TO anon, authenticated;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT EXECUTE ON FUNCTION public.consume_privileged_write(text) TO service_role;
  END IF;
END $$;

-- ---------------------------------------------
-- 1.1 handle_new_user: solo user | provider, más consentimiento
-- ---------------------------------------------

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS privacy_consent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS privacy_consent_version TEXT;

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
BEGIN
  v_role := lower(trim(coalesce(NEW.raw_user_meta_data->>'role', 'user')));
  IF v_role = 'provider' THEN
    v_safe := 'provider';
  ELSE
    v_safe := 'user';
  END IF;

  v_consent := lower(trim(coalesce(NEW.raw_user_meta_data->>'privacy_consent', '')));

  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    privacy_consent_at,
    privacy_consent_version
  )
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(trim(coalesce(NEW.raw_user_meta_data->>'name', '')), ''),
    v_safe,
    CASE WHEN v_consent IN ('true', '1', 'yes') THEN now() ELSE NULL END,
    NULLIF(trim(coalesce(NEW.raw_user_meta_data->>'privacy_consent_version', '')), '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated, service_role;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Impide escalar role, cambiar id/email propio y quitarse el último admin.
CREATE OR REPLACE FUNCTION public.protect_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_admins integer;
BEGIN
  IF current_user IN ('postgres', 'supabase_admin', 'supabase_auth_admin', 'service_role') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.role = 'admin' AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'No puedes registrarte como administrador';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'No puedes cambiar el id del perfil';
  END IF;

  IF auth.uid() = OLD.id AND NEW.email IS DISTINCT FROM OLD.email THEN
    RAISE EXCEPTION 'No puedes cambiar el email del perfil';
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF public.is_admin() THEN
      IF OLD.role = 'admin'
         AND NEW.role IS DISTINCT FROM 'admin'
         AND OLD.id = auth.uid() THEN
        SELECT count(*) INTO v_admins FROM public.profiles WHERE role = 'admin';
        IF v_admins <= 1 THEN
          RAISE EXCEPTION 'No puedes quitarte el rol: eres el último administrador';
        END IF;
      END IF;
    ELSIF auth.uid() IS NOT NULL THEN
      IF NOT (OLD.id = auth.uid() AND OLD.role = 'user' AND NEW.role = 'provider') THEN
        RAISE EXCEPTION 'No puedes cambiar tu rol';
      END IF;
    ELSE
      RAISE EXCEPTION 'No puedes cambiar tu rol';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_profile_update() FROM PUBLIC, anon, authenticated, service_role;

DROP TRIGGER IF EXISTS protect_profile_update ON public.profiles;
CREATE TRIGGER protect_profile_update
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_update();

CREATE OR REPLACE FUNCTION public.become_provider()
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  UPDATE public.profiles
  SET role = 'provider'
  WHERE id = auth.uid()
    AND role = 'user';
END;
$$;

REVOKE ALL ON FUNCTION public.become_provider() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.become_provider() TO authenticated;

-- ---------------------------------------------
-- 1.2 providers: no auto-aprobar, no destacarse, re-moderación
-- ---------------------------------------------

CREATE OR REPLACE FUNCTION public.protect_provider_row()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_rating numeric;
  v_reviews integer;
  v_views integer;
BEGIN
  IF current_user IN ('postgres', 'supabase_admin', 'supabase_auth_admin', 'service_role')
     OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF public.consume_privileged_write('view') THEN
    v_views := NEW.view_count;
    NEW := OLD;
    NEW.view_count := v_views;
    RETURN NEW;
  END IF;

  IF public.consume_privileged_write('rating') THEN
    v_rating := NEW.rating;
    v_reviews := NEW.review_count;
    NEW := OLD;
    NEW.rating := COALESCE(v_rating, 0);
    NEW.review_count := COALESCE(v_reviews, 0);
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.user_id IS DISTINCT FROM auth.uid() THEN
      RAISE EXCEPTION 'No puedes crear un perfil de otro usuario';
    END IF;
    NEW.status := 'pending';
    NEW.is_featured := false;
    NEW.is_verified := false;
    NEW.rating := 0;
    NEW.review_count := 0;
    NEW.view_count := 0;
    NEW.moderated_at := NULL;
    NEW.moderated_by := NULL;
    RETURN NEW;
  END IF;

  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'No puedes cambiar el dueño del perfil';
  END IF;

  IF NEW.is_featured IS DISTINCT FROM OLD.is_featured
     OR NEW.is_verified IS DISTINCT FROM OLD.is_verified
     OR NEW.rating IS DISTINCT FROM OLD.rating
     OR NEW.review_count IS DISTINCT FROM OLD.review_count
     OR NEW.view_count IS DISTINCT FROM OLD.view_count
     OR NEW.moderated_at IS DISTINCT FROM OLD.moderated_at
     OR NEW.moderated_by IS DISTINCT FROM OLD.moderated_by THEN
    RAISE EXCEPTION 'No puedes modificar campos de moderación';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IS DISTINCT FROM 'pending' THEN
    RAISE EXCEPTION 'Solo puedes reenviar el aviso a revisión';
  END IF;

  IF OLD.status = 'approved' AND (
    NEW.display_name IS DISTINCT FROM OLD.display_name
    OR NEW.bio IS DISTINCT FROM OLD.bio
    OR NEW.photos IS DISTINCT FROM OLD.photos
    OR NEW.cover_photo IS DISTINCT FROM OLD.cover_photo
    OR NEW.category IS DISTINCT FROM OLD.category
    OR NEW.whatsapp IS DISTINCT FROM OLD.whatsapp
    OR NEW.instagram IS DISTINCT FROM OLD.instagram
  ) THEN
    NEW.status := 'pending';
    NEW.moderated_at := NULL;
    NEW.moderated_by := NULL;
    NEW.rejection_reason := NULL;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_provider_row() FROM PUBLIC, anon, authenticated, service_role;

DROP TRIGGER IF EXISTS protect_provider_row ON public.providers;
CREATE TRIGGER protect_provider_row
  BEFORE INSERT OR UPDATE ON public.providers
  FOR EACH ROW EXECUTE FUNCTION public.protect_provider_row();

-- Una sola política de lectura (schema.sql y 002 definían dos).
DROP POLICY IF EXISTS "Approved providers are viewable by everyone" ON public.providers;
DROP POLICY IF EXISTS "Admins can view all providers" ON public.providers;
DROP POLICY IF EXISTS "Providers are viewable by role" ON public.providers;
CREATE POLICY "Providers are viewable by role"
  ON public.providers FOR SELECT
  USING (
    status = 'approved'
    OR auth.uid() = user_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can do everything" ON public.providers;
CREATE POLICY "Admins can do everything"
  ON public.providers FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users can update own provider profile" ON public.providers;
CREATE POLICY "Users can update own provider profile"
  ON public.providers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------
-- 1.3 profiles: email y teléfono dejan de ser públicos
-- ---------------------------------------------

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by owner or admin" ON public.profiles;
CREATE POLICY "Profiles are viewable by owner or admin"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.public_profile_rows()
RETURNS TABLE (id uuid, name text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.name, p.avatar_url
  FROM public.profiles p;
$$;

REVOKE ALL ON FUNCTION public.public_profile_rows() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.public_profile_rows() TO anon, authenticated, service_role;

CREATE OR REPLACE VIEW public.public_profiles
WITH (security_barrier = true, security_invoker = false) AS
  SELECT id, name, avatar_url
  FROM public.public_profile_rows();

GRANT SELECT ON public.public_profiles TO anon, authenticated, service_role;

-- ---------------------------------------------
-- 1.5 reseñas
-- ---------------------------------------------

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.is_self_review(p_provider uuid, p_user uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.providers
    WHERE id = p_provider
      AND user_id = p_user
  );
$$;

REVOKE ALL ON FUNCTION public.is_self_review(uuid, uuid) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_self_review(uuid, uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.protect_review_write()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_response text;
  v_response_date timestamptz;
  v_helpful integer;
BEGIN
  IF current_user IN ('postgres', 'supabase_admin', 'supabase_auth_admin', 'service_role')
     OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND public.consume_privileged_write('response') THEN
    v_response := NEW.provider_response;
    v_response_date := NEW.response_date;
    NEW := OLD;
    NEW.provider_response := v_response;
    NEW.response_date := v_response_date;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND public.consume_privileged_write('helpful') THEN
    v_helpful := NEW.helpful_count;
    NEW := OLD;
    NEW.helpful_count := COALESCE(v_helpful, 0);
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.user_id IS DISTINCT FROM auth.uid() THEN
      RAISE EXCEPTION 'No puedes reseñar en nombre de otro';
    END IF;
    IF public.is_self_review(NEW.provider_id, NEW.user_id) THEN
      RAISE EXCEPTION 'No puedes reseñar tu propio perfil';
    END IF;
    NEW.provider_response := NULL;
    NEW.response_date := NULL;
    NEW.helpful_count := 0;
    NEW.is_hidden := false;
    RETURN NEW;
  END IF;

  IF auth.uid() = OLD.user_id THEN
    IF NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.provider_id IS DISTINCT FROM OLD.provider_id
       OR NEW.provider_response IS DISTINCT FROM OLD.provider_response
       OR NEW.response_date IS DISTINCT FROM OLD.response_date
       OR NEW.helpful_count IS DISTINCT FROM OLD.helpful_count
       OR NEW.is_hidden IS DISTINCT FROM OLD.is_hidden THEN
      RAISE EXCEPTION 'Solo puedes editar la calificación y el comentario';
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'No puedes modificar esta reseña';
END;
$$;

REVOKE ALL ON FUNCTION public.protect_review_write() FROM PUBLIC, anon, authenticated, service_role;

DROP TRIGGER IF EXISTS protect_review_write ON public.reviews;
CREATE TRIGGER protect_review_write
  BEFORE INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.protect_review_write();

CREATE OR REPLACE FUNCTION public.update_provider_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_provider uuid;
  v_avg numeric;
  v_count integer;
BEGIN
  v_provider := COALESCE(NEW.provider_id, OLD.provider_id);

  SELECT ROUND(AVG(rating)::numeric, 1), COUNT(*)::integer
  INTO v_avg, v_count
  FROM public.reviews
  WHERE provider_id = v_provider
    AND is_hidden = false;

  PERFORM public.begin_privileged_write('rating');
  UPDATE public.providers
  SET
    rating = COALESCE(v_avg, 0),
    review_count = COALESCE(v_count, 0)
  WHERE id = v_provider;
  DELETE FROM public.privileged_writes WHERE pid = pg_backend_pid();

  RETURN COALESCE(NEW, OLD);
EXCEPTION WHEN OTHERS THEN
  DELETE FROM public.privileged_writes WHERE pid = pg_backend_pid();
  RAISE;
END;
$$;

REVOKE ALL ON FUNCTION public.update_provider_rating() FROM PUBLIC, anon, authenticated, service_role;

DROP TRIGGER IF EXISTS update_rating_on_review ON public.reviews;
CREATE TRIGGER update_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_provider_rating();

CREATE OR REPLACE FUNCTION public.respond_to_review(p_review_id uuid, p_response text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
  v_text text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  v_text := left(trim(coalesce(p_response, '')), 2000);
  IF v_text = '' THEN
    RAISE EXCEPTION 'La respuesta está vacía';
  END IF;

  SELECT pr.user_id INTO v_owner
  FROM public.reviews r
  JOIN public.providers pr ON pr.id = r.provider_id
  WHERE r.id = p_review_id;

  IF v_owner IS NULL OR v_owner IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Solo el proveedor puede responder';
  END IF;

  PERFORM public.begin_privileged_write('response');
  UPDATE public.reviews
  SET
    provider_response = v_text,
    response_date = now()
  WHERE id = p_review_id;
  DELETE FROM public.privileged_writes WHERE pid = pg_backend_pid();
EXCEPTION WHEN OTHERS THEN
  DELETE FROM public.privileged_writes WHERE pid = pg_backend_pid();
  RAISE;
END;
$$;

REVOKE ALL ON FUNCTION public.respond_to_review(uuid, text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.respond_to_review(uuid, text) TO authenticated;

CREATE TABLE IF NOT EXISTS public.review_helpful_votes (
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (review_id, user_id)
);

ALTER TABLE public.review_helpful_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own helpful votes" ON public.review_helpful_votes;
CREATE POLICY "Users see own helpful votes"
  ON public.review_helpful_votes FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE OR REPLACE FUNCTION public.mark_review_helpful(p_review_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.reviews WHERE id = p_review_id AND is_hidden = false) THEN
    RAISE EXCEPTION 'Reseña no disponible';
  END IF;

  INSERT INTO public.review_helpful_votes (review_id, user_id)
  VALUES (p_review_id, auth.uid())
  ON CONFLICT (review_id, user_id) DO NOTHING;

  SELECT count(*)::integer INTO v_count
  FROM public.review_helpful_votes
  WHERE review_id = p_review_id;

  PERFORM public.begin_privileged_write('helpful');
  UPDATE public.reviews
  SET helpful_count = v_count
  WHERE id = p_review_id;
  DELETE FROM public.privileged_writes WHERE pid = pg_backend_pid();

  RETURN v_count;
EXCEPTION WHEN OTHERS THEN
  DELETE FROM public.privileged_writes WHERE pid = pg_backend_pid();
  RAISE;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_review_helpful(uuid) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mark_review_helpful(uuid) TO authenticated;

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Reviews are viewable when public" ON public.reviews;
CREATE POLICY "Reviews are viewable when public"
  ON public.reviews FOR SELECT
  USING (
    (
      is_hidden = false
      OR auth.uid() = user_id
      OR public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.providers p
        WHERE p.id = reviews.provider_id
          AND p.user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
CREATE POLICY "Authenticated users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND NOT public.is_self_review(provider_id, auth.uid())
  );

DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Providers can respond to reviews" ON public.reviews;

DROP POLICY IF EXISTS "Authors and admins can delete reviews" ON public.reviews;
CREATE POLICY "Authors and admins can delete reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can moderate reviews" ON public.reviews;
CREATE POLICY "Admins can moderate reviews"
  ON public.reviews FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------
-- 1.6-c visitas
-- ---------------------------------------------

CREATE OR REPLACE FUNCTION public.increment_provider_view(p_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_slug IS NULL OR length(trim(p_slug)) = 0 OR length(p_slug) > 160 THEN
    RETURN;
  END IF;

  PERFORM public.begin_privileged_write('view');
  UPDATE public.providers
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE slug = trim(p_slug)
    AND status = 'approved';
  DELETE FROM public.privileged_writes WHERE pid = pg_backend_pid();
EXCEPTION WHEN OTHERS THEN
  DELETE FROM public.privileged_writes WHERE pid = pg_backend_pid();
  RAISE;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_provider_view(text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_provider_view(text) TO anon, authenticated, service_role;

-- ---------------------------------------------
-- 1.6-f rate limit persistente
-- ---------------------------------------------

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  bucket_key text PRIMARY KEY,
  hits integer NOT NULL DEFAULT 0,
  window_start timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.rate_limit_buckets FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
RETURNS TABLE (ok boolean, remaining integer, retry_after_sec integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hits integer;
  v_start timestamptz;
  v_now timestamptz := now();
BEGIN
  IF p_key IS NULL OR length(p_key) < 1 OR length(p_key) > 200 THEN
    RAISE EXCEPTION 'clave de rate limit inválida';
  END IF;
  IF p_limit < 1 OR p_limit > 10000 OR p_window_seconds < 1 OR p_window_seconds > 86400 THEN
    RAISE EXCEPTION 'ventana de rate limit inválida';
  END IF;

  INSERT INTO public.rate_limit_buckets (bucket_key, hits, window_start)
  VALUES (p_key, 1, v_now)
  ON CONFLICT (bucket_key) DO UPDATE
  SET
    hits = CASE
      WHEN public.rate_limit_buckets.window_start + make_interval(secs => p_window_seconds) <= v_now
        THEN 1
      ELSE public.rate_limit_buckets.hits + 1
    END,
    window_start = CASE
      WHEN public.rate_limit_buckets.window_start + make_interval(secs => p_window_seconds) <= v_now
        THEN v_now
      ELSE public.rate_limit_buckets.window_start
    END
  RETURNING hits, window_start
  INTO v_hits, v_start;

  IF v_hits > p_limit THEN
    ok := false;
    remaining := 0;
    retry_after_sec := GREATEST(
      1,
      ceil(extract(epoch FROM (v_start + make_interval(secs => p_window_seconds) - v_now)))::integer
    );
  ELSE
    ok := true;
    remaining := p_limit - v_hits;
    retry_after_sec := 0;
  END IF;

  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text, integer, integer) TO service_role;

-- ---------------------------------------------
-- 1.6-h / 1.6-i servicios y galería
-- ---------------------------------------------

DROP POLICY IF EXISTS "Services are viewable by everyone" ON public.services;
DROP POLICY IF EXISTS "Services are viewable when approved or owner" ON public.services;
CREATE POLICY "Services are viewable when approved or owner"
  ON public.services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = services.provider_id
        AND (
          p.status = 'approved'
          OR p.user_id = auth.uid()
          OR public.is_admin()
        )
    )
  );

DROP POLICY IF EXISTS "Admins manage services" ON public.services;
CREATE POLICY "Admins manage services"
  ON public.services FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Gallery items are viewable by everyone" ON public.gallery;
DROP POLICY IF EXISTS "Gallery is viewable when approved or owner" ON public.gallery;
CREATE POLICY "Gallery is viewable when approved or owner"
  ON public.gallery FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = gallery.provider_id
        AND (
          p.status = 'approved'
          OR p.user_id = auth.uid()
          OR public.is_admin()
        )
    )
  );

DROP POLICY IF EXISTS "Admins manage gallery" ON public.gallery;
CREATE POLICY "Admins manage gallery"
  ON public.gallery FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------
-- Políticas de admin que antes consultaban profiles directo
-- ---------------------------------------------

DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings"
  ON public.site_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can read active metadata fields" ON public.metadata_fields;
CREATE POLICY "Anyone can read active metadata fields"
  ON public.metadata_fields FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage metadata fields" ON public.metadata_fields;
CREATE POLICY "Admins manage metadata fields"
  ON public.metadata_fields FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins read notification log" ON public.notification_log;
CREATE POLICY "Admins read notification log"
  ON public.notification_log FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage deletion requests" ON public.data_deletion_requests;
CREATE POLICY "Admins manage deletion requests"
  ON public.data_deletion_requests FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;
CREATE POLICY "Admins can view all reports"
  ON public.reports FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;
CREATE POLICY "Admins can update reports"
  ON public.reports FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage gallery storage" ON storage.objects;
CREATE POLICY "Admins can manage gallery storage"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'gallery' AND public.is_admin())
  WITH CHECK (bucket_id = 'gallery' AND public.is_admin());

-- ---------------------------------------------
-- Auditoría (la vista de /admin llega en la fase 2; la moderación ya escribe)
-- ---------------------------------------------

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  before jsonb,
  after jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read audit log" ON public.admin_audit_log;
CREATE POLICY "Admins read audit log"
  ON public.admin_audit_log FOR SELECT
  USING (public.is_admin());

REVOKE ALL ON TABLE public.admin_audit_log FROM anon, authenticated;
GRANT SELECT ON public.admin_audit_log TO authenticated;

-- La home ya no debe leer estadísticas inventadas de la migración 002.
DELETE FROM public.site_settings WHERE key = 'stats';

-- Los triggers y el rol de Auth necesitan EXECUTE aunque se haya revocado PUBLIC.
DO $$
DECLARE
  v_fn text;
  v_role text;
BEGIN
  FOREACH v_fn IN ARRAY ARRAY[
    'public.handle_new_user()',
    'public.protect_profile_update()',
    'public.protect_provider_row()',
    'public.protect_review_write()',
    'public.update_provider_rating()'
  ]
  LOOP
    FOREACH v_role IN ARRAY ARRAY['postgres', 'supabase_admin', 'supabase_auth_admin', 'service_role']
    LOOP
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = v_role) THEN
        EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO %I', v_fn, v_role);
      END IF;
    END LOOP;
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO %I', v_fn, current_user);
  END LOOP;
END $$;
