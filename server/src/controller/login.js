const bcrypt = require('bcrypt');
const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtil');

async function login(req, res) {
    try {
        console.log('Login attempt for username:', req.body.username);
        const { username, account_number, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        let existingUser;

        if (username === "Admin") {
            existingUser = await User.findOne({ username });
            console.log('Admin login attempt');
        } else {
            if (!account_number) {
                return res.status(400).json({ message: "Account number is required" });
            }
            existingUser = await User.findOne({ username, account_number });
        }

        if (!existingUser) {
            console.log('Login failed: User not found');
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            console.log('Login failed: Invalid password');
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken(existingUser);
        console.log('Login successful for user:', username);
        
        res.status(200).json({ 
            message: "Login successful", 
            token: token, 
            user: {
                id: existingUser._id,
                username: existingUser.username,
                role: existingUser.role,
                first_name: existingUser.first_name,
                last_name: existingUser.last_name,
                account_number: existingUser.account_number
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Internal server error" });
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
