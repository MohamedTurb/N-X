require("dotenv").config();
const app = require("./app");
const sequelize = require("./config/database");
require("./models");

const PORT = Number(process.env.PORT || 5000);

const startServer = async () => {
  try {
    await sequelize.authenticate();
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
