-- LireActif — Migration 003
-- Modèle strict RGPD : chaque enseignant ne voit que ses propres données
-- À exécuter dans Supabase > SQL Editor

-- student_profiles : remplacer la lecture par école par lecture owner uniquement
DROP POLICY IF EXISTS "sp_school_read" ON student_profiles;
CREATE POLICY "sp_owner_read" ON student_profiles
  FOR SELECT TO authenticated USING (owner_id = auth.uid());

-- rsvp_settings : idem
DROP POLICY IF EXISTS "rsvp_school_read" ON rsvp_settings;
CREATE POLICY "rsvp_owner_read" ON rsvp_settings
  FOR SELECT TO authenticated USING (owner_id = auth.uid());

-- predict_settings : idem
DROP POLICY IF EXISTS "pred_school_read" ON predict_settings;
CREATE POLICY "pred_owner_read" ON predict_settings
  FOR SELECT TO authenticated USING (owner_id = auth.uid());
