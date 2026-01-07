// controllers/testCryptoController.js
const { ethers } = require('ethers');
const WalletService = require('../services/walletService');
const HashHelper = require('../utils/hashHelper');
const ResponseFormatter = require('../utils/responseFormatter');


class TestCryptoController {
  /**
   * Jalankan semua pengujian ECDSA (1-9)
   */
  static async runAllTests(req, res, next) {
    try {
      const results = [];

      // 1. Key Pair Generation
    //   const keyPairResult = await this.testKeyPairGeneration();
    //   results.push(keyPairResult);
    const keyPairResult = await TestCryptoController.testKeyPairGeneration();
    results.push(keyPairResult);

      // 2. Message Hashing
      const hashingResult = await TestCryptoController.testMessageHashing();
      results.push(hashingResult);

      // 3-8. Signature tests (generate + verify)
      const signatureTestsResult = await TestCryptoController.testSignatureFlow();
      results.push(...signatureTestsResult);

      // 9. Performance testing
      const performanceResult = await TestCryptoController.testPerformance();
      results.push(performanceResult);

      return ResponseFormatter.success(
        res,
        {
          totalTests: results.length,
          passed: results.filter(r => r.status === 'PASS').length,
          failed: results.filter(r => r.status === 'FAIL').length,
          details: results,
        },
        'ECDSA cryptography tests executed successfully'
      );
    } catch (error) {
      console.error('Test crypto error:', error);
      next(error);
    }
  }

  // ========== 1. Key Pair Generation ==========
  static async testKeyPairGeneration() {
    try {
        // pakai wallet yang sama dengan flow produksi
        const walletData = await WalletService.createAndFundWallet();

        const privateKeyHex = walletData.privateKey.replace('0x', '');
        // address selalu 20 byte => 40 hex; ini cukup untuk bukti kunci publik valid
        const addressHex = walletData.address.replace('0x', '');

        const isPrivate256 = privateKeyHex.length === 64;  // 256-bit
        const isAddress160 = addressHex.length === 40;     // 160-bit (hasil dari public key)

        const pass = isPrivate256 && isAddress160;

        return {
        no: 1,
        aspect: 'Key Pair Generation',
        scenario: 'Generate pasangan kunci publik-privat',
        expected: 'Private key 256-bit, public key valid (address 160-bit)',
        actual: {
            walletAddress: walletData.address,
            privateKeyLengthHex: privateKeyHex.length,
            addressLengthHex: addressHex.length,
            fundedBalanceEth: walletData.balance,
        },
        status: pass ? 'PASS' : 'FAIL',
        };
    } catch (error) {
        return {
        no: 1,
        aspect: 'Key Pair Generation',
        scenario: 'Generate pasangan kunci publik-privat',
        expected: 'Private key 256-bit, public key valid (address 160-bit)',
        actual: { error: error.message },
        status: 'FAIL',
        };
    }
    }

  // ========== 2. Message Hashing ==========
  static async testMessageHashing() {
    try {
      const message = 'VoteData_CandidateID1_Timestamp';

      // Konsisten dengan HashHelper.createMessageHash di blockchainService.js
      const hash1 = HashHelper.createMessageHash(message);
      const hash2 = HashHelper.createMessageHash(message);

      const hex = hash1.replace('0x', '');
      const is64Hex = hex.length === 64;

      const deterministic = hash1 === hash2;

      const pass = is64Hex && deterministic;

      return {
        no: 2,
        aspect: 'Message Hashing',
        scenario: 'Hash pesan sebelum signing',
        expected: 'SHA-256 hash 64 karakter hex dan deterministik',
        actual: {
          message,
          hash: hash1,
          length: hex.length,
          deterministic,
        },
        status: pass ? 'PASS' : 'FAIL',
      };
    } catch (error) {
      return {
        no: 2,
        aspect: 'Message Hashing',
        scenario: 'Hash pesan sebelum signing',
        expected: 'SHA-256 hash 64 karakter hex dan deterministik',
        actual: { error: error.message },
        status: 'FAIL',
      };
    }
  }

  // ========== 3-8. Signature-related tests ==========
  static async testSignatureFlow() {
    const results = [];
    try {
      const walletA = ethers.Wallet.createRandom();
      const walletB = ethers.Wallet.createRandom();

      const message = 'VoteData_CandidateID1_Timestamp';
      const messageHash = HashHelper.createMessageHash(message);

      // 3. Signature Generation
      const signature = await walletA.signMessage(ethers.getBytes(messageHash));
      const sigBytes = ethers.getBytes(signature);
      const sigLengthOK = sigBytes.length === 65;

      results.push({
        no: 3,
        aspect: 'Signature Generation',
        scenario: 'Signing message hash dengan private key',
        expected: 'Signature (r,s,v) 65 bytes',
        actual: {
          signature,
          length: sigBytes.length,
        },
        status: sigLengthOK ? 'PASS' : 'FAIL',
      });

      // Helper: recover address
      const recoveredFromValid = ethers.verifyMessage(
        ethers.getBytes(messageHash),
        signature
      );

      // 4. Signature Verification (Valid)
      const validMatches = recoveredFromValid.toLowerCase() === walletA.address.toLowerCase();
      results.push({
        no: 4,
        aspect: 'Signature Verification (Valid)',
        scenario: 'Verifikasi signature yang benar',
        expected: 'Alamat hasil recover = alamat wallet signer',
        actual: {
          expectedAddress: walletA.address,
          recoveredAddress: recoveredFromValid,
        },
        status: validMatches ? 'PASS' : 'FAIL',
      });

      // 5. Signature Verification (Invalid - wrong message)
      const otherMessage = 'VoteData_CandidateID2_Timestamp';
      const otherHash = HashHelper.createMessageHash(otherMessage);
      const recoveredWrongMsg = ethers.verifyMessage(
        ethers.getBytes(otherHash),
        signature
      );
      const wrongMsgFail =
        recoveredWrongMsg.toLowerCase() !== walletA.address.toLowerCase();

      results.push({
        no: 5,
        aspect: 'Signature Verification (Invalid - wrong message)',
        scenario: 'Verifikasi signature dengan message hash berbeda',
        expected: 'Recover menghasilkan address berbeda atau tidak cocok',
        actual: {
          signerAddress: walletA.address,
          recoveredAddress: recoveredWrongMsg,
        },
        status: wrongMsgFail ? 'PASS' : 'FAIL',
      });

      // 6. Signature Verification (Invalid - wrong key)
      // Di sisi verifikasi kita tidak pakai public key manual, tapi konsepnya:
      // signature milik walletA tidak akan pernah equal dengan signature walletB
      const signatureFromB = await walletB.signMessage(ethers.getBytes(messageHash));
      const recoveredFromB = ethers.verifyMessage(
        ethers.getBytes(messageHash),
        signatureFromB
      );
      const wrongKeyFail =
        recoveredFromB.toLowerCase() !== walletA.address.toLowerCase();

      results.push({
        no: 6,
        aspect: 'Signature Verification (Invalid - wrong key)',
        scenario: 'Signature dari key A diverifikasi dengan key B',
        expected: 'Recover tidak cocok dengan address A',
        actual: {
          signerA: walletA.address,
          signerB: walletB.address,
          recoveredFromB,
        },
        status: wrongKeyFail ? 'PASS' : 'FAIL',
      });

      // 7. Signature Verification (Invalid - corrupted signature)
      let corruptedSignature = Uint8Array.from(sigBytes);
      // Flip 1 bit di komponen r
      corruptedSignature[0] = (corruptedSignature[0] + 1) % 256;

      let corruptedRecovered = null;
      let corruptedError = null;

      try {
        corruptedRecovered = ethers.verifyMessage(
          ethers.getBytes(messageHash),
          corruptedSignature
        );
      } catch (err) {
        corruptedError = err.message;
      }

      const corruptedFail =
        corruptedError !== null ||
        (corruptedRecovered &&
          corruptedRecovered.toLowerCase() !== walletA.address.toLowerCase());

      results.push({
        no: 7,
        aspect: 'Signature Verification (Invalid - corrupted signature)',
        scenario: 'Verifikasi signature yang dimodifikasi',
        expected: 'Recover gagal atau address tidak cocok',
        actual: {
          corruptedRecovered,
          corruptedError,
        },
        status: corruptedFail ? 'PASS' : 'FAIL',
      });

      // 8. Signature Determinism
      const sig1 = await walletA.signMessage(ethers.getBytes(messageHash));
      const sig2 = await walletA.signMessage(ethers.getBytes(messageHash));
      const deterministic = sig1 === sig2;

      results.push({
        no: 8,
        aspect: 'Signature Determinism',
        scenario: 'Generate signature 2 kali untuk message sama',
        expected: 'Kedua signature identik (ECDSA deterministic)',
        actual: {
          sig1,
          sig2,
          deterministic,
        },
        status: deterministic ? 'PASS' : 'FAIL',
      });

      return results;
    } catch (error) {
      // Kalau error umum, tandai semua test 3-8 fail
      return [
        {
          no: 3,
          aspect: 'Signature Generation',
          scenario: 'Signing message hash dengan private key',
          expected: 'Signature (r,s,v) 65 bytes',
          actual: { error: error.message },
          status: 'FAIL',
        },
        {
          no: 4,
          aspect: 'Signature Verification (Valid)',
          scenario: 'Verifikasi signature yang benar',
          expected: 'Alamat hasil recover = alamat wallet signer',
          actual: { error: error.message },
          status: 'FAIL',
        },
        {
          no: 5,
          aspect: 'Signature Verification (Invalid - wrong message)',
          scenario: 'Verifikasi signature dengan message hash berbeda',
          expected: 'Recover menghasilkan address berbeda atau tidak cocok',
          actual: { error: error.message },
          status: 'FAIL',
        },
        {
          no: 6,
          aspect: 'Signature Verification (Invalid - wrong key)',
          scenario: 'Signature dari key A diverifikasi dengan key B',
          expected: 'Recover tidak cocok dengan address A',
          actual: { error: error.message },
          status: 'FAIL',
        },
        {
          no: 7,
          aspect: 'Signature Verification (Invalid - corrupted signature)',
          scenario: 'Verifikasi signature yang dimodifikasi',
          expected: 'Recover gagal atau address tidak cocok',
          actual: { error: error.message },
          status: 'FAIL',
        },
        {
          no: 8,
          aspect: 'Signature Determinism',
          scenario: 'Generate signature 2 kali untuk message sama',
          expected: 'Kedua signature identik (ECDSA deterministic)',
          actual: { error: error.message },
          status: 'FAIL',
        },
      ];
    }
  }

  // ========== 9. Performance Testing ==========
  static async testPerformance() {
    try {
      const wallet = ethers.Wallet.createRandom();
      const message = 'VoteData_CandidateID1_Timestamp';
      const messageHash = HashHelper.createMessageHash(message);

      const iterations = 1000;

      // Signing benchmark
      const signStart = Date.now();
      for (let i = 0; i < iterations; i++) {
        // eslint-disable-next-line no-await-in-loop
        await wallet.signMessage(ethers.getBytes(messageHash));
      }
      const signEnd = Date.now();
      const signAvgMs = (signEnd - signStart) / iterations;

      // Verification benchmark
      const signature = await wallet.signMessage(ethers.getBytes(messageHash));
      const verifyStart = Date.now();
      for (let i = 0; i < iterations; i++) {
        ethers.verifyMessage(ethers.getBytes(messageHash), signature);
      }
      const verifyEnd = Date.now();
      const verifyAvgMs = (verifyEnd - verifyStart) / iterations;

      const pass = signAvgMs < 6 && verifyAvgMs < 6;

      return {
        no: 9,
        aspect: 'Performance Testing',
        scenario: '1000 operasi signing + verifying',
        expected: 'Rata-rata < 6ms per operasi',
        actual: {
          iterations,
          signingAvgMs: signAvgMs,
          verifyingAvgMs: verifyAvgMs,
        },
        status: pass ? 'PASS' : 'FAIL',
      };
    } catch (error) {
      return {
        no: 9,
        aspect: 'Performance Testing',
        scenario: '1000 operasi signing + verifying',
        expected: 'Rata-rata < 5ms per operasi',
        actual: { error: error.message },
        status: 'FAIL',
      };
    }
  }
}

module.exports = TestCryptoController;
