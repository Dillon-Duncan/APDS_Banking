const User = require("../models/User")
const bcrypt = require("bcrypt")

async function createUser(req, res) {
    try {
        const {first_name,last_name,id_number,account_number,username,password} = req.body
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
        res.status(201).json({ message: "User created successfully", user: savedUser })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

module.exports = { createUser }