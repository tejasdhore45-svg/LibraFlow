// ======================================================
// LIBRARY MANAGEMENT SYSTEM - ADMIN SIDEBAR
// ======================================================

import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import API_URL from "../config/api";
import {
  LayoutDashboard,
  BookOpen,
  BookPlus,
  BookCheck,
  Users,
  ClipboardList,
  ClipboardCheck,
  LogOut,
  LibraryBig,
  X,
} from "lucide-react";

import "./Sidebar.css";

// ======================================================
// API CONFIGURATION
// ======================================================

const DASHBOARD_API = `${API_URL}/api/dashboard`;

// ======================================================
// SIDEBAR NAVIGATION ITEMS
// ======================================================

const menuItems = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Manage Books",
    path: "/admin/books",
    icon: BookOpen,
  },
  {
    label: "Issue Book",
    path: "/admin/issue",
    icon: BookPlus,
  },
  {
    label: "Return Book",
    path: "/admin/return",
    icon: BookCheck,
  },
  {
    label: "Manage Students",
    path: "/admin/students",
    icon: Users,
  },
  {
    label: "Manage Book Requests",
    path: "/admin/book-requests",
    icon: ClipboardCheck,
  },
  {
    label: "Transactions",
    path: "/admin/transactions",
    icon: ClipboardList,
  },
];

// ======================================================
// AVATAR INITIALS
// ======================================================

function getInitials(name) {
  if (!name) return "AD";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

// ======================================================
// SIDEBAR COMPONENT
// ======================================================

function Sidebar({ isOpen, closeSidebar }) {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState({
    name: "Library Admin",
    role: "Library Administrator",
  });

  const [libraryName, setLibraryName] = useState(
    "Library Management System"
  );

  // ====================================================
  // FETCH ADMIN AND LIBRARY INFORMATION
  // ====================================================

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const response = await fetch(DASHBOARD_API, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load administrator profile."
          );
        }

        setAdmin({
          name: data.admin?.name || "Library Admin",
          role: "Library Administrator",
        });

        setLibraryName(
          data.library?.name || "Library Management System"
        );

      } catch (error) {
        console.error("Sidebar Profile Error:", error);
      }
    }

    fetchProfile();
  }, []);

  // ====================================================
  // LOGOUT
  // ====================================================

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    closeSidebar();

    navigate("/login", { replace: true });
  }

  // ====================================================
  // RETURN JSX
  // ====================================================

  return (
    <aside
      className={`lms-sidebar ${
        isOpen ? "sidebar-open" : ""
      }`}
    >

      {/* ================= BRAND ================= */}

      <div className="sidebar-brand">

        <div className="brand-icon">
          <LibraryBig size={26} strokeWidth={2} />
        </div>

        <div className="brand-text">
          <h2>LibraFlow</h2>
          <p>Library Management</p>
        </div>

        {/* Mobile Close Button */}

        <button
          type="button"
          className="sidebar-close-btn"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        >
          <X size={21} />
        </button>

      </div>

      {/* ================= NAVIGATION ================= */}

      <div className="sidebar-navigation">

        <p className="sidebar-section-title">
          MAIN MENU
        </p>

        <nav
          className="sidebar-menu"
          aria-label="Admin navigation"
        >

          {menuItems.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  isActive
                    ? "sidebar-link active"
                    : "sidebar-link"
                }
              >
                <Icon
                  size={20}
                  strokeWidth={1.9}
                />

                <span>{item.label}</span>
              </NavLink>
            );
          })}

        </nav>

      </div>

      {/* ================= BOTTOM ================= */}

      <div className="sidebar-bottom">

        {/* ADMIN PROFILE */}

        <div
          className="sidebar-profile"
          title={`${admin.name} - ${libraryName}`}
        >

          <div className="profile-avatar">
            {getInitials(admin.name)}
          </div>

          <div className="profile-details">
            <h4>{admin.name}</h4>
            <p>{admin.role}</p>
          </div>

        </div>

        {/* LOGOUT */}

        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
        >
          <LogOut size={19} />
          <span>Logout</span>
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;