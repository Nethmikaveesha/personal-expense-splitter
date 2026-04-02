const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { JWT_SECRET } = require("../middleware/authMiddleware");

const ADMIN_ID = "00000000-0000-4000-a000-000000000001";
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || "admin").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

function adminUser() {
  return {
    id: ADMIN_ID,
    email: "admin@expensemate.local",
    name: "Administrator",
    role: "admin",
    isFake: false,
  };
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }
    if (req.body.role != null) {
      return res.status(400).json({ message: "Registration is only for customer accounts." });
    }
    const emailNorm = email.trim().toLowerCase();
    const local = emailNorm.includes("@") ? emailNorm.split("@")[0] : emailNorm;
    if (local === ADMIN_USERNAME) {
      return res.status(400).json({ message: "This email is reserved." });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, 'user')
       RETURNING id, email, name, role`,
      [emailNorm, hash, name.trim()],
    );
    const row = result.rows[0];
    const user = {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      isFake: false,
    };
    const token = signToken({ sub: user.id, role: user.role });
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ message: "Email already registered." });
    }
    console.error(err);
    res.status(500).json({ message: "Registration failed." });
  }
}

async function login(req, res) {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: "Email or username and password are required." });
    }
    const idRaw = identifier.trim();
    if (idRaw.toLowerCase() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const user = adminUser();
      const token = signToken({ sub: ADMIN_ID, role: "admin" });
      return res.json({ token, user });
    }

    const emailNorm = idRaw.toLowerCase();
    const result = await pool.query(
      `SELECT id, email, name, password_hash, role, COALESCE(is_fake, false) AS is_fake
       FROM users WHERE email = $1`,
      [emailNorm],
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const row = result.rows[0];
    if (row.role === "admin") {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const user = {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role || "user",
      isFake: row.is_fake,
    };
    const token = signToken({ sub: user.id, role: user.role });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed." });
  }
}

async function me(req, res) {
  try {
    const userId = req.user.sub;
    const role = req.user.role;
    if (role === "admin" && userId === ADMIN_ID) {
      return res.json(adminUser());
    }
    const result = await pool.query(
      `SELECT id, email, name, role, COALESCE(is_fake, false) AS is_fake FROM users WHERE id = $1`,
      [userId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    const row = result.rows[0];
    res.json({
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      isFake: row.is_fake,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load user." });
  }
}

module.exports = { register, login, me, ADMIN_ID };
