const mongoose = require('mongoose');

const feedbackReplySchema = new mongoose.Schema({
  feedbackId: { type: mongoose.Schema.Types.ObjectId, ref: 'Feedback', required: true },
  adminMessage: { type: String, required: true },
  repliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.FeedbackReply || mongoose.model('FeedbackReply', feedbackReplySchema);
