const { JWT_SECRET } = require('../config');
module.exports = { 
  secretKey: Buffer.from(JWT_SECRET, 'base64'),
  expiresIn: '1h'
};
