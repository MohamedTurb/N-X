-- Migration: 2026-05-fix-schema.sql
-- Purpose: Add missing columns and enum values required by the admin UI.
-- WARNING: Run this against a backup or in a maintenance window for production.

-- Add product variants and featured flag
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Create shipmentStatus enum type for orders if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_orders_shipmentstatus') THEN
    CREATE TYPE enum_orders_shipmentstatus AS ENUM ('pending','packed','shipped','delivered');
  END IF;
END
$$;

-- Add shipment related columns to orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS "shipmentStatus" enum_orders_shipmentstatus NOT NULL DEFAULT 'pending';
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS "trackingNumber" VARCHAR;
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS "canceledAt" TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS "refundedAt" TIMESTAMP WITH TIME ZONE;

-- Add 'Roze' value to color enums for cart_items and order_items if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_cart_items_color') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'enum_cart_items_color' AND e.enumlabel = 'Roze'
    ) THEN
      ALTER TYPE enum_cart_items_color ADD VALUE 'Roze';
    END IF;
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_order_items_color') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'enum_order_items_color' AND e.enumlabel = 'Roze'
    ) THEN
      ALTER TYPE enum_order_items_color ADD VALUE 'Roze';
    END IF;
  END IF;
END
$$;

-- End of migration
