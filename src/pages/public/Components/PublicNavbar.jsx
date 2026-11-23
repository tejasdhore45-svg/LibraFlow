import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Menu, X, ArrowRight } from "lucide-react";

import "./PublicNavbar.css";

const PublicNavbar = () => {

    // State for mobile navigation
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Close mobile menu after clicking a navigation link
    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <header className="public-navbar">

            <div className="navbar-container">

                {/* Logo Section */}
                <Link to="/" className="navbar-logo" onClick={closeMenu}>

                    <div className="navbar-logo-icon">
                        <BookOpen size={25} strokeWidth={2.2} />
                    </div>

                    <span>
                        Libra<span className="logo-highlight">Flow</span>
                    </span>

                </Link>


                {/* Desktop Navigation */}
                <nav
                    id="public-navigation"
                    className={`navbar-links ${isMenuOpen ? "active" : ""}`}
                    aria-label="Main navigation"
                >

                    <a href="#home" onClick={closeMenu}>
                        Home
                    </a>

                    <a href="#features" onClick={closeMenu}>
                        Features
                    </a>

                    <a href="#how-it-works" onClick={closeMenu}>
                        How It Works
                    </a>

                    <a href="#pricing" onClick={closeMenu}>
                        Pricing
                    </a>

                    {/* Mobile Authentication Buttons */}
                    <div className="mobile-auth-buttons">

                        <Link
                            to="/login"
                            className="mobile-login-button"
                            onClick={closeMenu}
                        >
                            Login
                        </Link>

                        <Link
                            to="/signup"
                            className="mobile-signup-button"
                            onClick={closeMenu}
                        >
                            Get Started
                            <ArrowRight size={16} />
                        </Link>

                    </div>

                </nav>


                {/* Desktop Authentication Buttons */}
                <div className="navbar-actions">

                    <Link to="/login" className="navbar-login">
                        Login
                    </Link>

                    <Link to="/signup" className="navbar-signup">
                        Get Started
                        <ArrowRight size={17} />
                    </Link>

                </div>


                {/* Mobile Menu Toggle */}
                <button
                    className="navbar-menu-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={isMenuOpen}
                    aria-controls="public-navigation"
                    type="button"
                >

                    {isMenuOpen ? (
                        <X size={25} />
                    ) : (
                        <Menu size={25} />
                    )}

                </button>

            </div>

        </header>
    );
};

export default PublicNavbar;