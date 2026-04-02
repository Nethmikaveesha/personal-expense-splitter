const pool = require("../config/db");
const { ADMIN_ID } = require("./authController");

async function listUsers(req, res) {
  try {
    const r = await pool.query(
      `SELECT id, email, name, role, COALESCE(is_fake, false) AS is_fake FROM users ORDER BY created_at DESC`,
    );
    res.json(
      r.rows.map((row) => ({
        id: row.id,
        email: row.email,
        name: row.name,
        role: row.role,
        isFake: row.is_fake,
      })),
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not list users." });
  }
}

async function listExpenses(req, res) {
  try {
    const ex = await pool.query(
      `SELECT e.*, payer.name AS paid_by_name, payer.email AS paid_by_email
       FROM expenses e
       JOIN users payer ON payer.id = e.paid_by_user_id
       ORDER BY e.created_at DESC`,
    );
    const { mapExpense } = require("./expenseController");
    const expenseRows = ex.rows;
    const out = [];
    for (const row of expenseRows) {
      const splits = await pool.query(
        `SELECT es.user_id, es.share, u.name, u.email
         FROM expense_splits es
         JOIN users u ON u.id = es.user_id
         WHERE es.expense_id = $1`,
        [row.id],
      );
      out.push(mapExpense(row, splits.rows));
    }
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not list expenses." });
  }
}

async function deleteFakeUser(req, res) {
  try {
    const { id } = req.params;
    if (id === ADMIN_ID) {
      return res.status(400).json({ message: "Cannot delete this user." });
    }
    const r = await pool.query(
      `DELETE FROM users WHERE id = $1 AND is_fake = true RETURNING id`,
      [id],
    );
    if (r.rowCount === 0) {
      return res.status(404).json({ message: "User not found or not a fake user." });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not delete user." });
  }
}

async function stats(req, res) {
  try {
    const users = await pool.query(`SELECT COUNT(*)::int AS c FROM users`);
    const expenses = await pool.query(`SELECT COUNT(*)::int AS c FROM expenses`);
    const sum = await pool.query(`SELECT COALESCE(SUM(amount), 0)::numeric AS s FROM expenses`);
    res.json({
      totalUsers: users.rows[0].c,
      totalExpenses: expenses.rows[0].c,
      totalAmountRecorded: parseFloat(sum.rows[0].s),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load stats." });
  }
}

module.exports = { listUsers, listExpenses, deleteFakeUser, stats };
