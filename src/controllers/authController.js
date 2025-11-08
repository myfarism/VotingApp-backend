const BlockchainService = require('../services/blockchainService');
const WalletService = require('../services/walletService');
const EmailService = require('../services/emailService');
const OTPService = require('../services/otpService');
const ResponseFormatter = require('../utils/responseFormatter');
const jwt = require('jsonwebtoken');

class AuthController {
  /**
   * Register user - Step 1: Create wallet & send OTP
   */
  static async registerUser(req, res, next) {
    try {
      const { email, username, nim, prodi, password } = req.body;

      // Validation
      if (!email || !username || !nim || !prodi || !password) {
        return ResponseFormatter.validationError(res, {
          email: email ? null : 'Email is required',
          username: username ? null : 'Username is required',
          nim: nim ? null : 'NIM is required',
          prodi: prodi ? null : 'Program Studi is required',
          password: password ? null : 'Password is required',
        });
      }

      // Password strength validation
      if (password.length < 8) {
        return ResponseFormatter.validationError(res, {
          password: 'Password must be at least 8 characters',
        });
      }

      console.log('📝 Starting user registration...');
      console.log('   Email:', email);
      console.log('   NIM:', nim);

      // Check if user already exists on blockchain
      try {
        await BlockchainService.getUserByNIM(nim);
        return ResponseFormatter.error(res, 'NIM already registered', 400);
      } catch (error) {
        // User not found - good, we can proceed
      }

      // Create and fund wallet
      console.log('🔐 Creating and funding wallet...');
      const walletData = await WalletService.createAndFundWallet();

      // Encrypt private key
      const encryptedPrivateKey = WalletService.encryptPrivateKey(walletData.privateKey);

      console.log('🔒 Private key encrypted successfully');

      // Generate OTP
      const otp = OTPService.generateOTP();

      // Store OTP
      OTPService.storeOTP(email, otp, 10); // 10 minutes expiry

      // Store temporary registration data (in-memory - production: use Redis)
      global.pendingRegistrations = global.pendingRegistrations || new Map();
      global.pendingRegistrations.set(email, {
        email,
        username,
        nim,
        prodi,
        password,
        walletAddress: walletData.address,
        encryptedPrivateKey,
        createdAt: Date.now(),
      });

      // Send OTP via email
      await EmailService.sendOTP(email, otp);

      console.log('✅ Registration initiated successfully');
      console.log('   Wallet:', walletData.address);
      console.log('   OTP sent to:', email);

      return ResponseFormatter.success(
        res,
        {
          email,
          nim,
          walletAddress: walletData.address,
          message: 'OTP sent to your email. Please verify to complete registration.',
        },
        'Registration initiated. Please verify OTP.',
        201
      );
    } catch (error) {
      console.error('Registration error:', error);
      next(error);
    }
  }

  /**
   * Verify OTP - Step 2: Complete registration on blockchain
   */
  static async verifyOTP(req, res, next) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return ResponseFormatter.validationError(res, {
          email: email ? null : 'Email is required',
          otp: otp ? null : 'OTP is required',
        });
      }

      console.log('🔍 Verifying OTP for:', email);

      // Verify OTP
      const verification = OTPService.verifyOTP(email, otp);

      if (!verification.valid) {
        return ResponseFormatter.error(res, verification.error, 400);
      }

      // Get pending registration data
      global.pendingRegistrations = global.pendingRegistrations || new Map();
      const pendingData = global.pendingRegistrations.get(email);

      if (!pendingData) {
        return ResponseFormatter.error(res, 'Registration session expired. Please register again.', 400);
      }

      console.log('✅ OTP verified successfully');
      console.log('⛓️  Registering user to blockchain...');

      // Register user to blockchain
      const blockchainResult = await BlockchainService.registerUser({
        nim: pendingData.nim,
        email: pendingData.email,
        username: pendingData.username,
        prodi: pendingData.prodi,
        password: pendingData.password,
        walletAddress: pendingData.walletAddress,
      });

      console.log('✅ User registered on blockchain');
      console.log('   Transaction:', blockchainResult.txHash);

      // Clean up pending registration
      global.pendingRegistrations.delete(email);

      // Send success email
      await EmailService.sendRegistrationSuccess(email, pendingData.username);

      // Generate JWT token
      const token = jwt.sign(
        {
          nim: pendingData.nim,
          email: pendingData.email,
          walletAddress: pendingData.walletAddress,
          role: 'user',
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY }
      );

      return ResponseFormatter.success(
        res,
        {
          token,
          user: {
            nim: pendingData.nim,
            email: pendingData.email,
            username: pendingData.username,
            prodi: pendingData.prodi,
            walletAddress: pendingData.walletAddress,
          },
          encryptedPrivateKey: pendingData.encryptedPrivateKey,
          blockchain: {
            txHash: blockchainResult.txHash,
            blockNumber: blockchainResult.blockNumber,
          },
        },
        'Email verified and registration completed successfully'
      );
    } catch (error) {
      console.error('OTP verification error:', error);
      next(error);
    }
  }

  /**
   * Resend OTP
   */
  static async resendOTP(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return ResponseFormatter.validationError(res, {
          email: 'Email is required',
        });
      }

      console.log('📧 Resending OTP to:', email);

      // Check if there's pending registration
      global.pendingRegistrations = global.pendingRegistrations || new Map();
      const pendingData = global.pendingRegistrations.get(email);

      if (!pendingData) {
        return ResponseFormatter.error(res, 'No pending registration found for this email', 404);
      }

      // Delete old OTP
      OTPService.deleteOTP(email);

      // Generate new OTP
      const otp = OTPService.generateOTP();

      // Store new OTP
      OTPService.storeOTP(email, otp, 10);

      // Send OTP
      await EmailService.sendOTP(email, otp);

      console.log('✅ OTP resent successfully');

      return ResponseFormatter.success(res, { email }, 'OTP has been resent to your email');
    } catch (error) {
      console.error('Resend OTP error:', error);
      next(error);
    }
  }

  /**
   * Login
   */
  static async loginUser(req, res, next) {
    try {
      const { nim, password } = req.body;

      if (!nim || !password) {
        return ResponseFormatter.validationError(res, {
          nim: nim ? null : 'NIM is required',
          password: password ? null : 'Password is required',
        });
      }

      console.log('🔐 Login attempt for:', nim);

      // Verify credentials via blockchain
      const loginResult = await BlockchainService.login(nim, password);

      if (!loginResult.success) {
        return ResponseFormatter.error(res, 'Invalid credentials', 401);
      }

      console.log('✅ Login successful');

      // Get user info
      const userInfo = loginResult.user;

      // Generate JWT token
      const token = jwt.sign(
        {
          nim: nim,
          email: userInfo.email,
          walletAddress: userInfo.walletAddress,
          prodi: userInfo.prodi,
          role: 'user',
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY }
      );

      // Check if user has voted
      const hasVoted = await BlockchainService.hasVoted(userInfo.walletAddress);

      return ResponseFormatter.success(res, {
        token,
        user: {
          nim: nim,
          email: userInfo.email,
          username: userInfo.username,
          prodi: userInfo.prodi,
          walletAddress: userInfo.walletAddress,
          hasVoted: hasVoted,
        },
      }, 'Login successful');
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.message.includes('Invalid credentials')) {
        return ResponseFormatter.error(res, 'Invalid NIM or password', 401);
      }
      if (error.message.includes('locked')) {
        return ResponseFormatter.error(res, error.message, 423);
      }
      
      next(error);
    }
  }

  /**
   * Get user profile
   */
  static async getUserProfile(req, res, next) {
    try {
      const nim = req.user.nim;

      const userInfo = await BlockchainService.getUserByNIM(nim);
      const hasVoted = await BlockchainService.hasVoted(userInfo.walletAddress);

      return ResponseFormatter.success(res, {
        nim: nim,
        email: userInfo.email,
        username: userInfo.username,
        prodi: userInfo.prodi,
        walletAddress: userInfo.walletAddress,
        isRegistered: userInfo.isRegistered,
        registeredAt: userInfo.registeredAt,
        lastLoginAt: userInfo.lastLoginAt,
        hasVoted: hasVoted,
      }, 'Profile retrieved successfully');
    } catch (error) {
      console.error('Get profile error:', error);
      next(error);
    }
  }

  /**
   * Change password
   */
  static async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword, encryptedPrivateKey } = req.body;
      const nim = req.user.nim;

      if (!oldPassword || !newPassword || !encryptedPrivateKey) {
        return ResponseFormatter.validationError(res, {
          oldPassword: oldPassword ? null : 'Old password is required',
          newPassword: newPassword ? null : 'New password is required',
          encryptedPrivateKey: encryptedPrivateKey ? null : 'Encrypted private key is required',
        });
      }

      if (newPassword.length < 8) {
        return ResponseFormatter.validationError(res, {
          newPassword: 'New password must be at least 8 characters',
        });
      }

      if (oldPassword === newPassword) {
        return ResponseFormatter.error(res, 'New password must be different from old password', 400);
      }

      console.log('🔐 Changing password for:', nim);

      const result = await BlockchainService.changePassword(nim, oldPassword, newPassword, encryptedPrivateKey);

      console.log('✅ Password changed successfully');

      return ResponseFormatter.success(res, {
        txHash: result.txHash,
        blockNumber: result.blockNumber,
      }, 'Password changed successfully');
    } catch (error) {
      console.error('Change password error:', error);

      if (error.message.includes('incorrect')) {
        return ResponseFormatter.error(res, 'Current password is incorrect', 401);
      }

      next(error);
    }
  }
}

module.exports = AuthController;
