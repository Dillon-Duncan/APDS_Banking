const User = require("../models/User");
const bcrypt = require("bcrypt");

async function createAdminAccount() {
  try {
    const existingAdmin = await User.findOne({ username: "Admin" });
    if (!existingAdmin) {
        const newAdmin = new User({
            first_name: "Admin",
            last_name: "Admin",
            id_number: "ADMIN001",
            account_number: "ADMIN001",
            username: "Admin",
            password: await bcrypt.hash("Admin321?", 10),
            role: "admin",
        });
        await newAdmin.save();
        console.log("Admin account created successfully");
    } else {
        console.log("Admin account already exists");
    }
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = { createAdminAccount };
