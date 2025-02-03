const jwt = require('jsonwebtoken');
const secretKey = require('../config/jwtConfig');

function authenticateToken(req, res, next) {
    console.log('Authenticating request for path:', req.path);
    console.log('Auth header:', req.headers.authorization);
    
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        console.log('Authentication failed: Missing token');
        return res.status(401).json({ message: 'Unauthorized: Missing token' });
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
        console.log('Authentication failed: Invalid token format');
        return res.status(401).json({ message: 'Unauthorized: Invalid token format'});
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        console.log('Token verified successfully for user:', decoded.username);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        return res.status(403).json({ message: 'Unauthorized: Invalid token' });
    }
}

module.exports = authenticateToken;