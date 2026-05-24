const express = require('express');
const Feedback = require('../Models/Feedback');
const FeedbackReply = require('../Models/FeedbackReply');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(verifyAdmin);

const normalizeStatus = (value) => {
  if (!value) return 'Pending';
  const formatted = String(value).trim();
  if (formatted === 'Open' || formatted === 'Pending') return 'Pending';
  if (formatted === 'Replied' || formatted === 'In Review') return 'Replied';
  if (formatted === 'Resolved') return 'Resolved';
  return 'Pending';
};

router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    const filter = {};

    if (q) {
      const regex = new RegExp(String(q).trim(), 'i');
      filter.$or = [
        { userName: regex },
        { message: regex },
        { category: regex },
        { status: regex },
        { email: regex }
      ];
    }

    const feedback = await Feedback.find(filter).sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    console.error('Unable to fetch feedback:', error);
    res.status(500).json({ success: false, message: 'Unable to fetch feedback.' });
  }
});

router.post('/reply', async (req, res) => {
  try {
    const { feedbackId, adminMessage } = req.body;
    if (!feedbackId || !adminMessage || !adminMessage.trim()) {
      return res.status(400).json({ success: false, message: 'Feedback ID and reply message are required.' });
    }

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found.' });
    }

    const reply = new FeedbackReply({
      feedbackId,
      adminMessage: adminMessage.trim()
    });
    await reply.save();

    feedback.status = 'Replied';
    feedback.response = adminMessage.trim();
    await feedback.save();

    res.json({ success: true, feedback, reply });
  } catch (error) {
    console.error('Unable to send feedback reply:', error);
    res.status(500).json({ success: false, message: 'Unable to send feedback reply.' });
  }
});

router.patch('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const newStatus = normalizeStatus(status);
    if (!['Pending', 'Replied', 'Resolved'].includes(newStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid feedback status.' });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found.' });
    }

    res.json({ success: true, feedback });
  } catch (error) {
    console.error('Unable to update feedback status:', error);
    res.status(500).json({ success: false, message: 'Unable to update feedback status.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findByIdAndDelete(id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found.' });
    }

    await FeedbackReply.deleteMany({ feedbackId: id });
    res.json({ success: true, message: 'Feedback deleted successfully.' });
  } catch (error) {
    console.error('Unable to delete feedback:', error);
    res.status(500).json({ success: false, message: 'Unable to delete feedback.' });
  }
});

module.exports = router;
