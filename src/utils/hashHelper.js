const { ethers } = require('ethers');

class HashHelper {
  static hashPassword(password) {
    // Ethereum keccak256 hash
    return ethers.id(password);
  }

  static createMessageHash(message) {
    return ethers.id(message);
  }

  static verifyPasswordHash(password, hash) {
    return this.hashPassword(password) === hash;
  }
}

module.exports = HashHelper;
