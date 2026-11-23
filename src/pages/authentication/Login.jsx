import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    LibraryBig,
    Mail,
    LockKeyhole,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck
} from "lucide-react";

import "./Login.css";

const Login = () => {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed.");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            if (data.user.role === "admin") {
                navigate("/admin/dashboard");
            } else if (data.user.role === "student") {
                navigate("/student/dashboard");
            }

        } catch (error) {
            setMessage(error.message || "Login failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            {/* LEFT BRANDING SECTION */}
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
                            SMART LIBRARY MANAGEMENT
                        </span>

                        <h1>
                            Your Library.
                            <br />
                            Your <span>Digital Future.</span>
                        </h1>

                        <p>
                            Simplify library operations, manage books,
                            organize students and track every transaction
                            with one powerful platform.
                        </p>

                    </div>

                    <div className="auth-brand-features">

                        <div className="auth-feature">
                            <ShieldCheck size={20} />
                            <span>Secure account access</span>
                        </div>

                        <div className="auth-feature">
                            <LibraryBig size={20} />
                            <span>Independent library management</span>
                        </div>

                    </div>

                </div>

                <div className="auth-brand-footer">
                    © 2026 LibraFlow. All rights reserved.
                </div>

            </div>


            {/* RIGHT LOGIN SECTION */}
            <div className="auth-form-panel">

                <div className="auth-form-wrapper">

                    <div className="auth-mobile-logo">
                        <LibraryBig size={27} />
                        <span>LibraFlow</span>
                    </div>

                    <div className="auth-heading">

                        <span className="auth-small-label">
                            WELCOME BACK
                        </span>

                        <h2>Sign in to your account</h2>

                        <p>
                            Enter your credentials to access your
                            library dashboard.
                        </p>

                    </div>


                    <form onSubmit={handleSubmit} className="auth-form">

                        {/* EMAIL */}
                        <div className="auth-field">

                            <label htmlFor="login-email">
                                Email Address
                            </label>

                            <div className="auth-input-wrapper">

                                <Mail size={19} />

                                <input
                                    id="login-email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="username"
                                    required
                                />

                            </div>

                        </div>


                        {/* PASSWORD */}
                        <div className="auth-field">

                            <label htmlFor="login-password">
                                Password
                            </label>

                            <div className="auth-input-wrapper">

                                <LockKeyhole size={19} />

                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword
                                        ? <EyeOff size={19} />
                                        : <Eye size={19} />
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


                        {/* SUBMIT BUTTON */}
                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading}
                        >
                            <span>
                                {loading ? "Signing in..." : "Sign In"}
                            </span>

                            {!loading && <ArrowRight size={19} />}
                        </button>

                    </form>


                    <div className="auth-switch">

                        Don't have a library account?

                        <Link to="/signup">
                            Register your library
                        </Link>

                        <br />

                        Are you a student?

                        <Link to="/student-signup">
                            Create student account
                        </Link>

                    </div>

                    <div className="auth-security-note">
                        <ShieldCheck size={16} />
                        Your account information is securely protected.
                    </div>

                </div>

            </div>

        </div>
    );
};

export default Login;