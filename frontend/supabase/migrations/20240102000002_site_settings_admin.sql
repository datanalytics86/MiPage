-- Site settings (CMS) + admin policies for profiles

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage site settings"
  ON site_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Default settings
INSERT INTO site_settings (key, value) VALUES
  ('general', '{"siteName":"MiPage","siteDescription":"Marketplace de servicios profesionales en Chile","timezone":"America/Santiago","currency":"CLP","maintenanceMode":false}'::jsonb),
  ('email', '{"supportEmail":"soporte@mipage.cl","adminEmail":"contacto@mipage.cl"}'::jsonb),
  ('security', '{"requireEmailVerification":true,"requireIdVerification":true,"allowProviderRegistration":true}'::jsonb),
  ('payments', '{"commissionRate":15,"minWithdrawal":50000}'::jsonb),
  ('stats', '{"professionals":"500+","reviews":"10.000+","rating":"4.8","cities":"15+"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Admin can update any profile (roles, etc.)
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Admin can view all providers (including pending)
CREATE POLICY "Admins can view all providers"
  ON providers FOR SELECT
  USING (
    status = 'approved'
    OR auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Drop old restrictive select if exists (optional - may need manual run)
-- DROP POLICY IF EXISTS "Approved providers are viewable by everyone" ON providers;