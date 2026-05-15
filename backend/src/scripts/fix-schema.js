const sequelize = require("../config/database");

async function run() {
  try {
    console.log("Starting schema fixes...");

    // Add product variants JSONB and featured flag if missing
    await sequelize.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;`);
    await sequelize.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS "featured" BOOLEAN DEFAULT false;`);

    // Create shipmentStatus enum type if not exists, then add column
    await sequelize.query(`DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_orders_shipmentstatus') THEN
        CREATE TYPE enum_orders_shipmentstatus AS ENUM ('pending','packed','shipped','delivered');
      END IF;
    END
    $$;`);

    await sequelize.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS "shipmentStatus" enum_orders_shipmentstatus NOT NULL DEFAULT 'pending';`);
    await sequelize.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS "trackingNumber" VARCHAR;`);
    await sequelize.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS "canceledAt" TIMESTAMP WITH TIME ZONE;`);
    await sequelize.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS "refundedAt" TIMESTAMP WITH TIME ZONE;`);

    // Add new color enum value 'Roze' to cart_items and order_items enum types if they exist
    await sequelize.query(`DO $$
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
    $$;`);

    await sequelize.query(`DO $$
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
    $$;`);

    console.log("Schema fixes applied (or skipped if already present).");
    process.exit(0);
  } catch (err) {
    console.error("Error applying schema fixes:", err);
    process.exit(1);
  }
}

if (require.main === module) {
  run();
}

module.exports = { run };
