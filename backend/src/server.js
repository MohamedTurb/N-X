require("dotenv").config();

const { assertEnv, isProduction, port } = require("./config/env");
const app = require("./app");
const sequelize = require("./config/database");
require("./models");

const startServer = async () => {
  try {
    assertEnv();

    // Try to authenticate to the database with a small retry/backoff loop.
    const maxAttempts = Number(process.env.DB_CONN_RETRIES || 5);
    const retryDelayMs = Number(process.env.DB_CONN_RETRY_DELAY_MS || 5000);

    let attempt = 0;
    while (true) {
      try {
        attempt += 1;
        await sequelize.authenticate();
        break;
      } catch (err) {
        console.error(`Database connection attempt ${attempt} failed:`, err && err.message ? err.message : err);
        if (attempt >= maxAttempts) {
          throw err;
        }
        console.log(`Retrying DB connection in ${retryDelayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }

    if (!isProduction) {
      await sequelize.sync({ alter: false });
    }

    app.listen(port, () => {
      console.log(`NOX API listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
