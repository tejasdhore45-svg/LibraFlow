const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    getMyProfile,
    updateMyProfile
} = require("../controllers/studentController");

// ============================================
// STUDENT PROFILE ROUTES
// Keep these BEFORE /:id routes.
// ============================================

router.get("/me", protect, getMyProfile);

router.put("/me", protect, updateMyProfile);


// ============================================
// ADMIN STUDENT MANAGEMENT ROUTES
// ============================================

router.get("/", protect, getStudents);

router.post("/", protect, addStudent);

router.put("/:id", protect, updateStudent);

router.delete("/:id", protect, deleteStudent);

module.exports = router;