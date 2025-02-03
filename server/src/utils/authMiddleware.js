const jwt = require('jsonwebtoken');
const { secretKey } = require('../config/jwtConfig');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized: Missing token' });
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token format'});
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = { id: decoded.userId, role: decoded.role };
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Unauthorized: Invalid token' });
    }
}

module.exports = authenticateToken;