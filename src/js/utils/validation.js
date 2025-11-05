/**
 * Validation Utilities
 * Form validation helper functions
 */

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} Valid status
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with strength level
 */
export function validatePassword(password) {
  const result = {
    isValid: false,
    strength: 'weak',
    errors: []
  };

  if (!password || password.length < 6) {
    result.errors.push('Password must be at least 6 characters long');
    return result;
  }

  if (password.length < 8) {
    result.errors.push('Password should be at least 8 characters for better security');
  }

  let strength = 0;

  // Check for lowercase
  if (/[a-z]/.test(password)) strength++;
  else result.errors.push('Include lowercase letters');

  // Check for uppercase
  if (/[A-Z]/.test(password)) strength++;
  else result.errors.push('Include uppercase letters');

  // Check for numbers
  if (/[0-9]/.test(password)) strength++;
  else result.errors.push('Include numbers');

  // Check for special characters
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  else result.errors.push('Include special characters');

  // Determine strength
  if (strength === 4 && password.length >= 12) {
    result.strength = 'strong';
    result.isValid = true;
    result.errors = [];
  } else if (strength >= 3 && password.length >= 8) {
    result.strength = 'medium';
    result.isValid = true;
  } else if (password.length >= 6) {
    result.strength = 'weak';
    result.isValid = true;
  }

  return result;
}

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Valid status
 */
export function isValidPhone(phone) {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  return phoneRegex.test(phone) && cleanPhone.length >= 10 && cleanPhone.length <= 15;
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} Valid status
 */
export function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validate required field
 * @param {*} value - Value to validate
 * @returns {boolean} Valid status
 */
export function isRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

/**
 * Validate minimum length
 * @param {string} value - Value to validate
 * @param {number} min - Minimum length
 * @returns {boolean} Valid status
 */
export function minLength(value, min) {
  if (typeof value !== 'string') return false;
  return value.length >= min;
}

/**
 * Validate maximum length
 * @param {string} value - Value to validate
 * @param {number} max - Maximum length
 * @returns {boolean} Valid status
 */
export function maxLength(value, max) {
  if (typeof value !== 'string') return false;
  return value.length <= max;
}

/**
 * Validate number range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} Valid status
 */
export function inRange(value, min, max) {
  const num = Number(value);
  if (isNaN(num)) return false;
  return num >= min && num <= max;
}

/**
 * Validate alpha characters only
 * @param {string} value - Value to validate
 * @returns {boolean} Valid status
 */
export function isAlpha(value) {
  return /^[A-Za-z]+$/.test(value);
}

/**
 * Validate alphanumeric characters only
 * @param {string} value - Value to validate
 * @returns {boolean} Valid status
 */
export function isAlphanumeric(value) {
  return /^[A-Za-z0-9]+$/.test(value);
}

/**
 * Validate numeric characters only
 * @param {string} value - Value to validate
 * @returns {boolean} Valid status
 */
export function isNumeric(value) {
  return /^[0-9]+$/.test(value);
}

/**
 * Validate credit card number (Luhn algorithm)
 * @param {string} cardNumber - Card number to validate
 * @returns {boolean} Valid status
 */
export function isValidCreditCard(cardNumber) {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (!/^\d+$/.test(cleaned) || cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} date - Date to validate
 * @returns {boolean} Valid status
 */
export function isValidDate(date) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  
  if (!dateRegex.test(date)) return false;

  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
}

/**
 * Validate age (must be above minimum age)
 * @param {string|Date} birthdate - Birth date
 * @param {number} minAge - Minimum age required
 * @returns {boolean} Valid status
 */
export function isValidAge(birthdate, minAge = 18) {
  const birth = new Date(birthdate);
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age >= minAge;
}

/**
 * Form validator class
 */
export class FormValidator {
  constructor(formId) {
    this.form = document.getElementById(formId);
    this.errors = {};
  }

  /**
   * Add validation rule
   * @param {string} fieldName - Field name
   * @param {Function} validator - Validator function
   * @param {string} message - Error message
   */
  addRule(fieldName, validator, message) {
    if (!this.rules) {
      this.rules = {};
    }
    
    if (!this.rules[fieldName]) {
      this.rules[fieldName] = [];
    }

    this.rules[fieldName].push({ validator, message });
  }

  /**
   * Validate all fields
   * @returns {boolean} Valid status
   */
  validate() {
    this.errors = {};
    
    if (!this.rules) return true;

    for (const [fieldName, rules] of Object.entries(this.rules)) {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (!field) continue;

      const value = field.value;

      for (const rule of rules) {
        if (!rule.validator(value)) {
          if (!this.errors[fieldName]) {
            this.errors[fieldName] = [];
          }
          this.errors[fieldName].push(rule.message);
          this.showFieldError(field, rule.message);
          break;
        } else {
          this.clearFieldError(field);
        }
      }
    }

    return Object.keys(this.errors).length === 0;
  }

  /**
   * Show field error
   * @param {HTMLElement} field - Input field
   * @param {string} message - Error message
   */
  showFieldError(field, message) {
    field.classList.add('error');
    
    let errorElement = field.parentElement.querySelector('.field-error');
    if (!errorElement) {
      errorElement = document.createElement('span');
      errorElement.className = 'field-error';
      field.parentElement.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
  }

  /**
   * Clear field error
   * @param {HTMLElement} field - Input field
   */
  clearFieldError(field) {
    field.classList.remove('error');
    
    const errorElement = field.parentElement.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  /**
   * Get all errors
   * @returns {Object} Errors object
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Clear all errors
   */
  clearErrors() {
    this.errors = {};
    
    const fields = this.form.querySelectorAll('.error');
    fields.forEach(field => this.clearFieldError(field));
  }
}