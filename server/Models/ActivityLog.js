const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  detail: { type: String, required: true },
  entity: { type: String, default: 'system' },
  actor: { type: String, default: 'system' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
