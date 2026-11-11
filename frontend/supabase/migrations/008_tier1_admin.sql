-- 008: autogestión del admin (idempotente). No editar 002–007.
-- Aplicar antes de desplegar el frontend de esta fase.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_suspended boolean NOT NULL DEFAULT false;

ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS featured_until timestamptz;

CREATE OR REPLACE FUNCTION public.provider_registration_open()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (
      SELECT (value->>'allowProviderRegistration')::boolean
      FROM public.site_settings
      WHERE key = 'security'
    ),
    true
  );
$$;

REVOKE ALL ON FUNCTION public.provider_registration_open() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.provider_registration_open() TO anon, authenticated, service_role;

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
  IF v_role = 'provider' AND public.provider_registration_open() THEN
    v_safe := 'provider';
  ELSE
    v_safe := 'user';
  END IF;

  v_consent := lower(trim(coalesce(NEW.raw_user_meta_data->>'privacy_consent', '')));

  INSERT INTO public.profiles (
    id, email, name, role, privacy_consent_at, privacy_consent_version
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
  IF NOT public.provider_registration_open() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'El registro de profesionales está cerrado';
  END IF;

  UPDATE public.profiles
  SET role = 'provider'
  WHERE id = auth.uid()
    AND role = 'user';
END;
$$;

REVOKE ALL ON FUNCTION public.become_provider() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.become_provider() TO authenticated;

CREATE OR REPLACE FUNCTION public.guard_provider_extras()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF current_user IN ('postgres', 'supabase_admin', 'supabase_auth_admin', 'service_role')
     OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.featured_until := NULL;
    IF NOT public.provider_registration_open() THEN
      RAISE EXCEPTION 'El registro de profesionales está cerrado';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.featured_until IS DISTINCT FROM OLD.featured_until THEN
    RAISE EXCEPTION 'No puedes modificar el destacado';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_provider_extras ON public.providers;
CREATE TRIGGER guard_provider_extras
  BEFORE INSERT OR UPDATE ON public.providers
  FOR EACH ROW EXECUTE FUNCTION public.guard_provider_extras();

CREATE OR REPLACE FUNCTION public.guard_profile_suspension()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND NEW.is_suspended IS DISTINCT FROM OLD.is_suspended
     AND current_user NOT IN ('postgres', 'supabase_admin', 'supabase_auth_admin', 'service_role')
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'No puedes suspender cuentas';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_profile_suspension ON public.profiles;
CREATE TRIGGER guard_profile_suspension
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_suspension();

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  label text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

INSERT INTO public.categories (slug, label, sort_order)
VALUES ('masajes', 'Masajes', 1), ('modelaje', 'Modelaje', 2)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.cities (name, sort_order)
VALUES ('Santiago', 1), ('Viña del Mar', 2), ('Concepción', 3), ('Valparaíso', 4)
ON CONFLICT (name) DO NOTHING;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reads active categories" ON public.categories;
CREATE POLICY "Public reads active categories"
  ON public.categories FOR SELECT
  USING (is_active OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Admins manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public reads active cities" ON public.cities;
CREATE POLICY "Public reads active cities"
  ON public.cities FOR SELECT
  USING (is_active OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage cities" ON public.cities;
CREATE POLICY "Admins manage cities"
  ON public.cities FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL,
  reason text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'replied', 'archived')),
  admin_reply text,
  replied_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read contact messages" ON public.contact_messages;
CREATE POLICY "Admins read contact messages"
  ON public.contact_messages FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins update contact messages" ON public.contact_messages;
CREATE POLICY "Admins update contact messages"
  ON public.contact_messages FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

REVOKE INSERT ON public.contact_messages FROM anon, authenticated;
GRANT SELECT, UPDATE ON public.contact_messages TO authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO service_role';
    EXECUTE 'GRANT INSERT ON public.admin_audit_log TO service_role';
  END IF;
END $$;

INSERT INTO public.site_settings (key, value)
VALUES (
  'content',
  jsonb_build_object(
    'contactEmail', 'contacto@mipage.cl',
    'legalEmail', 'legal@mipage.cl',
    'privacyEmail', 'privacidad@mipage.cl',
    'instagram', 'https://instagram.com/mipage.cl',
    'bannerEnabled', false,
    'bannerText', '',
    'heroEyebrow', '',
    'heroTitle', '',
    'heroSubtitle', ''
  )
)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (key, value)
VALUES (
  'moderation',
  jsonb_build_object(
    'rejectionReasons', jsonb_build_array(
      'Las fotos están un poco borrosas o poco nítidas. ¿Puedes subir al menos 3 imágenes claras del servicio y de ti?',
      'Parte del contenido no encaja con la política de MiPage. Revisa las normas y vuelve a enviar con fotos y texto apropiados.',
      'Detectamos datos de contacto o enlaces que parecen spam. Usa los campos de WhatsApp/Instagram y deja la bio limpia.',
      'La categoría o la ciudad no coinciden con el perfil. Corrige esos datos y reenvía para revisión.',
      'El perfil está incompleto (bio corta o sin precio). Completa la información y las fotos; con gusto lo revisamos de nuevo.'
    )
  )
)
ON CONFLICT (key) DO NOTHING;

UPDATE public.site_settings
SET value = value || '{"featuredDurationDays":30}'::jsonb
WHERE key = 'payments'
  AND NOT (value ? 'featuredDurationDays');

DO $$
DECLARE
  v_fn text;
  v_role text;
BEGIN
  FOREACH v_fn IN ARRAY ARRAY[
    'public.handle_new_user()',
    'public.guard_provider_extras()',
    'public.guard_profile_suspension()'
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
