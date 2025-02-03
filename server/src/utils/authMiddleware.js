const jwt = require('jsonwebtoken');
const secretKey = require('../config/jwtConfig');

function authenticateToken(req, res, next) {
    console.log('Authenticating request');
    
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        console.log('Authentication failed: Missing token');
        return res.status(401).json({ message: 'Unauthorized: Missing token' });
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
        console.log('Authentication failed: Invalid token format');
        return res.status(401).json({ message: 'Unauthorized: Invalid token format'})
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            console.log('Authentication failed: Invalid token');
            return res.status(403).json({ message: 'Unauthorized: Invalid token' });
        }
        console.log('Authentication successful for user:', user.username);
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;