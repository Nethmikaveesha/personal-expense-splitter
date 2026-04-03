const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const expense = require("../controllers/expenseController");

router.get("/", requireAuth, expense.listMyExpenses);
router.post("/", requireAuth, expense.createExpense);
router.put("/:id", requireAuth, expense.updateExpense);
router.delete("/:id", requireAuth, expense.deleteExpense);

module.exports = router;
