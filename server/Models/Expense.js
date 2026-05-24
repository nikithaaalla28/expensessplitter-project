const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: String, required: true },
  splitAmong: { type: [String], required: true },
  category: { type: String },
  splitType: { type: String, enum: ['equal', 'exact', 'percentage', 'shares'], default: 'equal' },
  splits: { type: Map, of: Number }, // { personName: amount }
  groupId: { type: String, required: true },
  receipt: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Check if model already exists to prevent OverwriteModelError
module.exports = mongoose.models.Expense || mongoose.model("Expense", expenseSchema);