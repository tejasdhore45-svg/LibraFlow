const BookRequest = require("../models/BookRequest");
const Student = require("../models/Student");
const Book = require("../models/Book");
const Issue = require("../models/Issue");

// ============================================
// STUDENT: SUBMIT BOOK REQUEST
// ============================================
const createBookRequest = async (req, res) => {
    try {
        const libraryId = req.user.libraryId;
        const studentId = req.user.studentId;
        const { bookId } = req.body;

        if (!studentId) {
            return res.status(403).json({
                message: "Student account is not linked to a student record."
            });
        }

        if (!bookId) {
            return res.status(400).json({
                message: "Book ID is required."
            });
        }

        // Verify student belongs to this library
        const student = await Student.findOne({
            _id: studentId,
            library: libraryId,
            status: "Active"
        });

        if (!student) {
            return res.status(403).json({
                message: "Active student record not found."
            });
        }

        // Verify book belongs to this library
        const book = await Book.findOne({
            _id: bookId,
            library: libraryId
        });

        if (!book) {
            return res.status(404).json({
                message: "Book not found in your library."
            });
        }

        // Check whether student already borrowed this book
        const existingIssue = await Issue.findOne({
            student: studentId,
            book: bookId,
            library: libraryId,
            status: "Issued"
        });

        if (existingIssue) {
            return res.status(400).json({
                message: "You have already borrowed this book."
            });
        }

        // Check for an existing pending request
        const existingRequest = await BookRequest.findOne({
            student: studentId,
            book: bookId,
            library: libraryId,
            status: "Pending"
        });

        if (existingRequest) {
            return res.status(409).json({
                message: "You already have a pending request for this book."
            });
        }

        // Create request
        const request = await BookRequest.create({
            student: studentId,
            book: bookId,
            library: libraryId,
            status: "Pending"
        });

        res.status(201).json({
            message: "Book request submitted successfully.",
            request
        });

    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).json({
                message: "You already have a pending request for this book."
            });
        }

        console.error("Create Book Request Error:", error);

        res.status(500).json({
            message: "Failed to submit book request."
        });
    }
};


// ============================================
// STUDENT: GET OWN BOOK REQUESTS
// ============================================
const getStudentBookRequests = async (req, res) => {
    try {
        if (!req.user.studentId) {
            return res.status(403).json({
                message: "Student account is not linked to a student record."
            });
        }

        const requests = await BookRequest.find({
            student: req.user.studentId,
            library: req.user.libraryId
        })
        .populate("book", "title author isbn category availableCopies")
        .sort({ createdAt: -1 });

        res.status(200).json(requests);

    } catch (error) {
        console.error("Student Book Requests Error:", error);

        res.status(500).json({
            message: "Failed to fetch book requests."
        });
    }
};


// ============================================
// ADMIN: GET ALL LIBRARY BOOK REQUESTS
// ============================================
const getBookRequests = async (req, res) => {
    try {
        const requests = await BookRequest.find({
            library: req.user.libraryId
        })
        .populate("student", "studentId name email department")
        .populate("book", "title author isbn category availableCopies")
        .populate("processedBy", "name")
        .sort({ createdAt: -1 });

        res.status(200).json(requests);

    } catch (error) {
        console.error("Admin Book Requests Error:", error);

        res.status(500).json({
            message: "Failed to fetch book requests."
        });
    }
};


// ============================================
// ADMIN: APPROVE BOOK REQUEST
// ============================================
const approveBookRequest = async (req, res) => {

    let reservedBookId = null;

    try {
        const libraryId = req.user.libraryId;
        const requestId = req.params.id;

        // Find pending request in admin's library
        const request = await BookRequest.findOne({
            _id: requestId,
            library: libraryId,
            status: "Pending"
        });

        if (!request) {
            return res.status(404).json({
                message: "Pending book request not found."
            });
        }

        // Verify student
        const student = await Student.findOne({
            _id: request.student,
            library: libraryId,
            status: "Active"
        });

        if (!student) {
            return res.status(400).json({
                message: "Student is inactive or no longer available."
            });
        }

        // Verify book
        const book = await Book.findOne({
            _id: request.book,
            library: libraryId
        });

        if (!book) {
            return res.status(404).json({
                message: "Book not found in your library."
            });
        }

        // Prevent duplicate active borrowing
        const existingIssue = await Issue.findOne({
            student: student._id,
            book: book._id,
            library: libraryId,
            status: "Issued"
        });

        if (existingIssue) {
            return res.status(400).json({
                message: "Student has already borrowed this book."
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

        // Create actual borrowing record
        const issue = await Issue.create({
            student: student._id,
            studentId: student.studentId,
            studentName: student.name,

            book: book._id,
            bookTitle: book.title,
            isbn: book.isbn,

            issueDate: new Date(),
            dueDate: new Date(
                Date.now() + 14 * 24 * 60 * 60 * 1000
            ),

            status: "Issued",
            returnDate: null,

            library: libraryId
        });

        // Mark request as approved only if still pending
        const approvedRequest = await BookRequest.findOneAndUpdate(
            {
                _id: requestId,
                library: libraryId,
                status: "Pending"
            },
            {
                $set: {
                    status: "Approved",
                    processedAt: new Date(),
                    processedBy: req.user.userId
                }
            },
            { new: true }
        );

        if (!approvedRequest) {
            // Remove issue created during this approval attempt
            await Issue.deleteOne({
                _id: issue._id,
                library: libraryId
            });

            return res.status(409).json({
                message: "This request has already been processed."
            });
        }

        // Approval completed
        reservedBookId = null;

        res.status(200).json({
            message: "Book request approved and book issued successfully.",
            request: approvedRequest,
            issue,
            availableCopies: updatedBook.availableCopies
        });

    } catch (error) {

        // Restore inventory if approval fails
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

        console.error("Approve Book Request Error:", error);

        res.status(500).json({
            message: "Failed to approve book request."
        });
    }
};


// ============================================
// ADMIN: REJECT BOOK REQUEST
// ============================================
const rejectBookRequest = async (req, res) => {
    try {
        const { remarks } = req.body;

        const request = await BookRequest.findOneAndUpdate(
            {
                _id: req.params.id,
                library: req.user.libraryId,
                status: "Pending"
            },
            {
                $set: {
                    status: "Rejected",
                    processedAt: new Date(),
                    processedBy: req.user.userId,
                    remarks: remarks || ""
                }
            },
            { new: true }
        );

        if (!request) {
            return res.status(404).json({
                message: "Pending book request not found."
            });
        }

        res.status(200).json({
            message: "Book request rejected successfully.",
            request
        });

    } catch (error) {
        console.error("Reject Book Request Error:", error);

        res.status(500).json({
            message: "Failed to reject book request."
        });
    }
};


// ============================================
// EXPORT CONTROLLERS
// ============================================
module.exports = {
    createBookRequest,
    getStudentBookRequests,
    getBookRequests,
    approveBookRequest,
    rejectBookRequest
};