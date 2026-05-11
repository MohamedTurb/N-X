const { Sequelize } = require("sequelize");
const { isProduction } = require("./env");

const databaseUrl = process.env.DATABASE_URL;

const poolMax = Number(process.env.DB_POOL_MAX || 10);
const poolMin = Number(process.env.DB_POOL_MIN || 0);
const poolAcquire = Number(process.env.DB_POOL_ACQUIRE || 30000);
const poolIdle = Number(process.env.DB_POOL_IDLE || 10000);

let sequelize;

if (databaseUrl) {
  // Production / Render mode
  sequelize = new Sequelize(databaseUrl, {
    dialect: "postgres",
    logging: isProduction ? false : console.log,
    pool: {
      max: poolMax,
      min: poolMin,
      acquire: poolAcquire,
      idle: poolIdle,
    },
    dialectOptions: {
      ssl: isProduction
        ? {
            require: true,
            rejectUnauthorized: false,
          }
        : false,
    },
  });
} else {
  // Local development fallback
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      dialect: "postgres",
      logging: isProduction ? false : console.log,
      pool: {
        max: poolMax,
        min: poolMin,
        acquire: poolAcquire,
        idle: poolIdle,
      },
      dialectOptions: {
        ssl: false,
      },
    }
  );
}

module.exports = sequelize;