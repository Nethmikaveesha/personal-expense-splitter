require("dotenv").config();
const { Pool } = require("pg");

const poolConfig = {
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || process.env.DB_NAME || "expense_splitter",
  password: process.env.PGPASSWORD ?? process.env.DB_PASSWORD,
  port: Number(process.env.PGPORT || 5432),
};

// Log once so you can match SQL Shell to the same DB (common mistake: psql on "postgres", app on "expense_splitter").
console.log(
  `[db] Using PostgreSQL database "${poolConfig.database}" on ${poolConfig.host}:${poolConfig.port} (user: ${poolConfig.user})`,
);

const pool = new Pool(poolConfig);

module.exports = pool;