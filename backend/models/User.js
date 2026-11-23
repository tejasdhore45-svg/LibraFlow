const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    phone: {
        type: String
    },

    role: {
        type: String,
        enum: ["admin", "student"],
        required: true
    },

    // Link student login account to Student collection
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        default: null
    },

    library: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Library",
        required: true
    },

    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);