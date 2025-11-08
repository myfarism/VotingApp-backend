const crypto = require('crypto');

class OTPService {
  constructor() {
    // In-memory storage untuk OTP (production: gunakan Redis atau database)
    this.otpStore = new Map();
    
    // Cleanup expired OTPs setiap 5 menit
    setInterval(() => this.cleanupExpiredOTPs(), 5 * 60 * 1000);
  }

  /**
   * Generate OTP 6 digit
   */
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Store OTP dengan expiry time
   */
  storeOTP(email, otp, expiryMinutes = 10) {
    const expiryTime = Date.now() + expiryMinutes * 60 * 1000;
    
    this.otpStore.set(email, {
      otp,
      expiryTime,
      attempts: 0,
      createdAt: Date.now(),
    });

    console.log(`🔐 OTP stored for ${email}, expires in ${expiryMinutes} minutes`);
  }

  /**
   * Verify OTP
   */
  verifyOTP(email, otp) {
    const stored = this.otpStore.get(email);

    if (!stored) {
      return {
        valid: false,
        error: 'OTP not found or expired',
      };
    }

    // Check expiry
    if (Date.now() > stored.expiryTime) {
      this.otpStore.delete(email);
      return {
        valid: false,
        error: 'OTP expired',
      };
    }

    // Increment attempts
    stored.attempts++;

    // Check max attempts (5 attempts)
    if (stored.attempts > 5) {
      this.otpStore.delete(email);
      return {
        valid: false,
        error: 'Too many failed attempts',
      };
    }

    // Verify OTP
    if (stored.otp !== otp) {
      return {
        valid: false,
        error: 'Invalid OTP',
        attemptsLeft: 5 - stored.attempts,
      };
    }

    // Success - remove OTP
    this.otpStore.delete(email);

    return {
      valid: true,
      message: 'OTP verified successfully',
    };
  }

  /**
   * Check if OTP exists for email
   */
  hasOTP(email) {
    const stored = this.otpStore.get(email);
    
    if (!stored) return false;
    
    // Check if expired
    if (Date.now() > stored.expiryTime) {
      this.otpStore.delete(email);
      return false;
    }
    
    return true;
  }

  /**
   * Delete OTP
   */
  deleteOTP(email) {
    this.otpStore.delete(email);
    console.log(`🗑️  OTP deleted for ${email}`);
  }

  /**
   * Cleanup expired OTPs
   */
  cleanupExpiredOTPs() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [email, data] of this.otpStore.entries()) {
      if (now > data.expiryTime) {
        this.otpStore.delete(email);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired OTPs`);
    }
  }

  /**
   * Get OTP info (for debugging)
   */
  getOTPInfo(email) {
    const stored = this.otpStore.get(email);
    
    if (!stored) return null;
    
    const isExpired = Date.now() > stored.expiryTime;
    const timeLeft = Math.max(0, Math.floor((stored.expiryTime - Date.now()) / 1000));
    
    return {
      exists: true,
      expired: isExpired,
      attempts: stored.attempts,
      timeLeftSeconds: timeLeft,
      createdAt: new Date(stored.createdAt).toISOString(),
    };
  }

  /**
   * Get all stored OTPs count (for monitoring)
   */
  getStoredOTPsCount() {
    return this.otpStore.size;
  }
}

// Singleton instance
const otpService = new OTPService();

module.exports = otpService;
