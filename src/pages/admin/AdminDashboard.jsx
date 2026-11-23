// ======================================================
// LIBRARY MANAGEMENT SYSTEM - ADMIN DASHBOARD
// ======================================================

import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  ArrowRight,
  BookOpen,
  BookPlus,
  BookCheck,
  Users,
  ClipboardList,
  Clock3,
  RefreshCw,
} from "lucide-react";

import StatCard from "../../components/Statcard";

import "./AdminDashboard.css";

// ======================================================
// API CONFIGURATION
// ======================================================

const DASHBOARD_API = `${API_URL}/dashboard`;

// ======================================================
// DATE HELPER
// ======================================================

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ======================================================
// QUICK ACTIONS
// ======================================================

const quickActions = [
  {
    title: "Manage Books",
    description: "Add, edit, and organize books",
    path: "/admin/books",
    icon: BookOpen,
    theme: "blue",
  },
  {
    title: "Issue Book",
    description: "Issue a book to a student",
    path: "/admin/issue",
    icon: BookPlus,
    theme: "purple",
  },
  {
    title: "Return Book",
    description: "Process borrowed book returns",
    path: "/admin/return",
    icon: BookCheck,
    theme: "green",
  },
  {
    title: "Manage Students",
    description: "View and manage library members",
    path: "/admin/students",
    icon: Users,
    theme: "orange",
  },
];

// ======================================================
// ADMIN DASHBOARD COMPONENT
// ======================================================

function AdminDashboard() {
  const location = useLocation();

  // Dashboard data
  const [dashboardData, setDashboardData] = useState({
    library: { name: "" },
    admin: { name: "" },
    stats: {
      totalBooks: 0,
      availableBooks: 0,
      issuedBooks: 0,
      overdueBooks: 0,
      totalStudents: 0,
      returnedBooks: 0,
    },
    recentTransactions: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // ====================================================
  // FETCH DASHBOARD DATA FROM BACKEND
  // ====================================================

  const refreshDashboard = useCallback(async () => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }

      const response = await fetch(DASHBOARD_API, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load dashboard data."
        );
      }

      setDashboardData({
        library: data.library || { name: "" },
        admin: data.admin || { name: "" },
        stats: {
          totalBooks: data.stats?.totalBooks || 0,
          availableBooks: data.stats?.availableBooks || 0,
          issuedBooks: data.stats?.issuedBooks || 0,
          overdueBooks: data.stats?.overdueBooks || 0,
          totalStudents: data.stats?.totalStudents || 0,
          returnedBooks: data.stats?.returnedBooks || 0,
        },
        recentTransactions: Array.isArray(data.recentTransactions)
          ? data.recentTransactions
          : [],
      });

      setLastUpdated(new Date());

    } catch (err) {
      console.error("Dashboard Error:", err);
      setError(err.message || "Something went wrong.");

    } finally {
      setLoading(false);
    }
  }, []);

  // ====================================================
  // LOAD DASHBOARD DATA
  // ====================================================

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard, location.key]);

  // Refresh when the browser window receives focus
  useEffect(() => {
    function handleFocus() {
      refreshDashboard();
    }

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [refreshDashboard]);

  // ====================================================
  // STATISTICS CONFIGURATION
  // ====================================================

  const libraryStats = [
    {
      title: "Total Books",
      value: dashboardData.stats.totalBooks,
      type: "totalBooks",
      description: "Total copies in the library",
    },
    {
      title: "Available Books",
      value: dashboardData.stats.availableBooks,
      type: "availableBooks",
      description: "Ready to borrow",
    },
    {
      title: "Issued Books",
      value: dashboardData.stats.issuedBooks,
      type: "issuedBooks",
      description: "Currently borrowed copies",
    },
    {
      title: "Overdue Books",
      value: dashboardData.stats.overdueBooks,
      type: "overdueBooks",
      description: "Returns past their due date",
    },
    {
      title: "Total Students",
      value: dashboardData.stats.totalStudents,
      type: "totalStudents",
      description: "Registered library members",
    },
  ];

  // ====================================================
  // RETURN JSX
  // ====================================================

  return (
    <main className="dashboard-content">

      {/* ================= PAGE HEADER ================= */}

      <div className="dashboard-header">

        <div>
          <h1>Library Overview</h1>

          <p>
            Monitor library activity, books, and
            student records in one place.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-refresh-btn"
          onClick={refreshDashboard}
          disabled={loading}
        >
          <RefreshCw size={17} />

          <span>{loading ? "Refreshing..." : "Refresh Data"}</span>
        </button>

      </div>

      {/* ================= ERROR MESSAGE ================= */}

      {error && (
        <div
          role="alert"
          style={{
            padding: "12px 16px",
            marginBottom: "20px",
            borderRadius: "8px",
            background: "#fee2e2",
            color: "#991b1b",
          }}
        >
          {error}
        </div>
      )}

      {/* ================= STATISTICS ================= */}

      <section
        className="dashboard-section"
        aria-label="Library statistics"
      >

        <div className="dashboard-section-heading">
          <div>
            <h2>Library Statistics</h2>

            <p>
              Current overview of your library records
            </p>
          </div>
        </div>

        <div className="stats-container">

          {libraryStats.map((stat) => (
            <StatCard
              key={stat.type}
              title={stat.title}
              value={stat.value}
              type={stat.type}
              description={stat.description}
            />
          ))}

        </div>

      </section>

      {/* ================= LOWER DASHBOARD ================= */}

      <div className="dashboard-bottom-grid">

        {/* =============== RECENT TRANSACTIONS =============== */}

        <section className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>
              <h2>Recent Transactions</h2>

              <p>
                Latest book issue and return records
              </p>
            </div>

            <Link
              to="/admin/transactions"
              className="dashboard-view-all"
            >
              View All

              <ArrowRight size={16} />
            </Link>

          </div>

          {loading ? (

            <div className="dashboard-empty-state">
              <RefreshCw size={28} />
              <h3>Loading transactions...</h3>
            </div>

          ) : dashboardData.recentTransactions.length === 0 ? (

            <div className="dashboard-empty-state">

              <ClipboardList size={32} />

              <h3>No transactions yet</h3>

              <p>
                Book issue and return records will
                appear here once transactions begin.
              </p>

              <Link to="/admin/issue">
                Issue Your First Book
              </Link>

            </div>

          ) : (

            <div className="dashboard-table-wrapper">

              <table className="dashboard-table">

                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Student</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>

                  {dashboardData.recentTransactions.map(
                    (transaction, index) => {

                      const displayStatus = transaction.status || "Issued";

                      return (
                        <tr key={transaction._id || index}>

                          <td>
                            <span className="dashboard-book-name">
                              {transaction.bookTitle || "Unknown Book"}
                            </span>
                          </td>

                          <td>
                            {transaction.studentName || "Unknown Student"}
                          </td>

                          <td>
                            <span
                              className={`dashboard-status dashboard-status--${displayStatus.toLowerCase()}`}
                            >
                              {displayStatus}
                            </span>
                          </td>

                          <td>
                            {formatDate(transaction.date)}
                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

        {/* ================= QUICK ACTIONS ================= */}

        <section className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>
              <h2>Quick Actions</h2>

              <p>
                Access important library operations
              </p>
            </div>

          </div>

          <div className="dashboard-actions">

            {quickActions.map((action) => {

              const Icon = action.icon;

              return (
                <Link
                  key={action.path}
                  to={action.path}
                  className="dashboard-action"
                >

                  <div
                    className={`dashboard-action-icon dashboard-action-icon--${action.theme}`}
                  >
                    <Icon size={20} />
                  </div>

                  <div className="dashboard-action-text">
                    <h3>{action.title}</h3>

                    <p>{action.description}</p>
                  </div>

                  <ArrowRight
                    size={18}
                    className="dashboard-action-arrow"
                  />

                </Link>
              );
            })}

          </div>

        </section>

      </div>

      {/* ================= DASHBOARD FOOTER ================= */}

      <div className="dashboard-footer">

        <span>
          <Clock3 size={15} />

          Last refreshed:{" "}
          {lastUpdated
            ? lastUpdated.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Not updated yet"}
        </span>

        <span>
          {dashboardData.stats.returnedBooks.toLocaleString("en-IN")}{" "}
          completed returns
        </span>

      </div>

    </main>
  );
}

export default AdminDashboard;
