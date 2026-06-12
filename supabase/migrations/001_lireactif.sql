-- ============================================================
-- LireActif — Migration 001
-- Projet partagé dfoaumjleqtxjeaplnna
-- NE PAS recréer la table profiles ni le trigger updated_at
-- ============================================================

-- Schools
CREATE TABLE IF NOT EXISTS schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL
);

-- Teacher → school mapping
CREATE TABLE IF NOT EXISTS teacher_schools (
  teacher_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id  uuid REFERENCES schools(id) ON DELETE CASCADE,
  PRIMARY KEY (teacher_id, school_id)
);

-- Student profiles (prénom + initiale uniquement)
CREATE TABLE IF NOT EXISTS student_profiles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id    uuid REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  display_name text NOT NULL,
  owner_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at   timestamptz DEFAULT now()
);

-- RSVP settings per student
CREATE TABLE IF NOT EXISTS rsvp_settings (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        uuid REFERENCES student_profiles(id) ON DELETE CASCADE NOT NULL,
  wpm               int DEFAULT 180 CHECK (wpm BETWEEN 100 AND 400),
  font_size         int DEFAULT 36  CHECK (font_size BETWEEN 24 AND 72),
  chunk_size        int DEFAULT 1   CHECK (chunk_size IN (1, 2, 3)),
  pause_punctuation boolean DEFAULT true,
  background        text DEFAULT 'white' CHECK (background IN ('white', 'yellow')),
  owner_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  UNIQUE (student_id)
);

-- Predict settings per student
CREATE TABLE IF NOT EXISTS predict_settings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   uuid REFERENCES student_profiles(id) ON DELETE CASCADE NOT NULL,
  domain_vocab text[] DEFAULT '{}',
  context_note text DEFAULT '' CHECK (char_length(context_note) <= 300),
  lang         text DEFAULT 'fr' CHECK (lang IN ('fr', 'nl')),
  owner_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  UNIQUE (student_id)
);

-- Student access tokens
CREATE TABLE IF NOT EXISTS student_tokens (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES student_profiles(id) ON DELETE CASCADE NOT NULL,
  token      text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE schools          ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_schools  ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp_settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE predict_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_tokens   ENABLE ROW LEVEL SECURITY;

-- schools : lecture authentifiée
CREATE POLICY "schools_auth_read" ON schools
  FOR SELECT TO authenticated USING (true);

-- teacher_schools : own rows only
CREATE POLICY "ts_read_own"   ON teacher_schools FOR SELECT TO authenticated USING (teacher_id = auth.uid());
CREATE POLICY "ts_insert_own" ON teacher_schools FOR INSERT TO authenticated WITH CHECK (teacher_id = auth.uid());

-- student_profiles : read if same school, write if owner
CREATE POLICY "sp_school_read" ON student_profiles FOR SELECT TO authenticated
  USING (school_id IN (SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid()));
CREATE POLICY "sp_owner_insert" ON student_profiles FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "sp_owner_update" ON student_profiles FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());
CREATE POLICY "sp_owner_delete" ON student_profiles FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- rsvp_settings : read if same school, write if owner
CREATE POLICY "rsvp_school_read" ON rsvp_settings FOR SELECT TO authenticated
  USING (student_id IN (
    SELECT id FROM student_profiles
    WHERE school_id IN (SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid())
  ));
CREATE POLICY "rsvp_owner_insert" ON rsvp_settings FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "rsvp_owner_update" ON rsvp_settings FOR UPDATE TO authenticated USING (owner_id = auth.uid());

-- predict_settings : same
CREATE POLICY "pred_school_read" ON predict_settings FOR SELECT TO authenticated
  USING (student_id IN (
    SELECT id FROM student_profiles
    WHERE school_id IN (SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid())
  ));
CREATE POLICY "pred_owner_insert" ON predict_settings FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "pred_owner_update" ON predict_settings FOR UPDATE TO authenticated USING (owner_id = auth.uid());

-- student_tokens : teacher reads/creates own tokens
CREATE POLICY "tok_owner_read"   ON student_tokens FOR SELECT TO authenticated USING (created_by = auth.uid());
CREATE POLICY "tok_owner_insert" ON student_tokens FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "tok_owner_delete" ON student_tokens FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Accès ANON pour les élèves (pas de compte) — lecture par token valide uniquement
CREATE POLICY "tok_anon_read_valid" ON student_tokens FOR SELECT TO anon
  USING (expires_at > now());
CREATE POLICY "rsvp_anon_read" ON rsvp_settings FOR SELECT TO anon
  USING (student_id IN (SELECT student_id FROM student_tokens WHERE expires_at > now()));
CREATE POLICY "pred_anon_read" ON predict_settings FOR SELECT TO anon
  USING (student_id IN (SELECT student_id FROM student_tokens WHERE expires_at > now()));
CREATE POLICY "sp_anon_read" ON student_profiles FOR SELECT TO anon
  USING (id IN (SELECT student_id FROM student_tokens WHERE expires_at > now()));
