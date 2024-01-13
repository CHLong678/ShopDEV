const dev = {
  app: {
    port: process.env.DEV_APP_PORT || 3052,
  },
  db: {
    host: process.env.DEV_DB_HOST || "localhost",
    port: process.env.DEV_DB_PORT || 27017,
    name: process.env.DEV_DB_NAME || "ShopDEV",
  },
};

const prod = {
  app: {
    port: process.env.PROD_APP_PORT || 3000,
  },
  db: {
    host: process.env.PROD_DB_HOST || "local",
    port: process.env.PROD_DB_PORT || 27017,
    name: process.env.PROD_DB_NAME || "ShopCHL",
  },
};

const config = { dev, prod };
const env = process.env.NODE_ENV || "dev";

// console.log(config[env], env);
module.exports = config[env];
