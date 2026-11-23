const mongoose = require("mongoose");

const bookRequestSchema = new mongoose.Schema({

    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },

    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true
    },

    library: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Library",
        required: true
    },

    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
    },

    requestDate: {
        type: Date,
        default: Date.now
    },

    processedAt: {
        type: Date,
        default: null
    },

    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    remarks: {
        type: String,
        default: ""
    }

}, { timestamps: true });

// Prevent duplicate pending requests for the same book.
bookRequestSchema.index(
    { library: 1, student: 1, book: 1 },
    {
        unique: true,
        partialFilterExpression: { status: "Pending" }
    }
);

// Optimize admin request filtering.
bookRequestSchema.index({ library: 1, status: 1, createdAt: -1 });

// Optimize student request history.
bookRequestSchema.index({ library: 1, student: 1, createdAt: -1 });

module.exports = mongoose.model("BookRequest", bookRequestSchema);