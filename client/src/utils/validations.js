// Name: Letters, spaces, and basic accents
export const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;

// Account Number: 10-20 alphanumeric
export const ACCOUNT_REGEX = /^[A-Z0-9]{10,20}$/i;

// Amount: Positive decimals with optional currency symbol
export const AMOUNT_REGEX = /^[£€$]?\d+(\.\d{1,2})?$/;

// SWIFT/BIC Code: Standard format
export const SWIFT_REGEX = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

// Bank Address: Alphanumeric with basic punctuation
export const ADDRESS_REGEX = /^[a-zA-Z0-9\s.,'-]{5,100}$/;

// Transaction Reference: Alphanumeric and hyphens
export const REFERENCE_REGEX = /^[A-Z0-9-]{5,20}$/i;

// Added password validation
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

// Enhanced validation function
export const validateInput = (value, regex, maxLength = 100) => {
  const cleaned = typeof value === 'string' ? value.trim() : value.toString();
  return cleaned.length <= maxLength && regex.test(cleaned);
}; 