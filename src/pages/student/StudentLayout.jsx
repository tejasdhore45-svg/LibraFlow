import { useState } from "react";
import { Outlet } from "react-router-dom";

import StudentSidebar from "./components/StudentSidebar";
import StudentNavbar from "./components/StudentNavbar";

import "./StudentLayout.css";

function StudentLayout() {

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Open or close the mobile sidebar
    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    // Close sidebar after navigation
    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="student-layout">

            {/* Student Sidebar */}
            <StudentSidebar
                isOpen={isSidebarOpen}
                onClose={closeSidebar}
            />

            {/* Main Dashboard Area */}
            <div className="student-main">

                {/* Top Navbar */}
                <StudentNavbar
                    onMenuClick={toggleSidebar}
                />

                {/* Dynamic Page Content */}
                <main className="student-content">
                    <Outlet />
                </main>

            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="student-overlay"
                    onClick={closeSidebar}
                ></div>
            )}

        </div>
    );
}

export default StudentLayout;