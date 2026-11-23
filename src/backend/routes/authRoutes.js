const express = require("express");
const router = express.Router();

const {
    registerLibrary,
    registerStudent,
    loginUser
} = require("../controllers/authController");

// Library registration
router.post("/register-library", registerLibrary);

// Student registration
router.post("/register-student", registerStudent);

// User login (Admin + Student)
router.post("/login", loginUser);

module.exports = router;