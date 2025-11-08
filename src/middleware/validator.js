const ResponseFormatter = require('../utils/responseFormatter');

class Validator {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateNIM(nim) {
    // Customize based on your NIM format
    return nim && nim.length >= 8 && /^\d+$/.test(nim);
  }

  static validatePassword(password) {
    return password && password.length >= 8;
  }

  static validateRegistration(req, res, next) {
    const { email, username, nim, prodi, password } = req.body;
    const errors = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!Validator.validateEmail(email)) {
      errors.email = 'Invalid email format';
    }

    if (!username) {
      errors.username = 'Username is required';
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!nim) {
      errors.nim = 'NIM is required';
    } else if (!Validator.validateNIM(nim)) {
      errors.nim = 'Invalid NIM format (must be 8+ digits)';
    }

    if (!prodi) {
      errors.prodi = 'Program Studi is required';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (!Validator.validatePassword(password)) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(errors).length > 0) {
      return ResponseFormatter.validationError(res, errors);
    }

    next();
  }

  static validateLogin(req, res, next) {
    const { nim, password } = req.body;
    const errors = {};

    if (!nim) {
      errors.nim = 'NIM is required';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    if (Object.keys(errors).length > 0) {
      return ResponseFormatter.validationError(res, errors);
    }

    next();
  }

  static validateVote(req, res, next) {
    const { candidateId, encryptedPrivateKey } = req.body;
    const errors = {};

    if (!candidateId) {
      errors.candidateId = 'Candidate ID is required';
    }

    if (!encryptedPrivateKey) {
      errors.encryptedPrivateKey = 'Encrypted private key is required';
    }

    if (Object.keys(errors).length > 0) {
      return ResponseFormatter.validationError(res, errors);
    }

    next();
  }
}

module.exports = Validator;
