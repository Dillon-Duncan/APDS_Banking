const jwt = require('jsonwebtoken');
const { secretKey } = require('../config/jwtConfig');

function authenticateToken(req, res, next) {
    // Updated token extraction
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Missing token' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = { 
            id: decoded.userId, 
            role: decoded.role,
            isAdmin: decoded.isAdmin
        };
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Unauthorized: Invalid token' });
    }
}

module.exports = authenticateToken;