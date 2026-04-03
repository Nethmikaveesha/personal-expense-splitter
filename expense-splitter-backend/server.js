const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

/** Which DB the API uses + row counts (use this if psql shows 0 rows but the app has data). */
app.get("/api/health", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT current_database() AS database,
              (SELECT COUNT(*)::int FROM users) AS user_count,
              (SELECT COUNT(*)::int FROM expenses) AS expense_count`,
    );
    const row = rows[0];
    res.json({
      database: row.database,
      user_count: row.user_count,
      expense_count: row.expense_count,
      psql_hint: `Your SQL Shell must use the same database. At the psql prompt type:  \\c ${row.database}`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const balanceRoutes = require("./routes/balanceRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/balance", balanceRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
});

// start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});