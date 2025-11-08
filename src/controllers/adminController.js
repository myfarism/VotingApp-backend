const BlockchainService = require('../services/blockchainService');
const blockchainConfig = require('../config/blockchain');
const ResponseFormatter = require('../utils/responseFormatter');
const { ethers } = require('ethers');

class AdminController {
  /**
   * Add new candidate
   */
  static async addCandidate(req, res, next) {
    try {
      const { id, name, description, imageUrl, prodi } = req.body;

      // Validation
      if (!id || !name || !prodi) {
        return ResponseFormatter.validationError(res, {
          id: id ? null : 'Candidate ID is required',
          name: name ? null : 'Candidate name is required',
          prodi: prodi ? null : 'Prodi is required',
        });
      }

      console.log('➕ Adding candidate...');
      console.log('   ID:', id);
      console.log('   Name:', name);
      console.log('   Prodi:', prodi);

      // Get admin wallet and contract
      const adminWallet = blockchainConfig.getAdminWallet();
      const contract = blockchainConfig.getContractWithSigner(adminWallet);

      // Call addCandidate on smart contract
      const tx = await contract.addCandidate(
        id,
        name,
        description || '',
        imageUrl || '',
        prodi
      );

      console.log('📤 Transaction sent:', tx.hash);

      const receipt = await tx.wait();

      console.log('✅ Candidate added successfully');
      console.log('   Block:', receipt.blockNumber);
      console.log('   Gas used:', receipt.gasUsed.toString());

      return ResponseFormatter.success(
        res,
        {
          candidateId: id,
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
        },
        'Candidate added successfully',
        201
      );
    } catch (error) {
      console.error('Add candidate error:', error);

      if (error.message.includes('Candidate ID already exists')) {
        return ResponseFormatter.error(res, 'Candidate ID already exists', 400);
      }

      next(error);
    }
  }

  /**
   * Update candidate
   */
  static async updateCandidate(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description, imageUrl } = req.body;

      if (!name) {
        return ResponseFormatter.validationError(res, {
          name: 'Candidate name is required',
        });
      }

      console.log('✏️  Updating candidate:', id);

      const adminWallet = blockchainConfig.getAdminWallet();
      const contract = blockchainConfig.getContractWithSigner(adminWallet);

      const tx = await contract.updateCandidate(
        id,
        name,
        description || '',
        imageUrl || ''
      );

      console.log('📤 Transaction sent:', tx.hash);

      const receipt = await tx.wait();

      console.log('✅ Candidate updated successfully');

      return ResponseFormatter.success(res, {
        candidateId: id,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      }, 'Candidate updated successfully');
    } catch (error) {
      console.error('Update candidate error:', error);
      next(error);
    }
  }

  /**
   * Deactivate candidate
   */
  static async deactivateCandidate(req, res, next) {
    try {
      const { id } = req.params;

      console.log('🚫 Deactivating candidate:', id);

      const adminWallet = blockchainConfig.getAdminWallet();
      const contract = blockchainConfig.getContractWithSigner(adminWallet);

      const tx = await contract.deactivateCandidate(id);

      console.log('📤 Transaction sent:', tx.hash);

      const receipt = await tx.wait();

      console.log('✅ Candidate deactivated successfully');

      return ResponseFormatter.success(res, {
        candidateId: id,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      }, 'Candidate deactivated successfully');
    } catch (error) {
      console.error('Deactivate candidate error:', error);
      next(error);
    }
  }

  /**
   * Create voting session
   */
  static async createVotingSession(req, res, next) {
    try {
      const { sessionName, startTime, endTime } = req.body;

      if (!sessionName || !startTime || !endTime) {
        return ResponseFormatter.validationError(res, {
          sessionName: sessionName ? null : 'Session name is required',
          startTime: startTime ? null : 'Start time is required',
          endTime: endTime ? null : 'End time is required',
        });
      }

      // Convert to timestamp if ISO string
      const startTimestamp = typeof startTime === 'string' 
        ? Math.floor(new Date(startTime).getTime() / 1000)
        : startTime;
      
      const endTimestamp = typeof endTime === 'string'
        ? Math.floor(new Date(endTime).getTime() / 1000)
        : endTime;

      console.log('📅 Creating voting session...');
      console.log('   Name:', sessionName);
      console.log('   Start:', new Date(startTimestamp * 1000).toLocaleString());
      console.log('   End:', new Date(endTimestamp * 1000).toLocaleString());

      const adminWallet = blockchainConfig.getAdminWallet();
      const contract = blockchainConfig.getContractWithSigner(adminWallet);

      const tx = await contract.createVotingSession(
        startTimestamp,
        endTimestamp,
        sessionName
      );

      console.log('📤 Transaction sent:', tx.hash);

      const receipt = await tx.wait();

      console.log('✅ Voting session created successfully');

      return ResponseFormatter.success(
        res,
        {
          sessionName,
          startTime: new Date(startTimestamp * 1000).toISOString(),
          endTime: new Date(endTimestamp * 1000).toISOString(),
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber,
        },
        'Voting session created successfully',
        201
      );
    } catch (error) {
      console.error('Create voting session error:', error);

      if (error.message.includes('End time must be after start time')) {
        return ResponseFormatter.error(res, 'End time must be after start time', 400);
      }

      next(error);
    }
  }

  /**
   * Activate/Deactivate voting
   */
  static async setVotingActive(req, res, next) {
    try {
      const { active } = req.body;

      if (typeof active !== 'boolean') {
        return ResponseFormatter.validationError(res, {
          active: 'Active status (boolean) is required',
        });
      }

      console.log(`${active ? '🔓 Activating' : '🔒 Deactivating'} voting...`);

      const adminWallet = blockchainConfig.getAdminWallet();
      const contract = blockchainConfig.getContractWithSigner(adminWallet);

      const tx = await contract.setVotingActive(active);

      console.log('📤 Transaction sent:', tx.hash);

      const receipt = await tx.wait();

      console.log(`✅ Voting ${active ? 'activated' : 'deactivated'} successfully`);

      return ResponseFormatter.success(res, {
        active,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      }, `Voting ${active ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Set voting active error:', error);

      if (error.message.includes('Session not started yet')) {
        return ResponseFormatter.error(res, 'Voting session has not started yet', 400);
      }

      next(error);
    }
  }

  /**
   * Emergency pause
   */
  static async emergencyPause(req, res, next) {
    try {
      const { reason } = req.body;

      console.log('🚨 Emergency pause initiated');
      console.log('   Reason:', reason || 'No reason provided');

      const adminWallet = blockchainConfig.getAdminWallet();
      const contract = blockchainConfig.getContractWithSigner(adminWallet);

      const tx = await contract.emergencyPause(reason || 'Emergency pause');

      console.log('📤 Transaction sent:', tx.hash);

      const receipt = await tx.wait();

      console.log('✅ Emergency pause executed');

      return ResponseFormatter.success(res, {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        reason: reason || 'Emergency pause',
      }, 'Emergency pause executed successfully');
    } catch (error) {
      console.error('Emergency pause error:', error);
      next(error);
    }
  }

  /**
   * Reset user password (admin)
   */
  static async resetUserPassword(req, res, next) {
    try {
      const { nim, newPassword } = req.body;

      if (!nim || !newPassword) {
        return ResponseFormatter.validationError(res, {
          nim: nim ? null : 'NIM is required',
          newPassword: newPassword ? null : 'New password is required',
        });
      }

      if (newPassword.length < 8) {
        return ResponseFormatter.validationError(res, {
          newPassword: 'Password must be at least 8 characters',
        });
      }

      console.log('🔐 Admin resetting password for:', nim);

      const { ethers } = require('ethers');
      const newPasswordHash = ethers.id(newPassword);

      const adminWallet = blockchainConfig.getAdminWallet();
      const contract = blockchainConfig.getContractWithSigner(adminWallet);

      const tx = await contract.resetPassword(nim, newPasswordHash);

      console.log('📤 Transaction sent:', tx.hash);

      const receipt = await tx.wait();

      console.log('✅ Password reset successfully');

      return ResponseFormatter.success(res, {
        nim,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      }, 'Password reset successfully');
    } catch (error) {
      console.error('Reset password error:', error);
      next(error);
    }
  }

  /**
   * Get all users count
   */
  static async getUsersCount(req, res, next) {
    try {
      const stats = await BlockchainService.getContractStats();

      return ResponseFormatter.success(res, {
        totalUsers: stats.totalUsers,
        totalVoters: stats.totalUsers,
      });
    } catch (error) {
      console.error('Get users count error:', error);
      next(error);
    }
  }

  /**
   * Check wallet balance
   */
  static async checkWalletBalance(req, res, next) {
    try {
      const { address } = req.params;

      if (!address) {
        return ResponseFormatter.validationError(res, {
          address: 'Wallet address is required',
        });
      }

      const balance = await blockchainConfig.getProvider().getBalance(address);

      return ResponseFormatter.success(res, {
        address,
        balance: ethers.formatEther(balance),
        balanceWei: balance.toString(),
      });
    } catch (error) {
      console.error('Check wallet balance error:', error);
      next(error);
    }
  }

  /**
   * Get admin wallet balance
   */
  static async getAdminBalance(req, res, next) {
    try {
      const adminWallet = blockchainConfig.getAdminWallet();
      const balance = await blockchainConfig.getProvider().getBalance(adminWallet.address);

      return ResponseFormatter.success(res, {
        address: adminWallet.address,
        balance: ethers.formatEther(balance),
        balanceWei: balance.toString(),
      });
    } catch (error) {
      console.error('Get admin balance error:', error);
      next(error);
    }
  }

  /**
   * Refund user wallet
   */
  static async refundUserWallet(req, res, next) {
    try {
      const { address } = req.body;

      if (!address) {
        return ResponseFormatter.validationError(res, {
          address: 'Wallet address is required',
        });
      }

      console.log('💰 Refunding wallet:', address);

      const WalletService = require('../services/walletService');
      const result = await WalletService.refundWalletIfNeeded(address);

      if (result.refunded) {
        return ResponseFormatter.success(res, result, 'Wallet refunded successfully');
      } else {
        return ResponseFormatter.success(res, {
          refunded: false,
          message: 'Wallet balance is sufficient, no refund needed',
          balance: result.balance,
        });
      }
    } catch (error) {
      console.error('Refund wallet error:', error);
      next(error);
    }
  }
}

module.exports = AdminController;
