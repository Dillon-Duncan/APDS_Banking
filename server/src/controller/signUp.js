const User = require("../models/User")
const bcrypt = require("bcrypt")

async function createUser(req, res) {
    try {
        console.log('Attempting to create new user');
        const {first_name, last_name, id_number, account_number, username, password} = req.body;

        // Validate required fields
        if (!first_name || !last_name || !id_number || !account_number || !username || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('Registration failed: Username already exists');
            return res.status(400).json({ message: "Username already exists" });
        }

        // Check if account number already exists
        const existingAccount = await User.findOne({ account_number });
        if (existingAccount) {
            console.log('Registration failed: Account number already exists');
            return res.status(400).json({ message: "Account number already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({
            first_name,
            last_name,
            id_number,
            account_number,
            username,
            password: hashedPassword,
            role: "customer"
        })

        const savedUser = await newUser.save()
        console.log('User created successfully:', username);
        res.status(201).json({ 
            message: "User created successfully",
            user: {
                username: savedUser.username,
                first_name: savedUser.first_name,
                last_name: savedUser.last_name,
                account_number: savedUser.account_number
            }
        })
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ message: error.message })
    }
}

module.exports = { createUser }