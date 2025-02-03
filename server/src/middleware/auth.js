const authenticateToken = require('../utils/authMiddleware');

module.exports = {
  authenticateToken,
};

const adminCheck = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(401).json({
      message: 'Admin privileges required',
      code: 'ADMIN_ACCESS_DENIED'
    });
  }
  next();
};
