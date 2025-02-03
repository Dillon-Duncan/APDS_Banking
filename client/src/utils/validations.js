export const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;
export const ACCOUNT_REGEX = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/i;
export const AMOUNT_REGEX = /^[£€$]?\d+(\.\d{1,2})?$/;
export const SWIFT_REGEX = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
export const ADDRESS_REGEX = /^[a-zA-Z0-9\s.,'-]{5,100}$/;
export const REFERENCE_REGEX = /^[A-Z0-9-]{5,20}$/i;
export const PASSWORD_REGEX = /^(?:.*[A-Z])(?:.*[a-z])(?:.*\d)(?:.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

export const validateInput = (value, regex, maxLength = 100) => {
  const cleaned = typeof value === 'string' ? value.trim() : value.toString();
  return cleaned.length <= maxLength && regex.test(cleaned);
}; 