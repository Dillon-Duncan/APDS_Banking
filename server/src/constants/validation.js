const HIGH_RISK_COUNTRIES = ['RU', 'CN', 'KP', 'IR'];
const RISK_THRESHOLD = 70;
const RISK_WEIGHTS = {
  COUNTRY: 30,
  AMOUNT: 20,
  HISTORICAL: 15
};
const NAME_REGEX = /^[A-Za-zÀ-ÿ\s'-]{2,50}$/;
const ACCOUNT_REGEX = /^[A-Z0-9]{10,20}$/i;
const SWIFT_REGEX = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
const CURRENCIES = ['USD', 'EUR', 'ZAR', 'GBP'];
const NOTES_REGEX = /^[a-zA-Z0-9\s.,!?@()\-'"%&*:;<>\/]{0,200}$/;

module.exports = {
  HIGH_RISK_COUNTRIES,
  RISK_THRESHOLD,
  RISK_WEIGHTS,
  NAME_REGEX,
  ACCOUNT_REGEX,
  SWIFT_REGEX,
  CURRENCIES,
  NOTES_REGEX
}; 