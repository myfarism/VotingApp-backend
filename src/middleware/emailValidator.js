class EmailValidator {
  static ALLOWED_DOMAINS = ['@student.upj.ac.id', '@upj.ac.id'];

  /**
   * Validate if email has allowed domain
   * @param {string} email 
   * @returns {object} { isValid: boolean, message: string }
   */
  static validateDomain(email) {
    if (!email || typeof email !== 'string') {
      return {
        isValid: false,
        message: 'Email is required',
      };
    }

    const emailLower = email.toLowerCase().trim();

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLower)) {
      return {
        isValid: false,
        message: 'Invalid email format',
      };
    }

    // Check if email ends with allowed domains
    const isValidDomain = this.ALLOWED_DOMAINS.some(domain => 
      emailLower.endsWith(domain)
    );

    if (!isValidDomain) {
      return {
        isValid: false,
        message: 'Email must be from @student.upj.ac.id or @upj.ac.id domain',
      };
    }

    return {
      isValid: true,
      message: 'Valid email',
    };
  }

  /**
   * Check if email domain is allowed (returns boolean only)
   * @param {string} email 
   * @returns {boolean}
   */
  static isAllowedDomain(email) {
    const result = this.validateDomain(email);
    return result.isValid;
  }
}

module.exports = EmailValidator;
