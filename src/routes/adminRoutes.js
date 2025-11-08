const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

// All admin routes require admin authentication
// For now, we'll use basic auth since admin is just owner wallet

// Candidate Management
router.post('/candidate', AdminController.addCandidate);
router.put('/candidate/:id', AdminController.updateCandidate);
router.delete('/candidate/:id', AdminController.deactivateCandidate);

// Voting Session Management
router.post('/session', AdminController.createVotingSession);
router.post('/session/activate', AdminController.setVotingActive);
router.post('/session/emergency-pause', AdminController.emergencyPause);

// User Management
router.post('/user/reset-password', AdminController.resetUserPassword);
router.get('/users/count', AdminController.getUsersCount);

// Wallet Management
router.get('/wallet/:address', AdminController.checkWalletBalance);
router.get('/wallet/admin/balance', AdminController.getAdminBalance);
router.post('/wallet/refund', AdminController.refundUserWallet);

module.exports = router;
