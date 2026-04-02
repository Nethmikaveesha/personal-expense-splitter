const pool = require("../config/db");

function isAdminJwt(req) {
  return req.user.role === "admin";
}

async function loadExpenseWithSplits(expenseId) {
  const e = await pool.query(
    `SELECT e.*, payer.name AS paid_by_name, payer.email AS paid_by_email
     FROM expenses e
     JOIN users payer ON payer.id = e.paid_by_user_id
     WHERE e.id = $1`,
    [expenseId],
  );
  if (e.rows.length === 0) return null;
  const row = e.rows[0];
  const splits = await pool.query(
    `SELECT es.user_id, es.share, u.name, u.email
     FROM expense_splits es
     JOIN users u ON u.id = es.user_id
     WHERE es.expense_id = $1`,
    [expenseId],
  );
  return mapExpense(row, splits.rows);
}

function mapExpense(row, splitRows) {
  return {
    id: row.id,
    description: row.description,
    amount: parseFloat(row.amount),
    paidByUserId: row.paid_by_user_id,
    paidByName: row.paid_by_name,
    paidByEmail: row.paid_by_email,
    createdAt:
      row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    splits: splitRows.map((s) => ({
      userId: s.user_id,
      userName: s.name,
      email: s.email,
      share: parseFloat(s.share),
    })),
  };
}

async function createExpense(req, res) {
  try {
    if (isAdminJwt(req)) {
      return res.status(403).json({ message: "Admin cannot create customer expenses." });
    }
    const userId = req.user.sub;
    const { description, amount, paidByEmail, participantEmails } = req.body;
    if (!description || amount == null || !paidByEmail || !Array.isArray(participantEmails)) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    const n = Number(amount);
    if (Number.isNaN(n) || n <= 0) {
      return res.status(400).json({ message: "Invalid amount." });
    }

    const payerEmail = String(paidByEmail).trim().toLowerCase();
    const raw = participantEmails.map((e) => String(e).trim().toLowerCase()).filter(Boolean);
    const emails = [...new Set([...raw, payerEmail])];
    if (emails.length === 0) {
      return res.status(400).json({ message: "Add at least one participant email." });
    }

    const allEmails = emails;

    const usersRes = await pool.query(
      `SELECT id, email, name FROM users WHERE email = ANY($1::text[])`,
      [allEmails],
    );
    const byEmail = new Map(usersRes.rows.map((r) => [r.email.toLowerCase(), r]));
    const missing = allEmails.filter((em) => !byEmail.has(em));
    if (missing.length > 0) {
      return res.status(400).json({
        message: `Unknown emails (users must register first): ${missing.join(", ")}`,
      });
    }

    const payer = byEmail.get(payerEmail);
    if (!payer) {
      return res.status(400).json({ message: "Payer email not found." });
    }

    const participants = emails.map((em) => byEmail.get(em)).filter(Boolean);
    if (participants.length !== emails.length) {
      return res.status(400).json({ message: "Invalid participant list." });
    }

    const count = participants.length;
    const cents = Math.round(n * 100);
    const base = Math.floor(cents / count);
    let remainder = cents - base * count;
    const shares = participants.map(() => {
      const c = base + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder -= 1;
      return c / 100;
    });

    let expenseId;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const ins = await client.query(
        `INSERT INTO expenses (description, amount, paid_by_user_id)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [String(description).trim(), n, payer.id],
      );
      expenseId = ins.rows[0].id;
      for (let i = 0; i < participants.length; i++) {
        await client.query(
          `INSERT INTO expense_splits (expense_id, user_id, share) VALUES ($1, $2, $3)`,
          [expenseId, participants[i].id, shares[i]],
        );
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    const full = await loadExpenseWithSplits(expenseId);
    res.status(201).json(full);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not create expense." });
  }
}

async function listMyExpenses(req, res) {
  try {
    if (isAdminJwt(req)) {
      return res.json([]);
    }
    const userId = req.user.sub;
    const ex = await pool.query(
      `SELECT e.*, payer.name AS paid_by_name, payer.email AS paid_by_email
       FROM expenses e
       JOIN users payer ON payer.id = e.paid_by_user_id
       WHERE e.paid_by_user_id = $1
          OR EXISTS (
            SELECT 1 FROM expense_splits es
            WHERE es.expense_id = e.id AND es.user_id = $1
          )
       ORDER BY e.created_at DESC`,
      [userId],
    );
    const out = [];
    for (const row of ex.rows) {
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

async function getBalance(req, res) {
  try {
    if (isAdminJwt(req)) {
      return res.json({ entries: [], yourTotalBalance: 0 });
    }
    const me = req.user.sub;
    const ex = await pool.query(
      `SELECT e.id, e.amount, e.paid_by_user_id
       FROM expenses e
       WHERE e.paid_by_user_id = $1
          OR EXISTS (
            SELECT 1 FROM expense_splits es
            WHERE es.expense_id = e.id AND es.user_id = $1
          )`,
      [me],
    );

    const netByUser = new Map();

    for (const exp of ex.rows) {
      const splits = await pool.query(
        `SELECT user_id, share FROM expense_splits WHERE expense_id = $1`,
        [exp.id],
      );
      const P = exp.paid_by_user_id;
      const splitList = splits.rows.map((s) => ({
        userId: s.user_id,
        share: parseFloat(s.share),
      }));

      if (P === me) {
        for (const s of splitList) {
          if (s.userId !== me) {
            netByUser.set(s.userId, (netByUser.get(s.userId) || 0) + s.share);
          }
        }
      } else {
        const mine = splitList.find((s) => s.userId === me);
        if (mine) {
          netByUser.set(P, (netByUser.get(P) || 0) - mine.share);
        }
      }
    }

    const ids = [...netByUser.keys()].filter((id) => netByUser.get(id) !== 0);
    if (ids.length === 0) {
      return res.json({ entries: [], yourTotalBalance: 0 });
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
    const yourTotalBalance =
      Math.round(entries.reduce((s, e) => s + e.netBalance, 0) * 100) / 100;

    res.json({ entries, yourTotalBalance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not compute balance." });
  }
}

module.exports = { createExpense, listMyExpenses, getBalance, mapExpense };
