-- ============================================================
-- LireActif — Migration : préfixage des tables avec lire_
-- Projet partagé dfoaumjleqtxjeaplnna
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

ALTER TABLE public.schools          RENAME TO lire_schools;
ALTER TABLE public.teacher_schools  RENAME TO lire_teacher_schools;
ALTER TABLE public.student_profiles RENAME TO lire_student_profiles;
ALTER TABLE public.rsvp_settings    RENAME TO lire_rsvp_settings;
ALTER TABLE public.predict_settings RENAME TO lire_predict_settings;
ALTER TABLE public.student_tokens   RENAME TO lire_student_tokens;
