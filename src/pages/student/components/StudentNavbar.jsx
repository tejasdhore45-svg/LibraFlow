import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Menu,
    Search,
    Bell,
    ChevronDown,
    UserRound,
    Settings,
    LogOut
} from "lucide-react";

import "./StudentNavbar.css";

function StudentNavbar({ onMenuClick }) {

    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const navigate = useNavigate();

    // Navigate to Browse Books
    const handleSearch = () => {
        navigate("/student/books");
    };

    // Navigate to Profile
    const handleProfile = () => {
        setIsProfileOpen(false);
        navigate("/student/profile");
    };

    // Logout placeholder
    const handleLogout = () => {
        setIsProfileOpen(false);
        console.log("Logout clicked");
        // Authentication logout will be connected later.
    };

    return (
        <header className="student-navbar">

            {/* Left Section */}
            <div className="student-navbar-left">

                <button
                    className="student-menu-toggle"
                    onClick={onMenuClick}
                    aria-label="Open navigation menu"
                >
                    <Menu size={23} />
                </button>

                <div className="student-navbar-heading">
                    <h2>Student Portal</h2>
                    <p>Manage your library activities</p>
                </div>

            </div>


            {/* Right Section */}
            <div className="student-navbar-right">

                {/* Search Button */}
                <button
                    className="student-search-button"
                    onClick={handleSearch}
                    aria-label="Search books"
                >
                    <Search size={19} />
                    <span>Search books</span>
                </button>


                {/* Notifications */}
                <button
                    className="student-notification-button"
                    aria-label="Notifications"
                    onClick={() => {
                        console.log("Notifications clicked");
                    }}
                >
                    <Bell size={20} />
                    <span className="student-notification-dot"></span>
                </button>


                {/* Profile Section */}
                <div className="student-navbar-profile">

                    <button
                        className="student-profile-trigger"
                        onClick={() => setIsProfileOpen(prev => !prev)}
                        aria-expanded={isProfileOpen}
                    >

                        <div className="student-navbar-avatar">
                            T
                        </div>

                        <div className="student-navbar-user">
                            <h4>Student Name</h4>
                            <span>Student</span>
                        </div>

                        <ChevronDown
                            size={17}
                            className={isProfileOpen ? "rotate" : ""}
                        />

                    </button>


                    {/* Profile Dropdown */}
                    {isProfileOpen && (

                        <div className="student-profile-dropdown">

                            <button onClick={handleProfile}>
                                <UserRound size={17} />
                                <span>My Profile</span>
                            </button>

                            <button
                                onClick={() => {
                                    setIsProfileOpen(false);
                                    console.log("Settings clicked");
                                }}
                            >
                                <Settings size={17} />
                                <span>Settings</span>
                            </button>

                            <div className="student-dropdown-divider"></div>

                            <button
                                className="student-dropdown-logout"
                                onClick={handleLogout}
                            >
                                <LogOut size={17} />
                                <span>Logout</span>
                            </button>

                        </div>

                    )}

                </div>

            </div>

        </header>
    );
}

export default StudentNavbar;