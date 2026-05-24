const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
    groupName: { type: String, required: true },
    members: { type: [String], default: [] },
    totalExpense: { type: Number, default: 0 },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    createdAt: { type: Date, default: Date.now }
});

// Check if model already exists to prevent OverwriteModelError
module.exports = mongoose.models.Group || mongoose.model("Group", groupSchema);