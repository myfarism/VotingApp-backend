// routes/testCryptoRoutes.js
const express = require('express');
const TestCryptoController = require('../controllers/testCryptoController');

const router = express.Router();

// Endpoint: GET /api/test/crypto
router.get('/crypto', TestCryptoController.runAllTests);

module.exports = router;
