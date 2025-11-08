const { ethers } = require('ethers');
const blockchainConfig = require('../config/blockchain');
const WalletService = require('./walletService');
const HashHelper = require('../utils/hashHelper');

class BlockchainService {
  /**
   * Register user ke blockchain
   */
  static async registerUser(userData) {
    try {
      const { nim, email, username, prodi, password, walletAddress } = userData;

      console.log('⛓️  Registering user to blockchain...');
      console.log('   NIM:', nim);
      console.log('   Email:', email);
      console.log('   Wallet:', walletAddress);

      // Hash password
      const passwordHash = HashHelper.hashPassword(password);

      // Get contract with admin signer
      const adminWallet = blockchainConfig.getAdminWallet();
      const contract = blockchainConfig.getContractWithSigner(adminWallet);

      // Call registerUser on smart contract
      const tx = await contract.registerUser(nim, email, username, prodi, passwordHash, walletAddress);

      console.log('📤 Transaction sent:', tx.hash);

      const receipt = await tx.wait();

      console.log('✅ User registered on blockchain');
      console.log('   Block:', receipt.blockNumber);
      console.log('   Gas used:', receipt.gasUsed.toString());

      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error('❌ Blockchain registration error:', error);

      if (error.message.includes('Email already registered')) {
        throw new Error('Email already registered on blockchain');
      }
      if (error.message.includes('NIM already registered')) {
        throw new Error('NIM already registered on blockchain');
      }
      if (error.message.includes('User already registered')) {
        throw new Error('User already registered on blockchain');
      }

      throw error;
    }
  }

  /**
   * Login - verify credentials dari blockchain
   */
  static async login(nim, password) {
    try {
      console.log('🔐 Verifying credentials on blockchain...');
      console.log('   NIM:', nim);

      const passwordHash = HashHelper.hashPassword(password);

      const contract = blockchainConfig.getContract();

      // Call login function on smart contract
      const tx = await contract.login(nim, passwordHash);
      const receipt = await tx.wait();

      console.log('✅ Login successful');
      console.log('   Tx hash:', receipt.hash);

      // Get user info dari blockchain
      const userInfo = await this.getUserByNIM(nim);

      return {
        success: true,
        walletAddress: userInfo.walletAddress,
        user: userInfo,
      };
    } catch (error) {
      console.error('❌ Login error:', error);

      if (error.message.includes('Invalid credentials')) {
        throw new Error('Invalid credentials');
      }
      if (error.message.includes('User not registered')) {
        throw new Error('User not registered');
      }
      if (error.message.includes('Account is locked')) {
        throw new Error('Account is locked. Too many failed login attempts. Try again in 15 minutes.');
      }

      throw error;
    }
  }

  /**
   * Get user info dari blockchain
   */
  static async getUserByNIM(nim) {
    try {
      const contract = blockchainConfig.getContract();
      const userInfo = await contract.getUserByNIM(nim);

      return {
        email: userInfo[0],
        username: userInfo[1],
        prodi: userInfo[2],
        walletAddress: userInfo[3],
        isRegistered: userInfo[4],
        registeredAt: new Date(Number(userInfo[5]) * 1000).toISOString(),
        lastLoginAt: Number(userInfo[6]) > 0 ? new Date(Number(userInfo[6]) * 1000).toISOString() : null,
        isLocked: userInfo[7],
        passwordChangedAt:
          Number(userInfo[8]) > 0 ? new Date(Number(userInfo[8]) * 1000).toISOString() : null,
      };
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  /**
   * Get user by address
   */
  static async getUserByAddress(address) {
    try {
      const contract = blockchainConfig.getContract();
      const userInfo = await contract.getUserByAddress(address);

      return {
        nim: userInfo[0],
        email: userInfo[1],
        username: userInfo[2],
        prodi: userInfo[3],
        isRegistered: userInfo[4],
      };
    } catch (error) {
      console.error('Error getting user by address:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  static async changePassword(nim, oldPassword, newPassword, encryptedPrivateKey) {
    try {
      console.log('🔐 Changing password on blockchain...');
      console.log('   NIM:', nim);

      const oldPasswordHash = HashHelper.hashPassword(oldPassword);
      const newPasswordHash = HashHelper.hashPassword(newPassword);

      // Get user wallet
      const wallet = WalletService.getWalletFromEncrypted(encryptedPrivateKey);
      const contract = blockchainConfig.getContractWithSigner(wallet);

      // Call changePassword
      const tx = await contract.changePassword(nim, oldPasswordHash, newPasswordHash);
      const receipt = await tx.wait();

      console.log('✅ Password changed successfully');
      console.log('   Tx hash:', receipt.hash);

      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error('❌ Change password error:', error);

      if (error.message.includes('Invalid old password')) {
        throw new Error('Current password is incorrect');
      }
      if (error.message.includes('New password must be different')) {
        throw new Error('New password must be different from current password');
      }

      throw error;
    }
  }

  /**
   * Cast vote
   */
  static async castVote(candidateId, encryptedPrivateKey) {
    try {
      console.log('🗳️  Casting vote on blockchain...');
      console.log('   Candidate ID:', candidateId);

      // Get user wallet
      const wallet = WalletService.getWalletFromEncrypted(encryptedPrivateKey);

      // Check balance sebelum vote
      await WalletService.refundWalletIfNeeded(wallet.address);

      // Create message hash
      const message = `Vote for candidate ${candidateId} by ${wallet.address}`;
      const messageHash = HashHelper.createMessageHash(message);

      // Sign message
      const signature = await wallet.signMessage(ethers.getBytes(messageHash));

      console.log('✍️  Message signed');
      console.log('   Message hash:', messageHash);

      // Submit vote
      const contract = blockchainConfig.getContractWithSigner(wallet);
      const tx = await contract.vote(candidateId, messageHash, signature);

      console.log('📤 Vote transaction sent:', tx.hash);

      const receipt = await tx.wait();

      console.log('✅ Vote cast successfully');
      console.log('   Block:', receipt.blockNumber);
      console.log('   Gas used:', receipt.gasUsed.toString());

      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        candidateId: candidateId,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('❌ Vote error:', error);

      if (error.message.includes('Already voted')) {
        throw new Error('You have already voted');
      }
      if (error.message.includes('Voting is not active')) {
        throw new Error('Voting is not active');
      }
      if (error.message.includes('Invalid candidate')) {
        throw new Error('Invalid candidate');
      }
      if (error.message.includes('Can only vote for candidates in your prodi')) {
        throw new Error('You can only vote for candidates in your prodi');
      }

      throw error;
    }
  }

  /**
   * Get all candidates
   */
  static async getAllCandidates() {
    try {
      const contract = blockchainConfig.getContract();
      const candidates = await contract.getAllCandidates();

      return candidates.map((c) => ({
        id: c.id.toString(),
        name: c.name,
        description: c.description,
        imageUrl: c.imageUrl,
        prodi: c.prodi,
        voteCount: c.voteCount.toString(),
        isActive: c.isActive,
        createdAt: new Date(Number(c.createdAt) * 1000).toISOString(),
      }));
    } catch (error) {
      console.error('Error getting candidates:', error);
      throw error;
    }
  }

  /**
   * Get candidates by prodi
   */
  static async getCandidatesByProdi(prodi) {
    try {
      const contract = blockchainConfig.getContract();
      const candidateIds = await contract.getCandidatesByProdi(prodi);

      const candidates = [];
      for (const id of candidateIds) {
        const candidate = await contract.getCandidate(id);
        candidates.push({
          id: candidate[0].toString(),
          name: candidate[1],
          description: candidate[2],
          imageUrl: candidate[3],
          prodi: candidate[4],
          voteCount: candidate[5].toString(),
          isActive: candidate[6],
          createdAt: new Date(Number(candidate[7]) * 1000).toISOString(),
        });
      }

      return candidates;
    } catch (error) {
      console.error('Error getting candidates by prodi:', error);
      throw error;
    }
  }

  /**
   * Check if user has voted
   */
  static async hasVoted(address) {
    try {
      const contract = blockchainConfig.getContract();
      return await contract.hasVoted(address);
    } catch (error) {
      console.error('Error checking vote status:', error);
      throw error;
    }
  }

  /**
   * Get voting session status
   */
  static async getVotingStatus() {
    try {
      const contract = blockchainConfig.getContract();
      const status = await contract.getVotingStatus();

      return {
        active: status[0],
        startTime: new Date(Number(status[1]) * 1000).toISOString(),
        endTime: new Date(Number(status[2]) * 1000).toISOString(),
        currentTime: new Date(Number(status[3]) * 1000).toISOString(),
        sessionName: status[4],
      };
    } catch (error) {
      console.error('Error getting voting status:', error);
      throw error;
    }
  }

  /**
   * Get contract stats
   */
  static async getContractStats() {
    try {
      const contract = blockchainConfig.getContract();
      const stats = await contract.getContractStats();

      return {
        totalUsers: stats[0].toString(),
        totalCandidates: stats[1].toString(),
        totalVotes: stats[2].toString(),
        totalSessions: stats[3].toString(),
        totalAuditLogs: stats[4].toString(),
        votingActive: stats[5],
      };
    } catch (error) {
      console.error('Error getting contract stats:', error);
      throw error;
    }
  }

  // ============================================
  // AUDIT FUNCTIONS
  // ============================================

  /**
   * Get specific audit log
   */
  static async getAuditLog(logId) {
    try {
      const contract = blockchainConfig.getContract();
      const log = await contract.getAuditLog(logId);

      return {
        id: log[0].toString(),
        action: log[1],
        actor: log[2],
        actorRole: log[3],
        timestamp: new Date(Number(log[4]) * 1000).toISOString(),
        timestampUnix: log[4].toString(),
        dataHash: log[5],
        details: log[6],
        isSuccess: log[7],
      };
    } catch (error) {
      console.error('Error getting audit log:', error);
      throw error;
    }
  }

  /**
   * Get audit logs by actor address
   */
  static async getAuditLogsByActor(actorAddress) {
    try {
      const contract = blockchainConfig.getContract();
      const logIds = await contract.getAuditLogsByActor(actorAddress);

      // Convert BigNumber array to string array
      return logIds.map(id => id.toString());
    } catch (error) {
      console.error('Error getting audit logs by actor:', error);
      throw error;
    }
  }

  /**
   * Get audit logs by action type
   */
  static async getAuditLogsByAction(action) {
    try {
      const contract = blockchainConfig.getContract();
      const logIds = await contract.getAuditLogsByAction(action);

      // Convert BigNumber array to string array
      return logIds.map(id => id.toString());
    } catch (error) {
      console.error('Error getting audit logs by action:', error);
      throw error;
    }
  }

  /**
   * Get vote audit trail for specific voter
   */
  static async getVoteAuditTrail(voterAddress) {
    try {
      const contract = blockchainConfig.getContract();
      const trail = await contract.getVoteAuditTrail(voterAddress);

      return {
        candidateId: trail[0].toString(),
        voterProdi: trail[1],
        timestamp: new Date(Number(trail[2]) * 1000).toISOString(),
        timestampUnix: trail[2].toString(),
        messageHash: trail[3],
        voteHash: trail[4],
        verified: trail[5],
      };
    } catch (error) {
      console.error('Error getting vote audit trail:', error);
      throw error;
    }
  }

  /**
   * Get all votes for transparency
   */
  static async getAllVotes() {
    try {
      const contract = blockchainConfig.getContract();
      const votes = await contract.getAllVotes();

      return votes.map(vote => ({
        voter: vote.voter,
        candidateId: vote.candidateId.toString(),
        voterProdi: vote.voterProdi,
        timestamp: new Date(Number(vote.timestamp) * 1000).toISOString(),
        timestampUnix: vote.timestamp.toString(),
        messageHash: vote.messageHash,
        voteHash: vote.voteHash,
        verified: vote.verified,
      }));
    } catch (error) {
      console.error('Error getting all votes:', error);
      throw error;
    }
  }

  /**
   * Get total audit logs count
   */
  static async getTotalAuditLogs() {
    try {
      const contract = blockchainConfig.getContract();
      const count = await contract.getTotalAuditLogs();

      return count.toString();
    } catch (error) {
      console.error('Error getting total audit logs:', error);
      throw error;
    }
  }

  /**
   * Get audit logs in range
   */
  static async getAuditLogsInRange(startId, endId) {
    try {
      const contract = blockchainConfig.getContract();
      const logs = [];

      for (let i = startId; i <= endId; i++) {
        try {
          const log = await this.getAuditLog(i);
          logs.push(log);
        } catch (error) {
          console.error(`Error fetching log ${i}:`, error);
          // Continue with next log if one fails
        }
      }

      return logs;
    } catch (error) {
      console.error('Error getting audit logs in range:', error);
      throw error;
    }
  }

  /**
   * Get recent audit logs
   */
  static async getRecentAuditLogs(limit = 10) {
    try {
      const contract = blockchainConfig.getContract();
      const totalLogs = await contract.getTotalAuditLogs();
      const total = Number(totalLogs.toString());

      const startId = Math.max(1, total - limit + 1);
      const logs = [];

      for (let i = total; i >= startId; i--) {
        try {
          const log = await this.getAuditLog(i);
          logs.push(log);
        } catch (error) {
          console.error(`Error fetching log ${i}:`, error);
        }
      }

      return logs;
    } catch (error) {
      console.error('Error getting recent audit logs:', error);
      throw error;
    }
  }

  /**
   * Get vote by voter address
   */
  static async getVoteByAddress(voterAddress) {
    try {
      const contract = blockchainConfig.getContract();
      const vote = await contract.votesByAddress(voterAddress);

      if (vote.voter === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      return {
        voter: vote.voter,
        candidateId: vote.candidateId.toString(),
        voterProdi: vote.voterProdi,
        timestamp: new Date(Number(vote.timestamp) * 1000).toISOString(),
        timestampUnix: vote.timestamp.toString(),
        messageHash: vote.messageHash,
        voteHash: vote.voteHash,
        verified: vote.verified,
      };
    } catch (error) {
      console.error('Error getting vote by address:', error);
      throw error;
    }
  }

  /**
   * Verify vote integrity
   */
  static async verifyVoteIntegrity(voterAddress, candidateId, messageHash) {
    try {
      const contract = blockchainConfig.getContract();
      const vote = await contract.votesByAddress(voterAddress);

      const isValid = 
        vote.voter.toLowerCase() === voterAddress.toLowerCase() &&
        vote.candidateId.toString() === candidateId.toString() &&
        vote.messageHash === messageHash &&
        vote.verified === true;

      return {
        isValid,
        vote: {
          voter: vote.voter,
          candidateId: vote.candidateId.toString(),
          voterProdi: vote.voterProdi,
          timestamp: new Date(Number(vote.timestamp) * 1000).toISOString(),
          messageHash: vote.messageHash,
          voteHash: vote.voteHash,
          verified: vote.verified,
        },
      };
    } catch (error) {
      console.error('Error verifying vote integrity:', error);
      throw error;
    }
  }

  /**
   * Get audit summary statistics
   */
  static async getAuditSummary() {
    try {
      const contract = blockchainConfig.getContract();
      const totalLogs = await contract.getTotalAuditLogs();
      const total = Number(totalLogs.toString());

      // Count actions by type
      const actionCounts = {};
      const actorCounts = {};
      let successCount = 0;
      let failureCount = 0;

      // Sample recent logs for statistics (last 100 or all if less)
      const sampleSize = Math.min(100, total);
      const startId = Math.max(1, total - sampleSize + 1);

      for (let i = startId; i <= total; i++) {
        try {
          const log = await this.getAuditLog(i);
          
          // Count by action
          actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
          
          // Count by actor
          actorCounts[log.actor] = (actorCounts[log.actor] || 0) + 1;
          
          // Count success/failure
          if (log.isSuccess) {
            successCount++;
          } else {
            failureCount++;
          }
        } catch (error) {
          console.error(`Error processing log ${i}:`, error);
        }
      }

      return {
        totalLogs: total.toString(),
        sampleSize,
        actionCounts,
        topActors: Object.entries(actorCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([actor, count]) => ({ actor, count })),
        successRate: sampleSize > 0 ? ((successCount / sampleSize) * 100).toFixed(2) + '%' : '0%',
        successCount,
        failureCount,
      };
    } catch (error) {
      console.error('Error getting audit summary:', error);
      throw error;
    }
  }

  /**
   * Get audit logs with detailed actor information
   */
  static async getAuditLogsWithActorDetails(actorAddress) {
    try {
      const logIds = await this.getAuditLogsByActor(actorAddress);
      
      // Fetch full log details
      const logs = await Promise.all(
        logIds.map(logId => this.getAuditLog(logId))
      );

      // Get actor information
      let actorInfo = null;
      try {
        actorInfo = await this.getUserByAddress(actorAddress);
      } catch (error) {
        console.log('Actor is not a registered user');
      }

      return {
        actor: actorAddress,
        actorInfo,
        totalLogs: logs.length,
        logs: logs.sort((a, b) => b.timestampUnix - a.timestampUnix), // Sort by latest first
      };
    } catch (error) {
      console.error('Error getting audit logs with actor details:', error);
      throw error;
    }
  }

  /**
   * Get contract owner
   */
  static async getOwner() {
    try {
      const contract = blockchainConfig.getContract();
      const owner = await contract.owner();

      return owner;
    } catch (error) {
      console.error('Error getting owner:', error);
      throw error;
    }
  }
}

module.exports = BlockchainService;
