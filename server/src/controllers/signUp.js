const User = require("../models/user")
const bcrypt = require("bcrypt")

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
  const validationErrors = [];
  
  if (password.length < passwordPolicy.minLength) 
    validationErrors.push(`Minimum ${passwordPolicy.minLength} characters`);
  if ((password.match(/[A-Z]/g) || []).length < passwordPolicy.minUppercase)
    validationErrors.push(`Minimum ${passwordPolicy.minUppercase} uppercase letters`);
  if ((password.match(/[a-z]/g) || []).length < passwordPolicy.minLowercase)
    validationErrors.push(`Minimum ${passwordPolicy.minLowercase} lowercase letters`);
  if ((password.match(/[0-9]/g) || []).length < passwordPolicy.minNumbers)
    validationErrors.push(`Minimum ${passwordPolicy.minNumbers} numbers`);
  if ((password.match(/[^A-Za-z0-9]/g) || []).length < passwordPolicy.minSymbols)
    validationErrors.push(`Minimum ${passwordPolicy.minSymbols} symbols`);
  if (passwordPolicy.bannedPasswords.includes(password))
    validationErrors.push('Password is too common');

  return validationErrors;
}

module.exports = { createUser }