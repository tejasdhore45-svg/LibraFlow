const Book = require("../models/Book");

// ============================================
// ADMIN: GET ALL BOOKS FROM OWN LIBRARY
// ============================================
const getBooks = async (req, res) => {
    try {
        const books = await Book.find({
            library: req.user.libraryId
        }).sort({ createdAt: -1 });

        res.status(200).json(books);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch books."
        });
    }
};


// ============================================
// STUDENT: BROWSE BOOKS FROM OWN LIBRARY
// ============================================
const getStudentBooks = async (req, res) => {
    try {
        const {
            search = "",
            category = "",
            availability = "all",
            page = 1,
            limit = 12
        } = req.query;

        // Library-specific filter
        const filter = {
            library: req.user.libraryId
        };

        // Search by title, author or ISBN
        if (search.trim()) {

            const searchRegex = new RegExp(
                search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "i"
            );

            filter.$or = [
                { title: searchRegex },
                { author: searchRegex },
                { isbn: searchRegex }
            ];
        }

        // Category filter
        if (category.trim() && category !== "All") {
            filter.category = category;
        }

        // Availability filter
        if (availability === "available") {

            filter.availableCopies = { $gt: 0 };

        } else if (availability === "unavailable") {

            filter.availableCopies = 0;

        } else if (availability !== "all") {

            return res.status(400).json({
                message: "Invalid availability filter."
            });
        }

        // Pagination validation
        const currentPage = Math.max(
            1,
            parseInt(page, 10) || 1
        );

        const pageLimit = Math.min(
            50,
            Math.max(1, parseInt(limit, 10) || 12)
        );

        const skip = (currentPage - 1) * pageLimit;

        // Fetch books, count and library categories
        const [books, totalBooks, categories] = await Promise.all([

            Book.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageLimit),

            Book.countDocuments(filter),

            Book.distinct("category", {
                library: req.user.libraryId
            })

        ]);

        res.status(200).json({

            books,

            categories: categories.sort(),

            pagination: {
                currentPage,
                totalPages: Math.ceil(totalBooks / pageLimit),
                totalBooks,
                limit: pageLimit
            }

        });

    } catch (error) {

        console.error("Student books error:", error);

        res.status(500).json({
            message: "Failed to fetch library books."
        });
    }
};


// ============================================
// STUDENT: GET SINGLE BOOK DETAILS
// ============================================
const getStudentBookDetails = async (req, res) => {
    try {

        const book = await Book.findOne({
            _id: req.params.id,
            library: req.user.libraryId
        });

        if (!book) {
            return res.status(404).json({
                message: "Book not found in your library."
            });
        }

        res.status(200).json(book);

    } catch (error) {

        res.status(500).json({
            message: "Failed to fetch book details."
        });
    }
};


// ============================================
// ADMIN: ADD BOOK
// ============================================
const addBook = async (req, res) => {
    try {

        const {
            title,
            author,
            isbn,
            category,
            totalCopies
        } = req.body;

        if (
            !title ||
            !author ||
            !isbn ||
            !category ||
            !Number.isInteger(Number(totalCopies)) ||
            Number(totalCopies) < 1
        ) {
            return res.status(400).json({
                message: "Please provide valid book details."
            });
        }

        const book = await Book.create({

            title,
            author,
            isbn,
            category,

            totalCopies: Number(totalCopies),
            availableCopies: Number(totalCopies),

            library: req.user.libraryId

        });

        res.status(201).json({
            message: "Book added successfully!",
            book
        });

    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).json({
                message: "This ISBN already exists in your library."
            });
        }

        res.status(500).json({
            message: "Failed to add book."
        });
    }
};


// ============================================
// ADMIN: UPDATE BOOK
// ============================================
const updateBook = async (req, res) => {
    try {

        const {
            title,
            author,
            isbn,
            category,
            totalCopies
        } = req.body;

        const book = await Book.findOne({
            _id: req.params.id,
            library: req.user.libraryId
        });

        if (!book) {
            return res.status(404).json({
                message: "Book not found."
            });
        }

        if (
            !title ||
            !author ||
            !isbn ||
            !category ||
            !Number.isInteger(Number(totalCopies)) ||
            Number(totalCopies) < 1
        ) {
            return res.status(400).json({
                message: "Please provide valid book details."
            });
        }

        const issuedCopies =
            book.totalCopies - book.availableCopies;

        if (Number(totalCopies) < issuedCopies) {
            return res.status(400).json({
                message: "Total copies cannot be less than issued copies."
            });
        }

        book.title = title;
        book.author = author;
        book.isbn = isbn;
        book.category = category;

        book.totalCopies = Number(totalCopies);

        book.availableCopies =
            Number(totalCopies) - issuedCopies;

        await book.save();

        res.status(200).json({
            message: "Book updated successfully!",
            book
        });

    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).json({
                message: "This ISBN already exists in your library."
            });
        }

        res.status(500).json({
            message: "Failed to update book."
        });
    }
};


// ============================================
// ADMIN: DELETE BOOK
// ============================================
const deleteBook = async (req, res) => {
    try {

        const book = await Book.findOneAndDelete({
            _id: req.params.id,
            library: req.user.libraryId
        });

        if (!book) {
            return res.status(404).json({
                message: "Book not found."
            });
        }

        res.status(200).json({
            message: "Book deleted successfully!"
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to delete book."
        });
    }
};


// ============================================
// EXPORT CONTROLLERS
// ============================================
module.exports = {
    getBooks,
    getStudentBooks,
    getStudentBookDetails,
    addBook,
    updateBook,
    deleteBook
};
