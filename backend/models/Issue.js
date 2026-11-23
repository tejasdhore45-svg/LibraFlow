const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({

    // Student reference
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },

    studentId: {
        type: String,
        required: true
    },

    studentName: {
        type: String,
        required: true
    },

    // Book reference
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true
    },

    bookTitle: {
        type: String,
        required: true
    },

    isbn: {
        type: String,
        required: true
    },

    // Issue details
    issueDate: {
        type: Date,
        required: true
    },

    dueDate: {
        type: Date,
        required: true
    },

    returnDate: {
        type: Date,
        default: null
    },

    status: {
        type: String,
        enum: ["Issued", "Returned"],
        default: "Issued"
    },

    // Library ownership
    library: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Library",
        required: true
    }

}, { timestamps: true });

// Efficient library-specific transaction queries
issueSchema.index({ library: 1, createdAt: -1 });
issueSchema.index({ library: 1, student: 1, status: 1 });

module.exports = mongoose.model("Issue", issueSchema);