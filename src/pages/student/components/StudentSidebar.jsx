import { NavLink, useNavigate } from "react-router-dom";

import {
    LayoutDashboard,
    BookOpen,
    BookMarked,
    ReceiptText,
    UserRound,
    Library,
    LogOut,
    X
} from "lucide-react";

import "./StudentSidebar.css";

function StudentSidebar({ isOpen, onClose }) {

    const navigate = useNavigate();

    // Student navigation menu
    const menuItems = [
        {
            name: "Dashboard",
            path: "/student/dashboard",
            icon: LayoutDashboard
        },
        {
            name: "Browse Books",
            path: "/student/books",
            icon: BookOpen
        },
        {
            name: "My Borrowed Books",
            path: "/student/borrowed-books",
            icon: BookMarked
        },
        {
            name: "Transactions",
            path: "/student/transactions",
            icon: ReceiptText
        },
        {
            name: "My Profile",
            path: "/student/profile",
            icon: UserRound
        }
    ];

    // ============================================
    // STUDENT LOGOUT
    // ============================================
    const handleLogout = () => {

        // Remove authentication data
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Close mobile sidebar
        onClose();

        // Redirect to login page
        navigate("/login", { replace: true });

    };

    return (
        <aside className={`student-sidebar ${isOpen ? "open" : ""}`}>

            {/* Sidebar Header */}
            <div className="student-sidebar-header">

                <div className="student-brand">
                    <div className="student-brand-icon">
                        <Library size={23} />
                    </div>

                    <div className="student-brand-text">
                        <h2>Library LMS</h2>
                        <span>Student Portal</span>
                    </div>
                </div>

                <button
                    className="student-sidebar-close"
                    onClick={onClose}
                    aria-label="Close navigation menu"
                >
                    <X size={21} />
                </button>

            </div>

            {/* Navigation Menu */}
            <div className="student-sidebar-menu">

                <p className="student-menu-heading">
                    MENU
                </p>

                <nav>

                    {menuItems.map((item) => {

                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                end={item.path === "/student/dashboard"}
                                className={({ isActive }) =>
                                    `student-menu-link ${isActive ? "active" : ""}`
                                }
                                onClick={onClose}
                            >
                                <Icon size={19} strokeWidth={1.9} />

                                <span>{item.name}</span>

                            </NavLink>
                        );

                    })}

                </nav>

            </div>

            {/* Sidebar Footer */}
            <div className="student-sidebar-footer">

                <div className="student-sidebar-profile">

                    <div className="student-profile-avatar">
                        T
                    </div>

                    <div className="student-profile-info">
                        <h4>Student Name</h4>
                        <span>Student Account</span>
                    </div>

                </div>

                {/* Logout Button */}
                <button
                    className="student-logout-button"
                    onClick={handleLogout}
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>

            </div>

        </aside>
    );
}

export default StudentSidebar;