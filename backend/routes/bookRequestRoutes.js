const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    createBookRequest,
    getStudentBookRequests,
    getBookRequests,
    approveBookRequest,
    rejectBookRequest
} = require("../controllers/bookRequestController");


// ============================================
// ROLE PROTECTION
// ============================================

const requireRole = (role) => (req, res, next) => {

    if (req.user.role !== role) {
        return res.status(403).json({
            message: "Access denied."
        });
    }

    next();
};


// ============================================
// STUDENT ROUTES
// ============================================

// Submit a new book request
router.post(
    "/",
    protect,
    requireRole("student"),
    createBookRequest
);

// Get logged-in student's requests
router.get(
    "/student",
    protect,
    requireRole("student"),
    getStudentBookRequests
);


// ============================================
// ADMIN ROUTES
// ============================================

// Get all requests for admin's library
router.get(
    "/",
    protect,
    requireRole("admin"),
    getBookRequests
);

// Approve a book request
router.put(
    "/:id/approve",
    protect,
    requireRole("admin"),
    approveBookRequest
);

// Reject a book request
router.put(
    "/:id/reject",
    protect,
    requireRole("admin"),
    rejectBookRequest
);


module.exports = router;