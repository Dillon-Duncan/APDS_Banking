const User = require('../models/user');
const bcrypt = require("bcrypt");
const crypto = require('crypto');

async function createAdminAccount() {
  try {
    const existingAdmin = await User.findOne({ username: "admin" });
    
    if (!existingAdmin) {
      const newAdmin = new User({
        first_name: "Admin",
        last_name: "System",
        id_number: '0000000000000',
        account_number: '0000000000',
        username: "admin",
        password: await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD || 'Admin321?', 12),
        role: "admin",
        accountType: "admin",
        sessions: [],
        failedLoginAttempts: 0,
        isAdmin: true
      });

      await newAdmin.validate();
      await newAdmin.save();
      console.log("Admin account created successfully");
    } else {
      console.log("Admin account already exists");
    }
  } catch (error) {
    console.error("Admin creation error:", error);
    if(process.env.NODE_ENV === 'production') process.exit(1);
  }
}

module.exports = { createAdminAccount };
