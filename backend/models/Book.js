const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true
    },

    author: {
        type: String,
        required: true,
        trim: true
    },

    isbn: {
        type: String,
        required: true,
        trim: true
    },

    category: {
        type: String,
        required: true
    },

    totalCopies: {
        type: Number,
        required: true,
        min: 1
    },

    availableCopies: {
        type: Number,
        required: true,
        min: 0
    },

    // Each book belongs to one library
    library: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Library",
        required: true
    }

}, {
    timestamps: true
});

// Same ISBN can exist in different libraries,
// but not twice in the same library.
bookSchema.index(
    { library: 1, isbn: 1 },
    { unique: true }
);

module.exports = mongoose.model("Book", bookSchema);