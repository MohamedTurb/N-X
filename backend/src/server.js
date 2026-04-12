require("dotenv").config();
const app = require("./app");
const sequelize = require("./config/database");
require("./models");

const PORT = Number(process.env.PORT || 5000);

const ensureSchemaCompatibility = async () => {
  // Existing databases may still have imageUrl as VARCHAR(255).
  try {
    await sequelize.query('ALTER TABLE products ALTER COLUMN "imageUrl" TYPE TEXT;');
  } catch (error) {
    if (error?.original?.code !== "42P01") {
      throw error;
    }
  }

  await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "customerName" VARCHAR(255);');
  await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "customerEmail" VARCHAR(255);');
  await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "customerPhone" VARCHAR(255);');
  await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "shippingAddress" TEXT;');
  await sequelize.query("ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS \"color\" VARCHAR(255) DEFAULT 'Black';");
  await sequelize.query("ALTER TABLE order_items ADD COLUMN IF NOT EXISTS \"color\" VARCHAR(255) DEFAULT 'Black';");
};

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await ensureSchemaCompatibility();
    await sequelize.sync({ alter: false });
    app.listen(PORT, () => {
      console.log(`NOX API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
