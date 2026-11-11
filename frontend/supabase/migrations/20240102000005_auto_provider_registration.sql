-- =============================================
-- AUTO REGISTRO DE PROVEEDORES — MiPage
-- =============================================
-- Ejecutar en Supabase SQL Editor después de 002–004.
-- Crea automáticamente una fila en `providers` (status: pending) cuando
-- un perfil tiene role = 'provider' (signup, admin o seed).

-- Un proveedor por usuario
CREATE UNIQUE INDEX IF NOT EXISTS idx_providers_user_id_unique ON public.providers(user_id);

-- Slug único a partir del nombre
CREATE OR REPLACE FUNCTION public.generate_provider_slug(base_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter int := 0;
BEGIN
  base_slug := lower(
    regexp_replace(
      regexp_replace(trim(coalesce(base_name, 'proveedor')), '\s+', '-', 'g'),
      '[^a-z0-9-]',
      '',
      'g'
    )
  );

  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := 'proveedor';
  END IF;

  final_slug := base_slug;

  WHILE EXISTS (SELECT 1 FROM public.providers WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$;

-- Crea proveedor pendiente si no existe
CREATE OR REPLACE FUNCTION public.ensure_provider_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_category text;
  v_city text;
  v_display_name text;
  v_slug text;
  v_meta jsonb;
BEGIN
  IF NEW.role IS DISTINCT FROM 'provider' THEN
    RETURN NEW;
  END IF;

  IF EXISTS (SELECT 1 FROM public.providers WHERE user_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  SELECT raw_user_meta_data INTO v_meta
  FROM auth.users
  WHERE id = NEW.id;

  v_display_name := coalesce(
    nullif(trim(NEW.name), ''),
    nullif(trim(v_meta->>'name'), ''),
    split_part(NEW.email, '@', 1),
    'Nuevo Proveedor'
  );

  v_category := coalesce(nullif(trim(v_meta->>'category'), ''), 'masajes');
  v_city := coalesce(nullif(trim(v_meta->>'city'), ''), 'Santiago');
  v_slug := public.generate_provider_slug(v_display_name);

  INSERT INTO public.providers (user_id, slug, display_name, category, city, status)
  VALUES (NEW.id, v_slug, v_display_name, v_category, v_city, 'pending')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_provider_role ON public.profiles;

CREATE TRIGGER on_profile_provider_role
  AFTER INSERT OR UPDATE OF role, name ON public.profiles
  FOR EACH ROW
  WHEN (NEW.role = 'provider')
  EXECUTE FUNCTION public.ensure_provider_profile();