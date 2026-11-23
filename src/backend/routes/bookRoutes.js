const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

// Role protection
const requireRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({
                message: "Access denied."
            });
        }

        next();
    };
};

// Controller functions
const {
    getBooks,
    getStudentBooks,
    getStudentBookDetails,
    addBook,
    updateBook,
    deleteBook
} = require("../controllers/bookController");


// ============================================
// STUDENT BOOK APIs
// ============================================

router.get(
    "/student",
    protect,
    requireRole("student"),
    getStudentBooks
);

router.get(
    "/student/:id",
    protect,
    requireRole("student"),
    getStudentBookDetails
);


// ============================================
// ADMIN BOOK APIs
// ============================================

router.get(
    "/",
    protect,
    requireRole("admin"),
    getBooks
);

router.post(
    "/",
    protect,
    requireRole("admin"),
    addBook
);

router.put(
    "/:id",
    protect,
    requireRole("admin"),
    updateBook
);

router.delete(
    "/:id",
    protect,
    requireRole("admin"),
    deleteBook
);

module.exports = router;