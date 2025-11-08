const { ethers } = require('ethers');
const blockchainConfig = require('../config/blockchain');
const EncryptionHelper = require('../utils/encryptionHelper');

class WalletService {
  /**
   * Create new wallet and fund it with ETH
   */
  static async createAndFundWallet() {
    try {
      console.log('🔐 Creating new wallet...');

      // Generate random wallet
      const wallet = ethers.Wallet.createRandom();

      console.log('💳 New wallet created:', wallet.address);

      // Fund wallet with ETH (for gas fees)
      const fundingAmount = process.env.WALLET_FUNDING_AMOUNT || '0.1';
      const adminWallet = blockchainConfig.getAdminWallet();

      console.log(`💰 Funding wallet with ${fundingAmount} ETH...`);

      const fundTx = await adminWallet.sendTransaction({
        to: wallet.address,
        value: ethers.parseEther(fundingAmount),
      });

      console.log('📤 Funding transaction hash:', fundTx.hash);

      const receipt = await fundTx.wait();

      console.log('✅ Wallet funded successfully');
      console.log('   Block number:', receipt.blockNumber);
      console.log('   Gas used:', receipt.gasUsed.toString());

      // Get balance to verify
      const balance = await blockchainConfig.getProvider().getBalance(wallet.address);
      console.log('💎 Wallet balance:', ethers.formatEther(balance), 'ETH');

      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        balance: ethers.formatEther(balance),
        fundingTxHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error('❌ Error creating and funding wallet:', error);
      throw error;
    }
  }

  /**
   * Encrypt private key untuk storage
   */
  static encryptPrivateKey(privateKey) {
    return EncryptionHelper.encrypt(privateKey);
  }

  /**
   * Decrypt private key dari storage
   */
  static decryptPrivateKey(encryptedData) {
    return EncryptionHelper.decrypt(encryptedData);
  }

  /**
   * Get wallet instance dari encrypted private key
   */
  static getWalletFromEncrypted(encryptedPrivateKey) {
    const privateKey = this.decryptPrivateKey(encryptedPrivateKey);
    const provider = blockchainConfig.getProvider();
    return new ethers.Wallet(privateKey, provider);
  }

  /**
   * Check wallet balance
   */
  static async checkBalance(address) {
    try {
      const balance = await blockchainConfig.getProvider().getBalance(address);
      return {
        address,
        balance: ethers.formatEther(balance),
        balanceWei: balance.toString(),
      };
    } catch (error) {
      console.error('Error checking balance:', error);
      throw error;
    }
  }

  /**
   * Refund wallet if balance is low
   */
  static async refundWalletIfNeeded(address) {
    try {
      const balance = await blockchainConfig.getProvider().getBalance(address);
      const balanceETH = parseFloat(ethers.formatEther(balance));

      const minBalance = parseFloat(process.env.MIN_WALLET_BALANCE || '0.01');
      const refundAmount = process.env.WALLET_REFUND_AMOUNT || '0.05';

      if (balanceETH < minBalance) {
        console.log(`💰 Wallet ${address} balance low (${balanceETH} ETH). Refunding...`);

        const adminWallet = blockchainConfig.getAdminWallet();

        const refundTx = await adminWallet.sendTransaction({
          to: address,
          value: ethers.parseEther(refundAmount),
        });

        const receipt = await refundTx.wait();

        console.log('✅ Wallet refunded successfully');
        console.log('   Amount:', refundAmount, 'ETH');
        console.log('   Tx hash:', receipt.hash);

        return {
          refunded: true,
          amount: refundAmount,
          txHash: receipt.hash,
        };
      }

      return {
        refunded: false,
        balance: balanceETH.toString(),
      };
    } catch (error) {
      console.error('Error refunding wallet:', error);
      throw error;
    }
  }

  /**
   * Estimate gas fee untuk transaction
   */
  static async estimateGasFee(transaction) {
    try {
      const provider = blockchainConfig.getProvider();
      const gasEstimate = await provider.estimateGas(transaction);
      const feeData = await provider.getFeeData();

      const gasCost = gasEstimate * feeData.gasPrice;

      return {
        gasLimit: gasEstimate.toString(),
        gasPrice: ethers.formatUnits(feeData.gasPrice, 'gwei'),
        estimatedCost: ethers.formatEther(gasCost),
        estimatedCostWei: gasCost.toString(),
      };
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw error;
    }
  }
}

module.exports = WalletService;
