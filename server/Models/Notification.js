const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  // generic type: user, group, expense, settlement, feedback, alert
  type: { type: String, enum: ['user', 'group', 'expense', 'settlement', 'feedback', 'alert', 'announcement', 'reminder'], default: 'alert' },
  isRead: { type: Boolean, default: false },
  meta: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
