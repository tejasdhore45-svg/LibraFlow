import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    LibraryBig,
    Building2,
    Mail,
    Phone,
    MapPin,
    User,
    LockKeyhole,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck
} from "lucide-react";

import "./Signup.css";

const Signup = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        libraryName: "",
        libraryEmail: "",
        phone: "",
        address: "",
        adminName: "",
        adminEmail: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/register-library",
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
                throw new Error(data.message || "Registration failed.");
            }

            alert("Library registered successfully!");

            navigate("/login");

        } catch (error) {
            setMessage(error.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-page">

            {/* LEFT BRANDING PANEL */}
            <div className="signup-brand-panel">

                <div className="signup-brand-content">

                    <Link to="/" className="signup-brand-logo">

                        <div className="signup-logo-icon">
                            <LibraryBig size={27} />
                        </div>

                        <span>LibraFlow</span>

                    </Link>


                    <div className="signup-brand-message">

                        <span className="signup-eyebrow">
                            GET STARTED WITH LIBRAFLOW
                        </span>

                        <h1>
                            Build a Smarter
                            <br />
                            <span>Digital Library.</span>
                        </h1>

                        <p>
                            Bring your library operations together.
                            Manage books, students and transactions
                            through your own independent dashboard.
                        </p>

                    </div>


                    <div className="signup-benefits">

                        <div className="signup-benefit">
                            <ShieldCheck size={20} />
                            <span>Secure administrator account</span>
                        </div>

                        <div className="signup-benefit">
                            <Building2 size={20} />
                            <span>Your own independent library</span>
                        </div>

                        <div className="signup-benefit">
                            <LibraryBig size={20} />
                            <span>Start managing your library digitally</span>
                        </div>

                    </div>

                </div>


                <div className="signup-brand-footer">
                    © 2026 LibraFlow. All rights reserved.
                </div>

            </div>


            {/* RIGHT REGISTRATION FORM */}
            <div className="signup-form-panel">

                <div className="signup-form-wrapper">

                    <div className="signup-mobile-logo">
                        <LibraryBig size={27} />
                        <span>LibraFlow</span>
                    </div>


                    <div className="signup-heading">

                        <span className="signup-small-label">
                            CREATE YOUR ACCOUNT
                        </span>

                        <h2>Register your library</h2>

                        <p>
                            Complete the details below to create
                            your library management account.
                        </p>

                    </div>


                    <form onSubmit={handleSubmit} className="signup-form">

                        {/* LIBRARY DETAILS */}

                        <div className="signup-section-heading">

                            <div className="signup-section-icon">
                                <Building2 size={19} />
                            </div>

                            <div>
                                <h3>Library Information</h3>
                                <p>Tell us about your library.</p>
                            </div>

                        </div>


                        <div className="signup-field">

                            <label htmlFor="libraryName">
                                Library Name
                            </label>

                            <div className="signup-input-wrapper">

                                <Building2 size={18} />

                                <input
                                    id="libraryName"
                                    name="libraryName"
                                    type="text"
                                    placeholder="Enter library name"
                                    value={formData.libraryName}
                                    onChange={handleChange}
                                    autoComplete="organization"
                                    required
                                />

                            </div>

                        </div>


                        <div className="signup-field">

                            <label htmlFor="libraryEmail">
                                Library Email
                            </label>

                            <div className="signup-input-wrapper">

                                <Mail size={18} />

                                <input
                                    id="libraryEmail"
                                    name="libraryEmail"
                                    type="email"
                                    placeholder="library@example.com"
                                    value={formData.libraryEmail}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>


                        <div className="signup-field">

                            <label htmlFor="phone">
                                Phone Number
                            </label>

                            <div className="signup-input-wrapper">

                                <Phone size={18} />

                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="Enter phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    autoComplete="tel"
                                    required
                                />

                            </div>

                        </div>


                        <div className="signup-field">

                            <label htmlFor="address">
                                Library Address
                            </label>

                            <div className="signup-input-wrapper">

                                <MapPin size={18} />

                                <input
                                    id="address"
                                    name="address"
                                    type="text"
                                    placeholder="Enter complete address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    autoComplete="street-address"
                                    required
                                />

                            </div>

                        </div>


                        {/* ADMIN DETAILS */}

                        <div className="signup-section-heading admin-section">

                            <div className="signup-section-icon">
                                <User size={19} />
                            </div>

                            <div>
                                <h3>Administrator Account</h3>
                                <p>Create your admin login credentials.</p>
                            </div>

                        </div>


                        <div className="signup-field">

                            <label htmlFor="adminName">
                                Administrator Name
                            </label>

                            <div className="signup-input-wrapper">

                                <User size={18} />

                                <input
                                    id="adminName"
                                    name="adminName"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={formData.adminName}
                                    onChange={handleChange}
                                    autoComplete="name"
                                    required
                                />

                            </div>

                        </div>


                        <div className="signup-field">

                            <label htmlFor="adminEmail">
                                Administrator Email
                            </label>

                            <div className="signup-input-wrapper">

                                <Mail size={18} />

                                <input
                                    id="adminEmail"
                                    name="adminEmail"
                                    type="email"
                                    placeholder="Enter admin email"
                                    value={formData.adminEmail}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    required
                                />

                            </div>

                        </div>


                        <div className="signup-field">

                            <label htmlFor="password">
                                Create Password
                            </label>

                            <div className="signup-input-wrapper">

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
                                    className="signup-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword
                                        ? <EyeOff size={18} />
                                        : <Eye size={18} />
                                    }
                                </button>

                            </div>

                            <span className="signup-field-hint">
                                Password must contain at least 8 characters.
                            </span>

                        </div>


                        {/* ERROR MESSAGE */}

                        {message && (
                            <div className="signup-error">
                                {message}
                            </div>
                        )}


                        {/* REGISTER BUTTON */}

                        <button
                            type="submit"
                            className="signup-submit-btn"
                            disabled={loading}
                        >

                            <span>
                                {loading
                                    ? "Creating Account..."
                                    : "Create Library Account"
                                }
                            </span>

                            {!loading && <ArrowRight size={19} />}

                        </button>

                    </form>


                    <div className="signup-switch">

                        Already have an account?

                        <Link to="/login">
                            Sign in
                        </Link>

                    </div>


                    <div className="signup-security-note">
                        <ShieldCheck size={16} />
                        Your information is securely protected.
                    </div>

                </div>

            </div>

        </div>
    );
};

export default Signup;