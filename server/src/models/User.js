const mongoose = require("../config/dbConfig")

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
        match: /^[A-Za-z\s]{2,50}$/  // Letters and spaces, 2-50 chars
    },
    last_name: {
        type: String,
        required: true,
        match: /^[A-Za-z\s]{2,50}$/  // Letters and spaces, 2-50 chars
    },
    id_number: {
        type: String,
        required: true,
        match: /^[0-9]{13}$/  // SA ID number format: 13 digits
    },
    account_number: {
        type: String,
        required: true,
        match: /^[0-9]{10}$/  // 10-digit account number
    },
    username: {
        type: String,
        required: true,
        match: /^[a-zA-Z0-9_]{3,20}$/  // Alphanumeric and underscore, 3-20 chars
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "customer"],
        default: "customer"
    }
})

module.exports = mongoose.model("User", userSchema)