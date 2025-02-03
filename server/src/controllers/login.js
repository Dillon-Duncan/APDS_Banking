const bcrypt = require('bcrypt');
const User = require('../models/user');
const { generateToken } = require('../utils/jwtUtil');

async function login(req, res) {
    try {
        let { username } = req.body;
        const { password } = req.body;
        username = username.trim().toLowerCase();

        if (!username || !password) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const existingUser = await User.findOne({
            $or: [
                { username: { $regex: new RegExp(`^${username}$`, 'i') } },
                { email: { $regex: new RegExp(`^${username}$`, 'i') } }
            ]
        }).select('+password');

        if (!existingUser || !(await bcrypt.compare(password, existingUser.password))) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Delay brute-force
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken(existingUser);
        
        // Store session
        existingUser.sessions.push({
            token,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });
        await existingUser.save();

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'Lax',
            maxAge: 3600000 // 1 hour
        }).json({
            token,
            user: existingUser.toObject({ virtuals: true })
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Server error" });
    }
}

async function getProfile(req, res) {
    try {
        console.log('Fetching profile for user ID:', req.user.id);
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            console.log('Profile fetch failed: User not found');
            return res.status(404).json({ message: "User not found" });
        }
        console.log('Profile fetch successful');
        res.json(user);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: "Error fetching profile" });
    }
}

module.exports = { login, getProfile };
