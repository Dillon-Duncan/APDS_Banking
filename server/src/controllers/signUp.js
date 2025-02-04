const User = require("../models/user")
const bcrypt = require("bcrypt")
const crypto = require("crypto")

async function createUser(req, res) {
    try {
        console.log('Attempting to create new user');
        const {first_name, last_name, id_number, account_number, username, password} = req.body;

        // Validate required fields
        if (!first_name || !last_name || !id_number || !account_number || !username || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate password policy
        const validationErrors = validatePassword(password);
        if (validationErrors.length > 0) {
            console.log('Registration failed: Password does not meet policy');
            return res.status(400).json({ message: "Password does not meet policy", errors: validationErrors });
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

        const haveIBeenPwned = async (password) => {
            const salt = await bcrypt.genSalt(10);
            const hash = (await bcrypt.hash(password, salt)).replace(/\//g, '').toUpperCase();
            const response = await fetch(`https://api.pwnedpasswords.com/range/${hash.slice(0,5)}`);
            return (await response.text()).includes(hash.slice(5));
        };

        if (await haveIBeenPwned(password)) {
            return res.status(400).json({ message: "Password has been compromised in public breaches" });
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

const passwordPolicy = {
  minLength: 12,
  minUppercase: 1,
  minLowercase: 1,
  minNumbers: 1,
  minSymbols: 1,
  bannedPasswords: ['Password123!', 'Admin123!']
};

function validatePassword(password) {
    const errors = [];
    if (password.length < 8) errors.push("Minimum 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("At least one uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("At least one lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("At least one number");
    if (!/[!@#$%^&*]/.test(password)) errors.push("At least one special character");
    return errors;
}

module.exports = { createUser }