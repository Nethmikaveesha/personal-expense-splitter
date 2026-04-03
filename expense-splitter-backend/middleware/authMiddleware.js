const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "expensemate-dev-secret";

function requireAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authenticated." });
  }
  try {
    const token = h.slice(7);
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only." });
  }
  next();
}

module.exports = { requireAuth, requireAdmin, JWT_SECRET };
