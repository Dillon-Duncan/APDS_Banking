const User = require('../models/User');

async function getUser(req, res) {
    try {
        console.log('Fetching user profile for ID:', req.user.id);
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            console.log('User profile not found');
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User profile fetched successfully');
        res.json({
            id: user._id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            account_number: user.account_number,
            role: user.role
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
}

module.exports = { getUser };
