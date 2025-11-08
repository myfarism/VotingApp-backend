const BlockchainService = require('../services/blockchainService');
const ResponseFormatter = require('../utils/responseFormatter');

class AuditController {
  /**
   * Get contract stats
   */
  static async getStats(req, res, next) {
    try {
      console.log('📊 Fetching contract stats...');

      const stats = await BlockchainService.getContractStats();
      console.log('✅ Contract stats retrieved', stats);

      return ResponseFormatter.success(res, stats, 'Contract statistics retrieved successfully');
    } catch (error) {
      console.error('Get stats error:', error);
      next(error);
    }
  }

  /**
   * Get specific audit log
   */
  static async getAuditLog(req, res, next) {
    try {
      const { logId } = req.params;

      if (!logId) {
        return ResponseFormatter.validationError(res, {
          logId: 'Log ID is required',
        });
      }

      console.log('📜 Fetching audit log:', logId);

      const log = await BlockchainService.getAuditLog(logId);

      return ResponseFormatter.success(res, log, 'Audit log retrieved successfully');
    } catch (error) {
      console.error('Get audit log error:', error);
      next(error);
    }
  }

  /**
   * Get audit logs by actor (address)
   */
  static async getAuditLogsByActor(req, res, next) {
    try {
      const { address } = req.params;

      if (!address) {
        return ResponseFormatter.validationError(res, {
          address: 'Address is required',
        });
      }

      console.log('📜 Fetching audit logs by actor:', address);

      const logIds = await BlockchainService.getAuditLogsByActor(address);
      
      // Fetch full log details for each log ID
      const logs = await Promise.all(
        logIds.map(logId => BlockchainService.getAuditLog(logId))
      );

      return ResponseFormatter.success(res, {
        address,
        totalLogs: logIds.length,
        logs
      }, 'Audit logs by actor retrieved successfully');
    } catch (error) {
      console.error('Get audit logs by actor error:', error);
      next(error);
    }
  }

  /**
   * Get audit logs by action
   */
  static async getAuditLogsByAction(req, res, next) {
    try {
      const { action } = req.params;

      if (!action) {
        return ResponseFormatter.validationError(res, {
          action: 'Action is required',
        });
      }

      console.log('📜 Fetching audit logs by action:', action);

      const logIds = await BlockchainService.getAuditLogsByAction(action);
      
      // Fetch full log details for each log ID
      const logs = await Promise.all(
        logIds.map(logId => BlockchainService.getAuditLog(logId))
      );

      return ResponseFormatter.success(res, {
        action,
        totalLogs: logIds.length,
        logs
      }, 'Audit logs by action retrieved successfully');
    } catch (error) {
      console.error('Get audit logs by action error:', error);
      next(error);
    }
  }

  /**
   * Get vote audit trail for specific voter
   */
  static async getVoteAuditTrail(req, res, next) {
    try {
      const { voterAddress } = req.params;

      if (!voterAddress) {
        return ResponseFormatter.validationError(res, {
          voterAddress: 'Voter address is required',
        });
      }

      console.log('🗳️ Fetching vote audit trail for:', voterAddress);

      const voteTrail = await BlockchainService.getVoteAuditTrail(voterAddress);

      return ResponseFormatter.success(res, voteTrail, 'Vote audit trail retrieved successfully');
    } catch (error) {
      console.error('Get vote audit trail error:', error);
      next(error);
    }
  }

  /**
   * Get all votes (for transparency)
   */
  static async getAllVotes(req, res, next) {
    try {
      console.log('🗳️ Fetching all votes...');

      const votes = await BlockchainService.getAllVotes();

      return ResponseFormatter.success(res, {
        totalVotes: votes.length,
        votes
      }, 'All votes retrieved successfully');
    } catch (error) {
      console.error('Get all votes error:', error);
      next(error);
    }
  }

  /**
   * Get total audit logs count
   */
  static async getTotalAuditLogs(req, res, next) {
    try {
      console.log('🔢 Fetching total audit logs count...');

      const count = await BlockchainService.getTotalAuditLogs();

      return ResponseFormatter.success(res, { totalAuditLogs: count }, 'Total audit logs count retrieved successfully');
    } catch (error) {
      console.error('Get total audit logs error:', error);
      next(error);
    }
  }

  /**
   * Get paginated audit logs
   */
  static async getPaginatedAuditLogs(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (pageNum < 1 || limitNum < 1) {
        return ResponseFormatter.validationError(res, {
          page: 'Page must be greater than 0',
          limit: 'Limit must be greater than 0'
        });
      }

      console.log(`📜 Fetching paginated audit logs - Page: ${pageNum}, Limit: ${limitNum}`);

      const totalLogs = await BlockchainService.getTotalAuditLogs();
      const startId = (pageNum - 1) * limitNum + 1;
      const endId = Math.min(startId + limitNum - 1, totalLogs);

      const logs = [];
      for (let i = startId; i <= endId; i++) {
        try {
          const log = await BlockchainService.getAuditLog(i);
          logs.push(log);
        } catch (err) {
          console.error(`Error fetching log ${i}:`, err);
        }
      }

      return ResponseFormatter.success(res, {
        page: pageNum,
        limit: limitNum,
        totalLogs,
        totalPages: Math.ceil(totalLogs / limitNum),
        logs
      }, 'Paginated audit logs retrieved successfully');
    } catch (error) {
      console.error('Get paginated audit logs error:', error);
      next(error);
    }
  }

  /**
   * Get audit logs with filters
   */
  static async getFilteredAuditLogs(req, res, next) {
    try {
      const { actor, action, startDate, endDate } = req.query;

      console.log('🔍 Fetching filtered audit logs...', { actor, action, startDate, endDate });

      let logs = [];
      
      // Filter by actor
      if (actor) {
        const logIds = await BlockchainService.getAuditLogsByActor(actor);
        logs = await Promise.all(
          logIds.map(logId => BlockchainService.getAuditLog(logId))
        );
      }
      // Filter by action
      else if (action) {
        const logIds = await BlockchainService.getAuditLogsByAction(action);
        logs = await Promise.all(
          logIds.map(logId => BlockchainService.getAuditLog(logId))
        );
      }
      // Get all logs if no specific filter
      else {
        const totalLogs = await BlockchainService.getTotalAuditLogs();
        for (let i = 1; i <= totalLogs; i++) {
          try {
            const log = await BlockchainService.getAuditLog(i);
            logs.push(log);
          } catch (err) {
            console.error(`Error fetching log ${i}:`, err);
          }
        }
      }

      // Apply date filters if provided
      if (startDate || endDate) {
        const start = startDate ? new Date(startDate).getTime() / 1000 : 0;
        const end = endDate ? new Date(endDate).getTime() / 1000 : Date.now() / 1000;
        
        logs = logs.filter(log => {
          const timestamp = parseInt(log.timestamp);
          return timestamp >= start && timestamp <= end;
        });
      }

      return ResponseFormatter.success(res, {
        totalLogs: logs.length,
        filters: { actor, action, startDate, endDate },
        logs
      }, 'Filtered audit logs retrieved successfully');
    } catch (error) {
      console.error('Get filtered audit logs error:', error);
      next(error);
    }
  }

  /**
   * Export audit logs (for reporting)
   */
  static async exportAuditLogs(req, res, next) {
    try {
      const { format = 'json', actor, action } = req.query;

      console.log('📥 Exporting audit logs...', { format, actor, action });

      let logs = [];
      
      if (actor) {
        const logIds = await BlockchainService.getAuditLogsByActor(actor);
        logs = await Promise.all(
          logIds.map(logId => BlockchainService.getAuditLog(logId))
        );
      } else if (action) {
        const logIds = await BlockchainService.getAuditLogsByAction(action);
        logs = await Promise.all(
          logIds.map(logId => BlockchainService.getAuditLog(logId))
        );
      } else {
        const totalLogs = await BlockchainService.getTotalAuditLogs();
        for (let i = 1; i <= totalLogs; i++) {
          try {
            const log = await BlockchainService.getAuditLog(i);
            logs.push(log);
          } catch (err) {
            console.error(`Error fetching log ${i}:`, err);
          }
        }
      }

      if (format === 'csv') {
        // Convert to CSV format
        const csv = convertToCSV(logs);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
        return res.send(csv);
      }

      return ResponseFormatter.success(res, {
        totalLogs: logs.length,
        exportedAt: new Date().toISOString(),
        logs
      }, 'Audit logs exported successfully');
    } catch (error) {
      console.error('Export audit logs error:', error);
      next(error);
    }
  }
}

/**
 * Helper function to convert logs to CSV
 */
function convertToCSV(logs) {
  if (logs.length === 0) return '';

  const headers = ['ID', 'Action', 'Actor', 'Actor Role', 'Timestamp', 'Data Hash', 'Details', 'Is Success'];
  const rows = logs.map(log => [
    log.id,
    log.action,
    log.actor,
    log.actorRole,
    new Date(parseInt(log.timestamp) * 1000).toISOString(),
    log.dataHash,
    log.details,
    log.isSuccess
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

module.exports = AuditController;
