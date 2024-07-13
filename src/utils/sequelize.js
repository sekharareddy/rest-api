const { Sequelize } = require("sequelize");
const config = require("config");
const appData = require("../../App_Data/config.json");

let sequelize;
if (process.env.API_ENV === "production") {
  const sqlConfig = {
    database: process.env.DB_NAME || appData.DB_NAME,
    host: process.env.DB_HOST || appData.DB_HOST,
    dialect: process.env.DB_DIALECT || appData.DB_DIALECT || "mssql",
    logging: false,
    pool: {
      max: config.sequelize_config.max,
      min: config.sequelize_config.min,
      acquire: config.sequelize_config.acquire,
      idle: config.sequelize_config.idle,
    },
    dialectOptions: {
      authentication: {
        type: "azure-active-directory-msi-app-service",
        options: {
          encrypt: true,
        },
      },
    },
  };
  sequelize = new Sequelize(sqlConfig);
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || appData.DB_NAME,
    process.env.DB_USER || appData.DB_USER,
    process.env.DB_PW || appData.DB_PW,
    {
      host: process.env.DB_HOST || appData.DB_HOST,
      port: process.env.DB_PORT || appData.DB_PORT,
      dialect: process.env.DB_DIALECT || appData.DB_DIALECT,
      pool: {
        max: config.sequelize_config.max,
        min: config.sequelize_config.min,
        acquire: config.sequelize_config.acquire,
        idle: config.sequelize_config.idle,
      },
      logging: false,
    },
  );
}

module.exports = sequelize;
