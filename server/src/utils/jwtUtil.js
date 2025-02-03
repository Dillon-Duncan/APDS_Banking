const jwt = require('jsonwebtoken');
const secretKey = require('../config/jwtConfig');

function generateToken(user) {
    return jwt.sign(
        { 
            id: user._id,
            username: user.username,
            role: user.role 
        }, 
        secretKey, 
        { expiresIn: '24h' }
    );
}

function generateRefreshToken(user) {
    const payload = {
        id: user._id,
        username: user.username,
        role: user.role,
    };
    return jwt.sign(payload, secretKey, { expiresIn: '7h' });
}

function verifyToken(token) {
    return jwt.verify(token, secretKey);
}

module.exports = { generateToken, generateRefreshToken, verifyToken };