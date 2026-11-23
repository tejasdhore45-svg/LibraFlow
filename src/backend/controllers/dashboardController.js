const Book = require("../models/Book");
const Student = require("../models/Student");
const Issue = require("../models/Issue");
const Library = require("../models/Library");
const User = require("../models/User");

// ==========================================
// GET LIBRARY ADMIN DASHBOARD DATA
// ==========================================

const getDashboardData = async (req, res) => {
    try {
        const libraryId = req.user.libraryId;
        const userId = req.user.userId;

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const [library, admin] = await Promise.all([
            Library.findById(libraryId).select("name"),
            User.findOne({
                _id: userId,
                library: libraryId,
                role: "admin"
            }).select("name email role")
        ]);

        if (!library || !admin) {
            return res.status(404).json({
                message: "Library or admin account not found."
            });
        }

        const [
            bookStats,
            totalStudents,
            issuedBooks,
            overdueBooks,
            returnedBooks,
            recentIssues
        ] = await Promise.all([

            Book.aggregate([
                { $match: { library: library._id } },
                {
                    $group: {
                        _id: null,
                        totalBooks: { $sum: "$totalCopies" },
                        availableBooks: { $sum: "$availableCopies" }
                    }
                }
            ]),

            Student.countDocuments({ library: library._id }),

            Issue.countDocuments({
                library: library._id,
                status: "Issued"
            }),

            Issue.countDocuments({
                library: library._id,
                status: "Issued",
                dueDate: { $lt: startOfToday }
            }),

            Issue.countDocuments({
                library: library._id,
                status: "Returned"
            }),

            Issue.find({ library: library._id })
                .sort({ updatedAt: -1 })
                .limit(10)
                .select("bookTitle studentName status issueDate returnDate dueDate")
        ]);

        const stats = bookStats[0] || {
            totalBooks: 0,
            availableBooks: 0
        };

        const recentTransactions = recentIssues.map((issue) => {

            const isOverdue =
                issue.status === "Issued" &&
                new Date(issue.dueDate) < startOfToday;

            return {
                _id: issue._id,
                bookTitle: issue.bookTitle,
                studentName: issue.studentName,
                status: issue.status === "Returned"
                    ? "Returned"
                    : isOverdue
                        ? "Overdue"
                        : "Issued",
                date: issue.status === "Returned"
                    ? issue.returnDate
                    : issue.issueDate
            };
        });

        return res.status(200).json({
            library: {
                name: library.name
            },

            admin: {
                name: admin.name,
                email: admin.email,
                role: admin.role
            },

            stats: {
                totalBooks: stats.totalBooks,
                availableBooks: stats.availableBooks,
                issuedBooks,
                overdueBooks,
                totalStudents,
                returnedBooks
            },

            recentTransactions
        });

    } catch (error) {
        console.error("Dashboard Error:", error);

        return res.status(500).json({
            message: "Unable to load dashboard data."
        });
    }
};


// ==========================================
// GET STUDENT DASHBOARD DATA
// ==========================================

const getStudentDashboardData = async (req, res) => {
    try {
        const userId = req.user.userId;
        const libraryId = req.user.libraryId;

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const nextSevenDays = new Date(startOfToday);
        nextSevenDays.setDate(nextSevenDays.getDate() + 7);

        // Find logged-in student account
        const user = await User.findOne({
            _id: userId,
            library: libraryId,
            role: "student",
            status: "active"
        }).select("name email student library");

        if (!user || !user.student) {
            return res.status(404).json({
                message: "Student account not found."
            });
        }

        // Verify student belongs to this library
        const student = await Student.findOne({
            _id: user.student,
            library: libraryId
        });

        if (!student) {
            return res.status(404).json({
                message: "Student record not found."
            });
        }

        // Fetch only this student's transactions
        const studentFilter = {
            student: student._id,
            library: libraryId
        };

        const [
            borrowedBooks,
            returnedBooks,
            totalTransactions,
            recentIssues
        ] = await Promise.all([

            Issue.countDocuments({
                ...studentFilter,
                status: "Issued"
            }),

            Issue.countDocuments({
                ...studentFilter,
                status: "Returned"
            }),

            Issue.countDocuments(studentFilter),

            Issue.find(studentFilter)
                .sort({ createdAt: -1 })
                .limit(5)
                .select("bookTitle studentName dueDate status issueDate")
        ]);

        // Find books due within the next seven days
        const dueSoon = await Issue.countDocuments({
            ...studentFilter,
            status: "Issued",
            dueDate: {
                $gte: startOfToday,
                $lte: nextSevenDays
            }
        });

        // Format recent borrowed books
        const recentBorrowedBooks = recentIssues.map((issue) => {

            const isOverdue =
                issue.status === "Issued" &&
                new Date(issue.dueDate) < startOfToday;

            const isDueSoon =
                issue.status === "Issued" &&
                new Date(issue.dueDate) <= nextSevenDays &&
                !isOverdue;

            return {
                id: issue._id,
                title: issue.bookTitle,
                author: "",
                dueDate: issue.dueDate,
                status: issue.status === "Returned"
                    ? "Returned"
                    : isOverdue
                        ? "Overdue"
                        : isDueSoon
                            ? "Due Soon"
                            : "Active"
            };
        });

        return res.status(200).json({

            library: {
                id: libraryId
            },

            student: {
                id: student._id,
                name: student.name,
                email: student.email,
                studentId: student.studentId
            },

            stats: {
                borrowedBooks,
                returnedBooks,
                dueSoon,
                totalTransactions
            },

            recentBorrowedBooks

        });

    } catch (error) {
        console.error("Student Dashboard Error:", error);

        return res.status(500).json({
            message: "Unable to load student dashboard data."
        });
    }
};


module.exports = {
    getDashboardData,
    getStudentDashboardData
};