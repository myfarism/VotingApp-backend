const BlockchainService = require('../services/blockchainService');
const WalletService = require('../services/walletService');
const ResponseFormatter = require('../utils/responseFormatter');

class VoteController {
  /**
   * Cast vote
   */
  static async castVote(req, res, next) {
    try {
      const { candidateId, encryptedPrivateKey } = req.body;
      const nim = req.user.nim;

      if (!candidateId || !encryptedPrivateKey) {
        return ResponseFormatter.validationError(res, {
          candidateId: candidateId ? null : 'Candidate ID is required',
          encryptedPrivateKey: encryptedPrivateKey ? null : 'Encrypted private key is required',
        });
      }

      console.log('🗳️  Processing vote...');
      console.log('   User NIM:', nim);
      console.log('   Candidate ID:', candidateId);

      // Cast vote on blockchain
      const result = await BlockchainService.castVote(candidateId, encryptedPrivateKey);

      console.log('✅ Vote cast successfully');

      return ResponseFormatter.success(
        res,
        {
          txHash: result.txHash,
          blockNumber: result.blockNumber,
          gasUsed: result.gasUsed,
          candidateId: result.candidateId,
          timestamp: result.timestamp,
        },
        'Vote cast successfully'
      );
    } catch (error) {
      console.error('Vote error:', error);

      if (error.message.includes('already voted')) {
        return ResponseFormatter.error(res, 'You have already voted', 400);
      }
      if (error.message.includes('not active')) {
        return ResponseFormatter.error(res, 'Voting is not active', 400);
      }
      if (error.message.includes('Invalid candidate')) {
        return ResponseFormatter.error(res, 'Invalid candidate', 400);
      }
      if (error.message.includes('only vote for candidates in your prodi')) {
        return ResponseFormatter.error(res, 'You can only vote for candidates in your prodi', 400);
      }

      next(error);
    }
  }

  /**
   * Check if user has voted
   */
  static async checkVoted(req, res, next) {
    try {
      const walletAddress = req.user.walletAddress;

      const hasVoted = await BlockchainService.hasVoted(walletAddress);

      return ResponseFormatter.success(res, {
        hasVoted,
        walletAddress,
      });
    } catch (error) {
      console.error('Check voted error:', error);
      next(error);
    }
  }

  /**
   * Get voting status
   */
  static async getVotingStatus(req, res, next) {
    try {
      const status = await BlockchainService.getVotingStatus();

      return ResponseFormatter.success(res, status, 'Voting status retrieved successfully');
    } catch (error) {
      console.error('Get voting status error:', error);
      next(error);
    }
  }
}

module.exports = VoteController;
