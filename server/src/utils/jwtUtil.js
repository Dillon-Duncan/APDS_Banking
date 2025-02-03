const jwt = require('jsonwebtoken');
const { secretKey } = require('../config/jwtConfig');

function generateToken(user) {
    return jwt.sign(
        { 
            userId: user._id, 
            role: user.role,
            isAdmin: user.role === 'admin'
        },
        secretKey,
        { algorithm: 'HS256', expiresIn: '1h' }
    );
}

function generateRefreshToken(user) {
    const payload = {
        id: user._id,
        username: user.username,
        role: user.role
    };
    return jwt.sign(payload, secretKey, { expiresIn: '7h' });
}

function verifyToken(token) {
    return jwt.verify(token, secretKey);
}

module.exports = { generateToken, generateRefreshToken, verifyToken };