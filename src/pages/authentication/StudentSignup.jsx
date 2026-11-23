import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    LibraryBig,
    Mail,
    User,
    LockKeyhole,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck,
    GraduationCap,
    Building2
} from "lucide-react";

import "./Login.css";
import "./StudentSignup.css";

const StudentSignup = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        libraryEmail: "",
        studentId: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    // HANDLE INPUT CHANGES
    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };


    // HANDLE STUDENT REGISTRATION
    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");

        if (formData.password !== formData.confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        if (formData.password.length < 8) {
            setMessage("Password must contain at least 8 characters.");
            return;
        }

        setLoading(true);

        try {

            const response = await fetch(
                "http://localhost:5000/api/auth/register-student",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(formData)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Student registration failed."
                );
            }

            alert("Student account created successfully! Please login.");

            navigate("/login");

        } catch (error) {

            setMessage(
                error.message || "Student registration failed."
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="auth-page student-signup-page">


            {/* =====================================
                LEFT BRANDING PANEL
            ===================================== */}

            <div className="auth-brand-panel">

                <div className="auth-brand-content">

                    <Link to="/" className="auth-brand-logo">

                        <div className="auth-logo-icon">
                            <LibraryBig size={27} />
                        </div>

                        <span>LibraFlow</span>

                    </Link>


                    <div className="auth-brand-message">

                        <span className="auth-eyebrow">
                            STUDENT PORTAL
                        </span>

                        <h1>
                            Your Learning.
                            <br />
                            <span>One Dashboard.</span>
                        </h1>

                        <p>
                            Access your library digitally.
                            Explore books, manage borrowed books,
                            track due dates and stay connected
                            with your library.
                        </p>

                    </div>


                    <div className="auth-brand-features">

                        <div className="auth-feature">
                            <GraduationCap size={20} />
                            <span>Your personal student dashboard</span>
                        </div>

                        <div className="auth-feature">
                            <LibraryBig size={20} />
                            <span>Explore your library book collection</span>
                        </div>

                        <div className="auth-feature">
                            <ShieldCheck size={20} />
                            <span>Secure student account</span>
                        </div>

                    </div>

                </div>


                <div className="auth-brand-footer">
                    © 2026 LibraFlow. All rights reserved.
                </div>

            </div>



            {/* =====================================
                RIGHT REGISTRATION FORM
            ===================================== */}

            <div className="auth-form-panel">

                <div className="auth-form-wrapper">


                    {/* MOBILE LOGO */}

                    <div className="auth-mobile-logo">
                        <LibraryBig size={27} />
                        <span>LibraFlow</span>
                    </div>



                    {/* HEADING */}

                    <div className="auth-heading">

                        <span className="auth-small-label">
                            STUDENT REGISTRATION
                        </span>

                        <h2>Create Student Account</h2>

                        <p>
                            Enter your registered library details
                            to activate your student account.
                        </p>

                    </div>



                    {/* REGISTRATION FORM */}

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >


                        {/* LIBRARY EMAIL */}

                        <div className="auth-field">

                            <label htmlFor="libraryEmail">
                                Library Email
                            </label>

                            <div className="auth-input-wrapper">

                                <Building2 size={18} />

                                <input
                                    id="libraryEmail"
                                    name="libraryEmail"
                                    type="email"
                                    placeholder="Enter library email"
                                    value={formData.libraryEmail}
                                    onChange={handleChange}
                                    autoComplete="off"
                                    required
                                />

                            </div>

                        </div>



                        {/* STUDENT ID */}

                        <div className="auth-field">

                            <label htmlFor="studentId">
                                Student ID
                            </label>

                            <div className="auth-input-wrapper">

                                <GraduationCap size={18} />

                                <input
                                    id="studentId"
                                    name="studentId"
                                    type="text"
                                    placeholder="Example: STU001"
                                    value={formData.studentId}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>



                        {/* STUDENT EMAIL */}

                        <div className="auth-field">

                            <label htmlFor="email">
                                Registered Student Email
                            </label>

                            <div className="auth-input-wrapper">

                                <Mail size={18} />

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your registered email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    required
                                />

                            </div>

                        </div>



                        {/* PASSWORD */}

                        <div className="auth-field">

                            <label htmlFor="password">
                                Create Password
                            </label>

                            <div className="auth-input-wrapper">

                                <LockKeyhole size={18} />

                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Minimum 8 characters"
                                    value={formData.password}
                                    onChange={handleChange}
                                    minLength={8}
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword
                                        ? <EyeOff size={18} />
                                        : <Eye size={18} />
                                    }
                                </button>

                            </div>

                        </div>



                        {/* CONFIRM PASSWORD */}

                        <div className="auth-field">

                            <label htmlFor="confirmPassword">
                                Confirm Password
                            </label>

                            <div className="auth-input-wrapper">

                                <LockKeyhole size={18} />

                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Re-enter your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    aria-label="Toggle confirm password visibility"
                                >
                                    {showConfirmPassword
                                        ? <EyeOff size={18} />
                                        : <Eye size={18} />
                                    }
                                </button>

                            </div>

                        </div>



                        {/* ERROR MESSAGE */}

                        {message && (

                            <div className="auth-error">
                                {message}
                            </div>

                        )}



                        {/* REGISTER BUTTON */}

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading}
                        >

                            <span>
                                {loading
                                    ? "Creating Account..."
                                    : "Create Student Account"
                                }
                            </span>

                            {!loading && <ArrowRight size={19} />}

                        </button>


                    </form>



                    {/* LOGIN LINK */}

                    <div className="auth-switch">

                        Already registered?

                        <Link to="/login">
                            Sign in
                        </Link>

                    </div>



                    {/* SECURITY NOTE */}

                    <div className="auth-security-note">

                        <ShieldCheck size={16} />

                        <span>
                            Your student account is securely protected.
                        </span>

                    </div>


                </div>

            </div>

        </div>

    );

};

export default StudentSignup;