const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const expense = require("../controllers/expenseController");

router.get("/", requireAuth, expense.getBalance);

module.exports = router;
