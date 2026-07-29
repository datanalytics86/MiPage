-- =============================================
-- 006: Moderación, metadata dinámica, notificaciones
-- Ejecutar en Supabase SQL Editor después de 001-005
-- =============================================

-- Rejection + moderation fields on providers
ALTER TABLE providers
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN providers.metadata IS 'Dynamic field values keyed by metadata_fields.key';
COMMENT ON COLUMN providers.rejection_reason IS 'Admin reason when status=rejected';

-- Metadata field definitions (admin-managed)
CREATE TABLE IF NOT EXISTS metadata_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN (
    'text','textarea','number','select','multiselect','checkbox','url','phone'
  )),
  category TEXT NOT NULL DEFAULT 'otros' CHECK (category IN (
    'personal','fisica','servicio','contacto','otros'
  )),
  options JSONB DEFAULT '[]'::jsonb,
  is_required BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  applies_to TEXT[] DEFAULT ARRAY['*']::TEXT[],
  help_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metadata_fields_active ON metadata_fields(is_active, sort_order);

ALTER TABLE metadata_fields ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active metadata fields" ON metadata_fields;
CREATE POLICY "Anyone can read active metadata fields"
  ON metadata_fields FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

DROP POLICY IF EXISTS "Admins manage metadata fields" ON metadata_fields;
CREATE POLICY "Admins manage metadata fields"
  ON metadata_fields FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Seed default fields (idempotent by key)
INSERT INTO metadata_fields (key, label, field_type, category, options, is_required, sort_order, applies_to)
VALUES
  ('eye_color', 'Color de ojos', 'select', 'fisica', '["Café","Verde","Azul","Negro","Otro"]'::jsonb, false, 1, ARRAY['modelaje']),
  ('hair_color', 'Color de cabello', 'select', 'fisica', '["Negro","Castaño","Rubio","Rojo","Otro"]'::jsonb, false, 2, ARRAY['modelaje']),
  ('years_experience', 'Años de experiencia', 'number', 'servicio', '[]'::jsonb, true, 3, ARRAY['*']),
  ('certifications', 'Certificaciones', 'textarea', 'servicio', '[]'::jsonb, false, 4, ARRAY['masajes'])
ON CONFLICT (key) DO NOTHING;

-- Simple notification log (for admin/ops; emails also go via Resend)
CREATE TABLE IF NOT EXISTS notification_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  email TEXT,
  template TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued','sent','skipped','failed')),
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read notification log" ON notification_log;
CREATE POLICY "Admins read notification log"
  ON notification_log FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Consent tracking for Chile privacy (Ley 19.628)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS privacy_consent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS privacy_consent_version TEXT;

-- Soft delete / data deletion request
CREATE TABLE IF NOT EXISTS data_deletion_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own deletion requests" ON data_deletion_requests;
CREATE POLICY "Users manage own deletion requests"
  ON data_deletion_requests FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage deletion requests" ON data_deletion_requests;
CREATE POLICY "Admins manage deletion requests"
  ON data_deletion_requests FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
