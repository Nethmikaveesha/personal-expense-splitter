const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "expense_splitter",
  password: "Kaveesha2001*",
  port: 5432,
});

module.exports = pool;