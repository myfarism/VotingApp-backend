const express = require('express');
const router = express.Router();
const VoteController = require('../controllers/voteController');
const Validator = require('../middleware/validator');
const { authenticate } = require('../middleware/authMiddleware');

// All routes require authentication
router.post('/cast', authenticate, Validator.validateVote, VoteController.castVote);
router.get('/check', authenticate, VoteController.checkVoted);
router.get('/status', VoteController.getVotingStatus);

module.exports = router;
