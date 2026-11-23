const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({

    studentId: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },

    phone: {
        type: String,
        required: true
    },

    department: {
        type: String,
        required: true
    },

    year: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    },

    library: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Library",
        required: true
    }

}, { timestamps: true });

// Student ID and email must be unique within each library.
studentSchema.index({ library: 1, studentId: 1 }, { unique: true });
studentSchema.index({ library: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("Student", studentSchema);