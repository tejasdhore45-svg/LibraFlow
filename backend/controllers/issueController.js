const Issue = require("../models/Issue");
const Student = require("../models/Student");
const Book = require("../models/Book");

// ============================================
// ADMIN: GET ALL ISSUES FOR OWN LIBRARY
// ============================================
const getIssues = async (req, res) => {
    try {
        const issues = await Issue.find({
            library: req.user.libraryId
        }).sort({ createdAt: -1 });

        res.status(200).json(issues);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// ============================================
// STUDENT: GET OWN BORROWED BOOKS
// ============================================
const getStudentIssues = async (req, res) => {
    try {

        // Verify student account is linked
        if (!req.user.studentId) {
            return res.status(403).json({
                message: "Student account is not linked to a student record."
            });
        }

        // Fetch only logged-in student's records
        const issues = await Issue.find({
            student: req.user.studentId,
            library: req.user.libraryId
        })
        .populate("book", "title author category isbn")
        .sort({ createdAt: -1 });

        res.status(200).json(issues);

    } catch (error) {
        console.error("Student issues error:", error);

        res.status(500).json({
            message: "Failed to fetch borrowed books."
        });
    }
};


// ============================================
// ADMIN: ISSUE BOOK
// ============================================
const issueBook = async (req, res) => {
    let reservedBookId = null;

    try {
        const {
            studentId,
            bookId,
            issueDate,
            dueDate
        } = req.body;

        const libraryId = req.user.libraryId;

        // Validate required fields
        if (!studentId || !bookId || !issueDate || !dueDate) {
            return res.status(400).json({
                message: "Please complete all required fields."
            });
        }

        // Validate dates
        const parsedIssueDate = new Date(issueDate);
        const parsedDueDate = new Date(dueDate);

        if (
            Number.isNaN(parsedIssueDate.getTime()) ||
            Number.isNaN(parsedDueDate.getTime()) ||
            parsedDueDate <= parsedIssueDate
        ) {
            return res.status(400).json({
                message: "Please provide valid issue and due dates."
            });
        }

        // Find student inside logged-in library
        const student = await Student.findOne({
            _id: studentId,
            library: libraryId
        });

        if (!student) {
            return res.status(404).json({
                message: "Student not found in your library."
            });
        }

        if (student.status !== "Active") {
            return res.status(400).json({
                message: "Inactive students cannot borrow books."
            });
        }

        // Find book inside logged-in library
        const book = await Book.findOne({
            _id: bookId,
            library: libraryId
        });

        if (!book) {
            return res.status(404).json({
                message: "Book not found in your library."
            });
        }

        // Prevent duplicate active issue
        const existingIssue = await Issue.findOne({
            student: student._id,
            book: book._id,
            library: libraryId,
            status: "Issued"
        });

        if (existingIssue) {
            return res.status(400).json({
                message: "This student has already borrowed this book."
            });
        }

        // Reserve one available copy
        const updatedBook = await Book.findOneAndUpdate(
            {
                _id: book._id,
                library: libraryId,
                availableCopies: { $gt: 0 }
            },
            {
                $inc: {
                    availableCopies: -1
                }
            },
            { new: true }
        );

        if (!updatedBook) {
            return res.status(400).json({
                message: "No copies of this book are currently available."
            });
        }

        reservedBookId = book._id;

        // Create issue record
        const issue = await Issue.create({
            student: student._id,
            studentId: student.studentId,
            studentName: student.name,

            book: book._id,
            bookTitle: book.title,
            isbn: book.isbn,

            issueDate: parsedIssueDate,
            dueDate: parsedDueDate,

            status: "Issued",
            returnDate: null,

            library: libraryId
        });

        // Issue successfully created
        reservedBookId = null;

        res.status(201).json({
            message: "Book issued successfully.",
            issue
        });

    } catch (error) {

        // Restore book copy if issue creation fails
        if (reservedBookId) {
            await Book.updateOne(
                {
                    _id: reservedBookId,
                    library: req.user.libraryId
                },
                {
                    $inc: {
                        availableCopies: 1
                    }
                }
            );
        }

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Duplicate issue record."
            });
        }

        res.status(500).json({
            message: error.message
        });
    }
};


// ============================================
// ADMIN: RETURN BOOK
// ============================================
const returnBook = async (req, res) => {
    try {
        const libraryId = req.user.libraryId;

        // Mark active issue as returned
        const issue = await Issue.findOneAndUpdate(
            {
                _id: req.params.id,
                library: libraryId,
                status: "Issued"
            },
            {
                $set: {
                    status: "Returned",
                    returnDate: new Date()
                }
            },
            { new: true }
        );

        if (!issue) {
            return res.status(404).json({
                message: "Active issue not found. It may already have been returned."
            });
        }

        // Restore available book copy
        const book = await Book.findOneAndUpdate(
            {
                _id: issue.book,
                library: libraryId,
                $expr: {
                    $lt: ["$availableCopies", "$totalCopies"]
                }
            },
            {
                $inc: {
                    availableCopies: 1
                }
            },
            { new: true }
        );

        // Roll back issue status if inventory update fails
        if (!book) {
            await Issue.updateOne(
                {
                    _id: issue._id,
                    library: libraryId,
                    status: "Returned"
                },
                {
                    $set: {
                        status: "Issued",
                        returnDate: null
                    }
                }
            );

            return res.status(400).json({
                message: "Book inventory could not be updated. Return was not completed."
            });
        }

        res.status(200).json({
            message: "Book returned successfully.",
            issue,
            availableCopies: book.availableCopies
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// ============================================
// EXPORT ALL CONTROLLER FUNCTIONS
// ============================================
module.exports = {
    getIssues,
    getStudentIssues,
    issueBook,
    returnBook
};