const express = require('express');
const router = express.Router();
const CandidateController = require('../controllers/candidateController');

// Public routes
router.get('/', CandidateController.getAllCandidates);
router.get('/:id', CandidateController.getCandidatesDetail);
router.get('/prodi/:prodi', CandidateController.getCandidatesByProdi);
router.get('/results/all', CandidateController.getResults);
router.get('/results/prodi/:prodi', CandidateController.getResultsByProdi);

module.exports = router;
