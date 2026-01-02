-- Migration: Ajouter les champs de paiement à la table bookings
-- À exécuter dans Supabase SQL Editor

-- Ajouter les colonnes pour gérer les paiements Stripe
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_captured_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS scheduled_date DATE,
ADD COLUMN IF NOT EXISTS scheduled_time TIME;

-- Index pour les requêtes de capture automatique
CREATE INDEX IF NOT EXISTS idx_bookings_payment_capture 
ON bookings (payment_status, scheduled_date) 
WHERE payment_intent_id IS NOT NULL;

-- Commentaires
COMMENT ON COLUMN bookings.payment_intent_id IS 'Stripe PaymentIntent ID pour la pré-autorisation';
COMMENT ON COLUMN bookings.payment_status IS 'pending | authorized | captured | cancelled | refunded | expired';
COMMENT ON COLUMN bookings.payment_captured_at IS 'Date de capture du paiement';

-- Valeurs possibles pour payment_status:
-- pending: En attente de paiement
-- authorized: Pré-autorisé (montant bloqué sur la carte)
-- captured: Débité (après l'intervention)
-- cancelled: Annulé avant capture
-- refunded: Remboursé après capture
-- expired: Pré-autorisation expirée (7 jours)
