require("dotenv").config();

const { assertEnv, isProduction, port } = require("./config/env");
const app = require("./app");
const sequelize = require("./config/database");
require("./models");

const startServer = async () => {
  try {
    assertEnv();

    await sequelize.authenticate();

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
