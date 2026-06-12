-- LireActif — Migration 002
-- Ajout de show_context dans rsvp_settings
-- À exécuter dans Supabase > SQL Editor

ALTER TABLE rsvp_settings
  ADD COLUMN IF NOT EXISTS show_context boolean DEFAULT false;
