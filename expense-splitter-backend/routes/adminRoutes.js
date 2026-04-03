const express = require("express");
const router = express.Router();
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const admin = require("../controllers/adminController");

router.use(requireAuth, requireAdmin);

/** POST body: { name, email, password } — avoids confusion with /users/:id */
router.post("/fake-user", admin.createFakeUser);
router.get("/users", admin.listUsers);
router.get("/expenses", admin.listExpenses);
router.get("/balances", admin.listUserBalances);
router.get("/stats", admin.stats);
router.delete("/users/:id", admin.deleteFakeUser);
router.delete("/expenses/:id", admin.deleteExpense);

module.exports = router;
