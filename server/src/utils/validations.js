exports.NAME_REGEX = /^[A-Za-zÀ-ÿ\s'-]{2,50}$/;
exports.ACCOUNT_REGEX = /^[A-Za-z0-9]{10,20}$/;
exports.PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
exports.SWIFT_REGEX = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
exports.CURRENCIES = ['ZAR', 'USD', 'EUR', 'GBP'];
exports.NOTES_REGEX = /^[a-zA-Z0-9\s.,!?@()-]*$/;
