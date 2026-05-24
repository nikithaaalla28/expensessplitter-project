const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/auth');

router.use(verifyAdmin);

router.get('/test-summary', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Test endpoint working'
  });
});

module.exports = router;
