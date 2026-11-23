const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getIssues,
    getStudentIssues,
    issueBook,
    returnBook
} = require("../controllers/issueController");

// ROLE-BASED ACCESS
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

// ADMIN: Get all issues
router.get(
    "/",
    protect,
    requireRole("admin"),
    getIssues
);

// STUDENT: Get own borrowing records
router.get(
    "/student",
    protect,
    requireRole("student"),
    getStudentIssues
);

// ADMIN: Issue a book
router.post(
    "/",
    protect,
    requireRole("admin"),
    issueBook
);

// ADMIN: Return a book
router.put(
    "/:id/return",
    protect,
    requireRole("admin"),
    returnBook
);

module.exports = router;