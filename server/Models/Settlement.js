const mongoose = require("mongoose");

const paymentHistorySchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  note: { type: String, default: '' }
}, { _id: false });

const settlementSchema = new mongoose.Schema({
  groupId: { type: String, required: true },
  debtor: { type: String, required: true }, // Person who owes
  creditor: { type: String, required: true }, // Person who paid
  amount: { type: Number },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  remainingAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Pending', 'Partially Paid', 'Settled'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Failed', 'Settled'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['PhonePe', 'Google Pay', 'Paytm', 'Other', ''],
    default: ''
  },
  transactionId: { type: String, default: '' },
  settledAt: { type: Date },
  paymentHistory: { type: [paymentHistorySchema], default: [] },
  note: { type: String, default: '' },
  settled: { type: Boolean, default: false }
}, { timestamps: true });

// Check if model already exists to prevent OverwriteModelError
module.exports = mongoose.models.Settlement || mongoose.model("Settlement", settlementSchema);
