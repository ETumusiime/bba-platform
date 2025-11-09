-- Add optional WhatsApp phone for students
ALTER TABLE children
  ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT;

-- (If not already enabled)
CREATE EXTENSION IF NOT EXISTS citext;
