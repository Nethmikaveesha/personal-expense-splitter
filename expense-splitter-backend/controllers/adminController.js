const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const { ADMIN_ID } = require("./authController");

const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || "admin").toLowerCase();

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

async function createFakeUser(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }
    const emailNorm = String(email).trim().toLowerCase();
    const local = emailNorm.includes("@") ? emailNorm.split("@")[0] : emailNorm;
    if (local === ADMIN_USERNAME) {
      return res.status(400).json({ message: "This email is reserved." });
    }
    if (emailNorm === "admin@expensemate.local") {
      return res.status(400).json({ message: "This email is reserved." });
    }

    const hash = await bcrypt.hash(String(password), 10);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, is_fake)
       VALUES ($1, $2, $3, 'user', true)
       RETURNING id, email, name, role`,
      [emailNorm, hash, String(name).trim()],
    );
    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      isFake: true,
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ message: "Email already registered." });
    }
    console.error(err);
    res.status(500).json({ message: "Could not create fake user." });
  }
}

async function deleteFakeUser(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "User id is required." });
  }
  if (id === ADMIN_ID) {
    return res.status(400).json({ message: "Cannot delete this user." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const fakeCheck = await client.query(
      `SELECT 1 FROM users WHERE id = $1 AND is_fake = true`,
      [id],
    );
    if (fakeCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "User not found or not a fake user." });
    }

    // Expenses they paid for (splits for those rows are removed via ON DELETE CASCADE on expense_splits.expense_id).
    await client.query(`DELETE FROM expenses WHERE paid_by_user_id = $1`, [id]);

    // Participation in others’ expenses (RESTRICT on expense_splits.user_id blocks a plain user DELETE).
    await client.query(`DELETE FROM expense_splits WHERE user_id = $1`, [id]);

    const del = await client.query(
      `DELETE FROM users WHERE id = $1 AND is_fake = true RETURNING id`,
      [id],
    );
    if (del.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "User not found or not a fake user." });
    }

    await client.query("COMMIT");
    res.status(204).send();
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error(err);
    res.status(500).json({
      message:
        err.code === "23503"
          ? "Cannot delete user: related data could not be removed."
          : "Could not delete user.",
    });
  } finally {
    client.release();
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

async function listUserBalances(req, res) {
  try {
    // net = money they are owed - money they owe (same semantics as customer /api/balance)
    const netByUser = new Map(); // userId -> number

    const rows = await pool.query(
      `SELECT e.paid_by_user_id AS payer_id, es.user_id, es.share
       FROM expenses e
       JOIN expense_splits es ON es.expense_id = e.id`,
    );

    for (const row of rows.rows) {
      const payerId = row.payer_id;
      const userId = row.user_id;
      const share = parseFloat(row.share);

      netByUser.set(userId, (netByUser.get(userId) || 0) - share);
      netByUser.set(payerId, (netByUser.get(payerId) || 0) + share);
    }

    const ids = [...netByUser.keys()].filter((id) => (netByUser.get(id) || 0) !== 0);
    if (ids.length === 0) {
      return res.json([]);
    }

    const usersRes = await pool.query(
      `SELECT id, name, email FROM users WHERE id = ANY($1::uuid[])`,
      [ids],
    );

    const entries = usersRes.rows.map((u) => ({
      userId: u.id,
      name: u.name,
      email: u.email,
      netBalance: Math.round((netByUser.get(u.id) || 0) * 100) / 100,
    }));

    // keep response stable: non-zero first, sorted by absolute balance
    entries.sort((a, b) => Math.abs(b.netBalance) - Math.abs(a.netBalance));

    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load user balances." });
  }
}

async function deleteExpense(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Expense id is required." });
    }
    const r = await pool.query(`DELETE FROM expenses WHERE id = $1 RETURNING id`, [id]);
    if (r.rowCount === 0) {
      return res.status(404).json({ message: "Expense not found." });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not delete expense." });
  }
}

module.exports = {
  listUsers,
  listExpenses,
  createFakeUser,
  deleteFakeUser,
  stats,
  listUserBalances,
  deleteExpense,
};
