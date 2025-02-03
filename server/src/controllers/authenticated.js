const User = require("../models/user");

async function getUser(req, res) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            id: user._id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            account_number: user.account_number,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user profile' });
    }
}

module.exports = { getUser };
