const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getDashboardData,
    getStudentDashboardData
} = require("../controllers/dashboardController");

// Admin Dashboard
router.get("/", protect, getDashboardData);

// Student Dashboard
router.get("/student", protect, getStudentDashboardData);

module.exports = router;