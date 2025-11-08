const ResponseFormatter = require('../utils/responseFormatter');

function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return ResponseFormatter.validationError(res, err.errors);
  }

  if (err.name === 'JsonWebTokenError') {
    return ResponseFormatter.unauthorized(res, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return ResponseFormatter.unauthorized(res, 'Token expired');
  }

  // Blockchain errors
  if (err.message.includes('insufficient funds')) {
    return ResponseFormatter.error(res, 'Insufficient funds for transaction', 400);
  }

  if (err.message.includes('execution reverted')) {
    return ResponseFormatter.error(res, 'Transaction reverted: ' + err.reason || err.message, 400);
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return ResponseFormatter.error(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );
}

module.exports = errorHandler;
