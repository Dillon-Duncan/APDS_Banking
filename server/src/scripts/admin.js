const User = require("../models/User");
const bcrypt = require("bcrypt");

async function createAdminAccount() {
  try {
    const existingAdmin = await User.findOne({ username: "admin" });
    if (!existingAdmin) {
        const newAdmin = new User({
            first_name: "Admin",
            last_name: "Admin",
            id_number: "0000000000000",
            account_number: "0000000000",
            username: "admin",
            password: await bcrypt.hash("Admin321?", 10),
            role: "admin",
        });
        await newAdmin.save();
        console.log("Admin account created successfully");
    } else {
        console.log("Admin account already exists");
    }
  } catch (error) {
    console.log("Error creating admin:", error.message);
  }
}

module.exports = { createAdminAccount };
