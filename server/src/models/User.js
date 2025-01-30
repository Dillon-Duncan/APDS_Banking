const mongoose = require("../config/dbConfig")

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    id_number: String,
    account_number: String,
    username: String,
    password: String,
    role: {
        type: String,
        enum: ["admin", "customer"],
        default: "customer"
    }
})

module.exports = mongoose.model("User", userSchema)