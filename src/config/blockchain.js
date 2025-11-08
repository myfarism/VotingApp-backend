const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

class BlockchainConfig {
  constructor() {
    this.provider = null;
    this.contract = null;
    this.adminWallet = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      console.log('🔗 Connecting to blockchain...');

      // Connect to blockchain
      this.provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);

      // Test connection
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();

      console.log('✅ Connected to blockchain');
      console.log('   Network:', network.name);
      console.log('   Chain ID:', network.chainId.toString());
      console.log('   Block Number:', blockNumber);

      // Initialize admin wallet
      this.adminWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, this.provider);

      console.log('🔑 Admin wallet loaded:', this.adminWallet.address);

      // Load contract
      if (!process.env.CONTRACT_ADDRESS) {
        throw new Error('CONTRACT_ADDRESS not set in environment');
      }

      await this.loadContract();
      this.initialized = true;

      return true;
    } catch (error) {
      console.error('❌ Blockchain initialization failed:', error.message);
      throw error;
    }
  }

  async loadContract() {
    try {
      // Load ABI
      const abiPath = path.join(__dirname, '../../contract/VotingContract-ABI.json');

      if (!fs.existsSync(abiPath)) {
        throw new Error(
          'ABI file not found. Copy VotingContract-ABI.json from hardhat project to contract/ folder'
        );
      }

      const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

      // ✅ PERBAIKAN: Gunakan adminWallet (signer) bukan provider
      this.contract = new ethers.Contract(
        process.env.CONTRACT_ADDRESS, 
        abi, 
        this.adminWallet  // <-- Ubah dari this.provider ke this.adminWallet
      );

      // Verify contract
      const owner = await this.contract.owner();
      const stats = await this.contract.getContractStats();

      console.log('📜 Contract loaded:', process.env.CONTRACT_ADDRESS);
      console.log('   Owner:', owner);
      console.log('   Total Users:', stats[0].toString());
      console.log('   Total Candidates:', stats[1].toString());
    } catch (error) {
      console.error('❌ Contract loading failed:', error.message);
      throw error;
    }
    }


  getProvider() {
    if (!this.initialized) {
      throw new Error('Blockchain not initialized');
    }
    return this.provider;
  }

  getContract() {
    if (!this.contract) {
      throw new Error('Contract not loaded');
    }
    return this.contract;
  }

  getAdminWallet() {
    if (!this.adminWallet) {
      throw new Error('Admin wallet not initialized');
    }
    return this.adminWallet;
  }

  getContractWithSigner(signer) {
    return this.contract.connect(signer);
  }

  async getBlockNumber() {
    return await this.provider.getBlockNumber();
  }

  async getBalance(address) {
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }
}

// Singleton instance
const blockchainConfig = new BlockchainConfig();

module.exports = blockchainConfig;
