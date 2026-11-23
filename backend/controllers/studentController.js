const mongoose = require("mongoose");

const Student = require("../models/Student");
const User = require("../models/User");
const Library = require("../models/Library");
const Issue = require("../models/Issue");

// ============================================
// ADMIN: GET ALL STUDENTS FROM OWN LIBRARY
// ============================================

const getStudents = async (req, res) => {
    try {
        const students = await Student.find({
            library: req.user.libraryId
        }).sort({ createdAt: -1 });

        res.status(200).json(students);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ============================================
// ADMIN: ADD NEW STUDENT
// ============================================

const addStudent = async (req, res) => {
    try {
        const {
            studentId,
            name,
            email,
            phone,
            department,
            year,
            status
        } = req.body;

        if (!studentId || !name || !email || !phone || !department || !year) {
            return res.status(400).json({
                message: "Please complete all required fields."
            });
        }

        const student = await Student.create({
            studentId,
            name,
            email: email.trim().toLowerCase(),
            phone,
            department,
            year,
            status: status || "Active",
            library: req.user.libraryId
        });

        res.status(201).json(student);

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Student ID or email already exists in this library."
            });
        }

        res.status(500).json({ message: error.message });
    }
};


// ============================================
// ADMIN: UPDATE STUDENT
// ============================================

const updateStudent = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            department,
            year,
            status
        } = req.body;

        const student = await Student.findOne({
            _id: req.params.id,
            library: req.user.libraryId
        });

        if (!student) {
            return res.status(404).json({
                message: "Student not found."
            });
        }

        // Prevent deactivation while books are borrowed.
        if (student.status === "Active" && status === "Inactive") {
            const activeIssue = await Issue.findOne({
                student: student._id,
                library: req.user.libraryId,
                status: "Issued"
            });

            if (activeIssue) {
                return res.status(400).json({
                    message: "Return all borrowed books before deactivating this student."
                });
            }
        }

        student.name = name ?? student.name;
        student.email = email
            ? email.trim().toLowerCase()
            : student.email;
        student.phone = phone ?? student.phone;
        student.department = department ?? student.department;
        student.year = year ?? student.year;
        student.status = status ?? student.status;

        await student.save();

        res.status(200).json(student);

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Email already exists in this library."
            });
        }

        res.status(500).json({ message: error.message });
    }
};


// ============================================
// ADMIN: DELETE STUDENT
// ============================================

const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findOne({
            _id: req.params.id,
            library: req.user.libraryId
        });

        if (!student) {
            return res.status(404).json({
                message: "Student not found."
            });
        }

        const activeIssue = await Issue.findOne({
            student: student._id,
            library: req.user.libraryId,
            status: "Issued"
        });

        if (activeIssue) {
            return res.status(400).json({
                message: "Cannot delete a student while they have borrowed books."
            });
        }

        await student.deleteOne();

        res.status(200).json({
            message: "Student deleted successfully."
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ============================================
// STUDENT: GET OWN PROFILE
// ============================================

const getMyProfile = async (req, res) => {
    try {

        // Only student accounts can access this API.
        if (req.user.role !== "student" || !req.user.studentId) {
            return res.status(403).json({
                message: "Only students can access this profile."
            });
        }

        // Find the authenticated student's record.
        const student = await Student.findOne({
            _id: req.user.studentId,
            library: req.user.libraryId
        });

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found."
            });
        }

        // Find the corresponding login account.
        const user = await User.findOne({
            _id: req.user.userId,
            student: student._id,
            library: req.user.libraryId,
            role: "student"
        }).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "Student account not found."
            });
        }

        // Get the student's assigned library.
        const library = await Library.findById(
            req.user.libraryId
        ).select("name email phone address");

        res.status(200).json({
            student: {
                id: student._id,
                name: student.name,
                studentId: student.studentId,
                email: student.email,
                phone: student.phone,
                department: student.department,
                year: student.year,
                status: student.status
            },

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone
            },

            library: library ? {
                id: library._id,
                name: library.name,
                address: library.address
            } : null
        });

    } catch (error) {
        console.error("Get My Profile Error:", error);

        res.status(500).json({
            message: "Unable to fetch profile."
        });
    }
};


// ============================================
// STUDENT: UPDATE OWN PROFILE
// ============================================

const updateMyProfile = async (req, res) => {

    const session = await mongoose.startSession();

    try {

        if (req.user.role !== "student" || !req.user.studentId) {
            return res.status(403).json({
                message: "Only students can update their profile."
            });
        }

        const { name, email, phone } = req.body;

        // Accept only permitted fields.
        if (
            name === undefined &&
            email === undefined &&
            phone === undefined
        ) {
            return res.status(400).json({
                message: "Please provide information to update."
            });
        }

        const normalizedName = name !== undefined
            ? String(name).trim()
            : undefined;

        const normalizedEmail = email !== undefined
            ? String(email).trim().toLowerCase()
            : undefined;

        const normalizedPhone = phone !== undefined
            ? String(phone).trim()
            : undefined;

        if (
            (normalizedName !== undefined && !normalizedName) ||
            (normalizedEmail !== undefined && !normalizedEmail) ||
            (normalizedPhone !== undefined && !normalizedPhone)
        ) {
            return res.status(400).json({
                message: "Name, email and phone cannot be empty."
            });
        }

        if (
            normalizedEmail !== undefined &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
        ) {
            return res.status(400).json({
                message: "Please enter a valid email address."
            });
        }

        await session.withTransaction(async () => {

            // Find only the authenticated student's record.
            const student = await Student.findOne({
                _id: req.user.studentId,
                library: req.user.libraryId
            }).session(session);

            if (!student) {
                throw new Error("Student profile not found.");
            }

            // Find the matching login account.
            const user = await User.findOne({
                _id: req.user.userId,
                student: student._id,
                library: req.user.libraryId,
                role: "student"
            }).session(session);

            if (!user) {
                throw new Error("Student account not found.");
            }

            // Check global email uniqueness.
            if (
                normalizedEmail !== undefined &&
                normalizedEmail !== user.email
            ) {
                const existingUser = await User.findOne({
                    email: normalizedEmail,
                    _id: { $ne: user._id }
                }).session(session);

                if (existingUser) {
                    throw new Error("This email is already registered.");
                }

                // Check email uniqueness within this library.
                const existingStudent = await Student.findOne({
                    email: normalizedEmail,
                    library: req.user.libraryId,
                    _id: { $ne: student._id }
                }).session(session);

                if (existingStudent) {
                    throw new Error(
                        "This email is already used by another student in this library."
                    );
                }
            }

            // Update both Student and User records.
            if (normalizedName !== undefined) {
                student.name = normalizedName;
                user.name = normalizedName;
            }

            if (normalizedEmail !== undefined) {
                student.email = normalizedEmail;
                user.email = normalizedEmail;
            }

            if (normalizedPhone !== undefined) {
                student.phone = normalizedPhone;
                user.phone = normalizedPhone;
            }

            await student.save({ session });
            await user.save({ session });

        });

        // Return the updated profile after successful transaction.
        const student = await Student.findOne({
            _id: req.user.studentId,
            library: req.user.libraryId
        });

        const user = await User.findOne({
            _id: req.user.userId,
            student: req.user.studentId,
            library: req.user.libraryId
        }).select("-password");

        const library = await Library.findById(
            req.user.libraryId
        ).select("name address");

        res.status(200).json({
            message: "Profile updated successfully!",

            student: {
                id: student._id,
                name: student.name,
                studentId: student.studentId,
                email: student.email,
                phone: student.phone,
                department: student.department,
                year: student.year,
                status: student.status
            },

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone
            },

            library: library ? {
                id: library._id,
                name: library.name,
                address: library.address
            } : null
        });

    } catch (error) {

        console.error("Update My Profile Error:", error);

        if (error.message === "Student profile not found.") {
            return res.status(404).json({
                message: error.message
            });
        }

        if (error.message === "Student account not found.") {
            return res.status(404).json({
                message: error.message
            });
        }

        if (
            error.message === "This email is already registered." ||
            error.message.includes("already used by another student")
        ) {
            return res.status(409).json({
                message: error.message
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                message: "This email is already registered."
            });
        }

        res.status(500).json({
            message: "Unable to update profile."
        });

    } finally {
        await session.endSession();
    }
};


// ============================================
// EXPORT FUNCTIONS
// ============================================

module.exports = {
    getStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    getMyProfile,
    updateMyProfile
};