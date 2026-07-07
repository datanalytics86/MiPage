-- =============================================
-- SEED DEMO DATA — MiPage
-- =============================================
-- PREREQUISITOS:
--   1. Ejecutar migraciones 002, 004 y 005
--   2. Crear usuarios en Supabase Auth (o usar: node scripts/seed-demo.mjs)
--
-- Usuarios demo:
--   admin@mipage.cl        → admin
--   valentina@mipage.cl    → provider
--   camila@mipage.cl       → provider
--   sofia@mipage.cl        → provider
--   isabella@mipage.cl     → provider
--   cliente@mipage.cl      → user
--
-- El trigger ensure_provider_profile (005) crea providers al asignar role=provider.
-- Este script enriquece esos registros con datos de demostración.

-- Admin role
UPDATE profiles SET role = 'admin', name = 'Admin MiPage'
WHERE email = 'admin@mipage.cl';

-- Provider roles (dispara creación automática de providers pendientes)
UPDATE profiles SET role = 'provider', name = 'Valentina Reyes' WHERE email = 'valentina@mipage.cl';
UPDATE profiles SET role = 'provider', name = 'Camila Silva' WHERE email = 'camila@mipage.cl';
UPDATE profiles SET role = 'provider', name = 'Sofía Martínez' WHERE email = 'sofia@mipage.cl';
UPDATE profiles SET role = 'provider', name = 'Isabella Rojas' WHERE email = 'isabella@mipage.cl';

-- Enriquecer providers demo
INSERT INTO providers (user_id, slug, display_name, bio, category, city, address, whatsapp, status, is_verified, is_featured, rating, review_count, price_min, age, cover_photo, photos)
SELECT p.id, 'valentina-reyes', 'Valentina Reyes',
  'Terapeuta certificada con más de 5 años de experiencia en masajes relajantes y descontracturantes.',
  'masajes', 'Santiago', 'Las Condes', '56912345678', 'approved', true, true, 4.9, 3, 45000, 28,
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800',
  ARRAY['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800','https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800']
FROM profiles p WHERE p.email = 'valentina@mipage.cl'
ON CONFLICT (user_id) DO UPDATE SET
  slug = EXCLUDED.slug, display_name = EXCLUDED.display_name, bio = EXCLUDED.bio,
  category = EXCLUDED.category, city = EXCLUDED.city, address = EXCLUDED.address,
  whatsapp = EXCLUDED.whatsapp, status = EXCLUDED.status, is_verified = EXCLUDED.is_verified,
  is_featured = EXCLUDED.is_featured, rating = EXCLUDED.rating, review_count = EXCLUDED.review_count,
  price_min = EXCLUDED.price_min, age = EXCLUDED.age, cover_photo = EXCLUDED.cover_photo, photos = EXCLUDED.photos;

INSERT INTO providers (user_id, slug, display_name, bio, category, city, address, whatsapp, status, is_verified, is_featured, rating, review_count, price_min, age, cover_photo, photos)
SELECT p.id, 'camila-silva', 'Camila Silva',
  'Modelo profesional con experiencia en campañas y sesiones editoriales.',
  'modelaje', 'Santiago', 'Providencia', '56923456789', 'approved', true, true, 4.8, 2, 80000, 24,
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800',
  ARRAY['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800']
FROM profiles p WHERE p.email = 'camila@mipage.cl'
ON CONFLICT (user_id) DO UPDATE SET
  slug = EXCLUDED.slug, display_name = EXCLUDED.display_name, bio = EXCLUDED.bio,
  category = EXCLUDED.category, city = EXCLUDED.city, address = EXCLUDED.address,
  whatsapp = EXCLUDED.whatsapp, status = EXCLUDED.status, is_verified = EXCLUDED.is_verified,
  is_featured = EXCLUDED.is_featured, rating = EXCLUDED.rating, review_count = EXCLUDED.review_count,
  price_min = EXCLUDED.price_min, age = EXCLUDED.age, cover_photo = EXCLUDED.cover_photo, photos = EXCLUDED.photos;

INSERT INTO providers (user_id, slug, display_name, bio, category, city, whatsapp, status, is_verified, is_featured, rating, review_count, price_min, age, cover_photo)
SELECT p.id, 'sofia-martinez', 'Sofía Martínez',
  'Especialista en masajes terapéuticos en la costa.',
  'masajes', 'Viña del Mar', '56934567890', 'approved', false, false, 4.7, 1, 40000, 31,
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800'
FROM profiles p WHERE p.email = 'sofia@mipage.cl'
ON CONFLICT (user_id) DO UPDATE SET
  slug = EXCLUDED.slug, display_name = EXCLUDED.display_name, bio = EXCLUDED.bio,
  category = EXCLUDED.category, city = EXCLUDED.city, whatsapp = EXCLUDED.whatsapp,
  status = EXCLUDED.status, is_verified = EXCLUDED.is_verified, is_featured = EXCLUDED.is_featured,
  rating = EXCLUDED.rating, review_count = EXCLUDED.review_count, price_min = EXCLUDED.price_min,
  age = EXCLUDED.age, cover_photo = EXCLUDED.cover_photo;

INSERT INTO providers (user_id, slug, display_name, bio, category, city, address, whatsapp, status, is_verified, is_featured, rating, review_count, price_min, age, cover_photo)
SELECT p.id, 'isabella-rojas', 'Isabella Rojas',
  'Modelo de moda y publicidad con portafolio internacional.',
  'modelaje', 'Santiago', 'Ñuñoa', '56945678901', 'approved', true, false, 4.9, 2, 75000, 26,
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800'
FROM profiles p WHERE p.email = 'isabella@mipage.cl'
ON CONFLICT (user_id) DO UPDATE SET
  slug = EXCLUDED.slug, display_name = EXCLUDED.display_name, bio = EXCLUDED.bio,
  category = EXCLUDED.category, city = EXCLUDED.city, address = EXCLUDED.address,
  whatsapp = EXCLUDED.whatsapp, status = EXCLUDED.status, is_verified = EXCLUDED.is_verified,
  is_featured = EXCLUDED.is_featured, rating = EXCLUDED.rating, review_count = EXCLUDED.review_count,
  price_min = EXCLUDED.price_min, age = EXCLUDED.age, cover_photo = EXCLUDED.cover_photo;

-- Services (Valentina)
INSERT INTO services (provider_id, name, description, price, duration, sort_order)
SELECT pr.id, 'Masaje Relajante', 'Masaje corporal completo con aceites esenciales.', 45000, '60 min', 0
FROM providers pr WHERE pr.slug = 'valentina-reyes'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.provider_id = pr.id AND s.name = 'Masaje Relajante');

INSERT INTO services (provider_id, name, description, price, duration, sort_order)
SELECT pr.id, 'Masaje Descontracturante', 'Enfocado en zonas de tensión muscular.', 55000, '60 min', 1
FROM providers pr WHERE pr.slug = 'valentina-reyes'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.provider_id = pr.id AND s.name = 'Masaje Descontracturante');

INSERT INTO services (provider_id, name, description, price, duration, sort_order)
SELECT pr.id, 'Masaje Piedras Calientes', 'Experiencia premium con piedras volcánicas.', 70000, '90 min', 2
FROM providers pr WHERE pr.slug = 'valentina-reyes'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.provider_id = pr.id AND s.name = 'Masaje Piedras Calientes');

-- Gallery entries
INSERT INTO gallery (provider_id, type, url, is_cover, sort_order)
SELECT pr.id, 'image', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800', true, 0
FROM providers pr WHERE pr.slug = 'valentina-reyes'
AND NOT EXISTS (SELECT 1 FROM gallery g WHERE g.provider_id = pr.id AND g.url LIKE '%1544005313%');

INSERT INTO gallery (provider_id, type, url, is_cover, sort_order)
SELECT pr.id, 'image', 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800', false, 1
FROM providers pr WHERE pr.slug = 'valentina-reyes'
AND NOT EXISTS (SELECT 1 FROM gallery g WHERE g.provider_id = pr.id AND g.url LIKE '%1519823551278%');

-- Sample reviews (requires cliente@mipage.cl)
INSERT INTO reviews (provider_id, user_id, rating, comment)
SELECT pr.id, u.id, 5, 'Excelente profesional, muy recomendada. El mejor masaje que he tenido.'
FROM providers pr, profiles u
WHERE pr.slug = 'valentina-reyes' AND u.email = 'cliente@mipage.cl'
ON CONFLICT (provider_id, user_id) DO NOTHING;

INSERT INTO reviews (provider_id, user_id, rating, comment, provider_response, response_date)
SELECT pr.id, u.id, 5, 'Muy buen servicio y ambiente profesional.', '¡Gracias por tu visita!', NOW()
FROM providers pr, profiles u
WHERE pr.slug = 'camila-silva' AND u.email = 'cliente@mipage.cl'
ON CONFLICT (provider_id, user_id) DO NOTHING;

-- Update stats on home (admin editable)
UPDATE site_settings SET value = '{"professionals":"4","reviews":"5","rating":"4.8","cities":"3"}'::jsonb
WHERE key = 'stats';