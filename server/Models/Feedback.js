const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: { type: String },
  userName: { type: String },
  email: { type: String },
  category: { type: String, default: 'General' },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Replied', 'Resolved', 'Open', 'In Review'],
    default: 'Pending'
  },
  response: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
