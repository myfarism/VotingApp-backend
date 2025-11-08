const jwt = require('jsonwebtoken');
const ResponseFormatter = require('../utils/responseFormatter');

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return ResponseFormatter.unauthorized(res, 'Access token required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    return ResponseFormatter.forbidden(res, 'Invalid or expired token');
  }
}

function authenticateAdmin(req, res, next) {
  authenticate(req, res, () => {
    if (req.user.role !== 'admin') {
      return ResponseFormatter.forbidden(res, 'Admin access required');
    }
    next();
  });
}

module.exports = {
  authenticate,
  authenticateAdmin,
};
