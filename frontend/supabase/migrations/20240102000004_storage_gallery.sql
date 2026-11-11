-- =============================================
-- STORAGE: bucket "gallery" + políticas RLS
-- Ejecutar en Supabase → SQL Editor
-- =============================================

-- Bucket público con límites (10 MB, imágenes y video corto)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery',
  true,
  10485760,
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/quicktime'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket avatars (perfil de usuario)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Limpiar políticas previas (idempotente)
DROP POLICY IF EXISTS "Gallery images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Providers can upload gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Providers can update own gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Providers can delete own gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage gallery storage" ON storage.objects;

DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- Helper: primer segmento de la ruta = provider_id o user_id
-- Ruta esperada galería: {provider_id}/{archivo.ext}

-- GALLERY: lectura pública
CREATE POLICY "Gallery images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery');

-- GALLERY: proveedores suben a su carpeta
CREATE POLICY "Providers can upload gallery images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'gallery'
    AND EXISTS (
      SELECT 1 FROM public.providers
      WHERE providers.user_id = auth.uid()
      AND providers.id::text = (storage.foldername(name))[1]
    )
  );

-- GALLERY: proveedores actualizan sus archivos
CREATE POLICY "Providers can update own gallery images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'gallery'
    AND EXISTS (
      SELECT 1 FROM public.providers
      WHERE providers.user_id = auth.uid()
      AND providers.id::text = (storage.foldername(name))[1]
    )
  )
  WITH CHECK (
    bucket_id = 'gallery'
    AND EXISTS (
      SELECT 1 FROM public.providers
      WHERE providers.user_id = auth.uid()
      AND providers.id::text = (storage.foldername(name))[1]
    )
  );

-- GALLERY: proveedores eliminan sus archivos
CREATE POLICY "Providers can delete own gallery images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'gallery'
    AND EXISTS (
      SELECT 1 FROM public.providers
      WHERE providers.user_id = auth.uid()
      AND providers.id::text = (storage.foldername(name))[1]
    )
  );

-- GALLERY: admins gestionan todo el bucket
CREATE POLICY "Admins can manage gallery storage"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'gallery'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'gallery'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- AVATARS: lectura pública
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- AVATARS: usuario sube en su carpeta {user_id}/...
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );