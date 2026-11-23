const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Library = require("../models/Library");
const User = require("../models/User");
const Student = require("../models/Student");

// ==========================================
// 1. REGISTER A NEW LIBRARY AND ADMIN
// ==========================================

const registerLibrary = async (req, res) => {
    try {
        const {
            libraryName,
            libraryEmail,
            phone,
            address,
            adminName,
            adminEmail,
            password
        } = req.body;

        if (
            !libraryName || !libraryEmail || !phone ||
            !address || !adminName || !adminEmail || !password
        ) {
            return res.status(400).json({
                message: "Please fill in all required fields."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters."
            });
        }

        const existingUser = await User.findOne({
            email: adminEmail.trim().toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                message: "This admin email is already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const library = await Library.create({
            name: libraryName,
            email: libraryEmail.trim().toLowerCase(),
            phone,
            address
        });

        try {
            const admin = await User.create({
                name: adminName,
                email: adminEmail.trim().toLowerCase(),
                password: hashedPassword,
                phone,
                role: "admin",
                library: library._id
            });

            return res.status(201).json({
                message: "Library registered successfully!",
                libraryId: library._id,
                adminId: admin._id
            });

        } catch (error) {
            await Library.findByIdAndDelete(library._id);
            throw error;
        }

    } catch (error) {
        console.error("Registration Error:", error);

        return res.status(500).json({
            message: "Registration failed. Please try again."
        });
    }
};


// ==========================================
// 2. REGISTER STUDENT
// ==========================================

const registerStudent = async (req, res) => {
    try {
        const {
            libraryEmail,
            studentId,
            email,
            password,
            confirmPassword
        } = req.body;

        // Validate required fields
        if (
            !libraryEmail || !studentId || !email ||
            !password || !confirmPassword
        ) {
            return res.status(400).json({
                message: "Please fill in all required fields."
            });
        }

        // Validate password
        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters."
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match."
            });
        }

        const normalizedLibraryEmail = libraryEmail.trim().toLowerCase();
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedStudentId = studentId.trim().toUpperCase();

        // Find library
        const library = await Library.findOne({
            email: normalizedLibraryEmail,
            status: "active"
        });

        if (!library) {
            return res.status(404).json({
                message: "Library not found or inactive."
            });
        }

        // Verify student record in that library
        const student = await Student.findOne({
            library: library._id,
            studentId: normalizedStudentId,
            email: normalizedEmail,
            status: "Active"
        });

        if (!student) {
            return res.status(404).json({
                message: "Student record not found. Please check your details or contact your library admin."
            });
        }

        // Check whether this student already has an account
        const existingStudentAccount = await User.findOne({
            student: student._id
        });

        if (existingStudentAccount) {
            return res.status(409).json({
                message: "An account already exists for this student. Please login."
            });
        }

        // Check globally unique email
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "This email is already registered. Please use your registered student email."
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create student login account
        const user = await User.create({
            name: student.name,
            email: student.email,
            password: hashedPassword,
            phone: student.phone,
            role: "student",
            student: student._id,
            library: library._id
        });

        return res.status(201).json({
            message: "Student account created successfully!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                studentId: student.studentId,
                libraryId: library._id
            }
        });

    } catch (error) {
        console.error("Student Registration Error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "An account with these details already exists."
            });
        }

        return res.status(500).json({
            message: "Student registration failed. Please try again."
        });
    }
};


// ==========================================
// 3. LOGIN USER (ADMIN + STUDENT)
// ==========================================

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user || user.status !== "active") {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Student accounts must be linked to a student record
        if (user.role === "student" && !user.student) {
            return res.status(403).json({
                message: "Student account is not properly linked. Please contact your library admin."
            });
        }

        // Generate authentication token
        const token = jwt.sign(
            {
                userId: user._id,
                libraryId: user.library,
                role: user.role,
                studentId: user.student || null
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            message: "Login successful!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                studentId: user.student || null,
                libraryId: user.library
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            message: "Login failed. Please try again."
        });
    }
};


// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {
    registerLibrary,
    registerStudent,
    loginUser
};