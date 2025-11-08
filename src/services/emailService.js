const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendOTP(email, otp) {
    if (!this.transporter) {
      console.log('📧 [DEMO MODE] OTP for', email, ':', otp);
      return { success: true, demo: true };
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Verifikasi Akun - Sistem Voting',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Verifikasi Akun Anda</h2>
            <p>Terima kasih telah mendaftar di Sistem Voting Blockchain.</p>
            <p>Gunakan kode OTP berikut untuk memverifikasi akun Anda:</p>
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #2563eb; font-size: 36px; margin: 0; letter-spacing: 8px;">${otp}</h1>
            </div>
            <p>Kode OTP ini berlaku selama <strong>10 menit</strong>.</p>
            <p>Jika Anda tidak melakukan pendaftaran, abaikan email ini.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px;">
              Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
            </p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ OTP email sent to:', email);

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send OTP email:', error);
      throw error;
    }
  }

  async sendPasswordResetOTP(email, otp) {
    if (!this.transporter) {
      console.log('📧 [DEMO MODE] Reset OTP for', email, ':', otp);
      return { success: true, demo: true };
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Reset Password - Sistem Voting',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Reset Password</h2>
            <p>Anda telah meminta untuk mereset password akun Anda.</p>
            <p>Gunakan kode OTP berikut untuk mereset password:</p>
            <div style="background-color: #fef2f2; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #dc2626; font-size: 36px; margin: 0; letter-spacing: 8px;">${otp}</h1>
            </div>
            <p>Kode OTP ini berlaku selama <strong>10 menit</strong>.</p>
            <p>Jika Anda tidak melakukan permintaan ini, abaikan email ini dan password Anda akan tetap aman.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px;">
              Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
            </p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Reset OTP email sent to:', email);

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send reset OTP email:', error);
      throw error;
    }
  }

  async sendRegistrationSuccess(email, username) {
    if (!this.transporter) {
      console.log('📧 [DEMO MODE] Registration success email for:', email);
      return { success: true, demo: true };
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Registrasi Berhasil - Sistem Voting',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Registrasi Berhasil!</h2>
            <p>Halo ${username},</p>
            <p>Selamat! Akun Anda telah berhasil diverifikasi dan terdaftar di Sistem Voting Blockchain.</p>
            <p>Anda sekarang dapat login dan menggunakan hak pilih Anda.</p>
            <div style="background-color: #f0fdf4; padding: 20px; margin: 20px 0; border-left: 4px solid #059669;">
              <p style="margin: 0;"><strong>Informasi Penting:</strong></p>
              <ul style="margin: 10px 0;">
                <li>Wallet blockchain telah dibuat untuk Anda</li>
                <li>Wallet sudah di-fund dengan ETH untuk voting</li>
                <li>Simpan credentials Anda dengan aman</li>
              </ul>
            </div>
            <p>Terima kasih telah menggunakan sistem kami!</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px;">
              Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
            </p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Registration success email sent to:', email);

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send registration success email:', error);
      // Don't throw error, just log it
      return { success: false, error: error.message };
    }
  }
}

// Singleton instance
const emailService = new EmailService();

module.exports = emailService;
