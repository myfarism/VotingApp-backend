const express = require('express');
const router = express.Router();
const AuditController = require('../controllers/auditController');

// Public routes
router.get('/stats', AuditController.getStats);
router.get('/log/:logId', AuditController.getAuditLog);
router.get('/logs/total', AuditController.getTotalAuditLogs);
router.get('/logs/paginated', AuditController.getPaginatedAuditLogs);
router.get('/logs/filtered', AuditController.getFilteredAuditLogs);
router.get('/logs/export', AuditController.exportAuditLogs);

// Audit logs by actor
router.get('/logs/actor/:address', AuditController.getAuditLogsByActor);

// Audit logs by action
router.get('/logs/action/:action', AuditController.getAuditLogsByAction);

// Vote audit trail
router.get('/vote-trail/:voterAddress', AuditController.getVoteAuditTrail);
router.get('/votes/all', AuditController.getAllVotes);

module.exports = router;
