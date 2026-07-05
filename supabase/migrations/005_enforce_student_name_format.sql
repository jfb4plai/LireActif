-- ============================================================
-- LireActif — Migration 005
-- Force le format "Prénom I." au niveau base (pas seulement le formulaire),
-- pour qu'aucun accès direct à l'API ne puisse enregistrer un nom complet.
-- Projet partagé dfoaumjleqtxjeaplnna
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

-- Étape 1 (à lancer d'abord) : vérifier qu'aucune ligne existante ne violerait la contrainte.
-- Si cette requête retourne des lignes, corriger ces profils avant d'ajouter la contrainte.
--
-- SELECT id, display_name FROM lire_student_profiles
-- WHERE display_name !~ '^[A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ''-]*(-[A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ''-]*)*\s[A-ZÀ-ÖØ-Þ]\.$';

-- Étape 2 : ajouter la contrainte une fois les données existantes conformes.
ALTER TABLE lire_student_profiles
  ADD CONSTRAINT lire_student_display_name_format
  CHECK (display_name ~ '^[A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ''-]*(-[A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ''-]*)*\s[A-ZÀ-ÖØ-Þ]\.$');
