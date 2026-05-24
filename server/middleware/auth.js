const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'expense-splitter-secret';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-dashboard-token-2026';

const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authorization token missing.' });
  }

  if (token === ADMIN_TOKEN) {
    req.user = { role: 'admin', isAdmin: true };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid authorization token.' });
  }
};

module.exports = {
  verifyAdmin
};
