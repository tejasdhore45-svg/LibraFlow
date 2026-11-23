// ======================================================
// LIBRARY MANAGEMENT SYSTEM - RETURN BOOK
// MULTI-LIBRARY MONGODB INTEGRATION
// ======================================================

import { useEffect, useRef, useState } from "react";
import {
  Search, BookOpen, BookCheck, Clock, AlertTriangle,
  RotateCcw, X, CheckCircle2, CalendarDays, RefreshCw,
} from "lucide-react";
import "./ReturnBook.css";
import API_URL from "../../config/api";

const ISSUES_API = `${API_URL}/api/issues`;

function todayLocal() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function ReturnBook() {
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const dialogRef = useRef(null);
  const returnFocusRef = useRef(null);

  // ============================================
  // API REQUEST
  // ============================================
  async function apiRequest(url, options = {}) {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Please login again. Authentication token is missing.");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong.");
    }

    return data;
  }

  // ============================================
  // FETCH LIBRARY ISSUE RECORDS
  // ============================================
  async function refreshRecords() {
    try {
      const data = await apiRequest(ISSUES_API);

      setIssues(data);
      setMessage(null);

    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Unable to load issue records."
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshRecords();

    const onFocus = () => refreshRecords();

    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // ============================================
  // MODAL FUNCTIONS
  // ============================================
  function closeModal() {
    if (busy) return;

    setSelectedIssue(null);

    requestAnimationFrame(() => {
      returnFocusRef.current?.focus();
    });
  }

  function openModal(issue, event) {
    returnFocusRef.current = event.currentTarget;
    setMessage(null);
    setSelectedIssue(issue);
  }

  useEffect(() => {
    if (!selectedIssue) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const dialog = dialogRef.current;

    dialog?.querySelector("button")?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
      }

      if (event.key === "Tab" && dialog) {
        const buttons = [
          ...dialog.querySelectorAll("button:not([disabled])")
        ];

        if (!buttons.length) return;

        const first = buttons[0];
        const last = buttons[buttons.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedIssue, busy]);

  // ============================================
  // CONFIRM RETURN
  // ============================================
  async function confirmReturn() {
    if (!selectedIssue || busy) return;

    setBusy(true);
    setMessage(null);

    try {
      const issueTitle = selectedIssue.bookTitle || "Book";

      await apiRequest(
        `${ISSUES_API}/${selectedIssue._id}/return`,
        {
          method: "PUT"
        }
      );

      setSelectedIssue(null);

      await refreshRecords();

      setMessage({
        type: "success",
        text: `“${issueTitle}” returned successfully.`
      });

      requestAnimationFrame(() => {
        returnFocusRef.current?.focus();
      });

    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Return failed."
      });

    } finally {
      setBusy(false);
    }
  }

  // ============================================
  // STATISTICS
  // ============================================
  const today = todayLocal();

  const activeIssues = issues.filter(
    (item) => item.status === "Issued"
  );

  const returnedIssues = issues.filter(
    (item) => item.status === "Returned"
  );

  const overdueIssues = activeIssues.filter(
    (item) =>
      item.dueDate &&
      String(item.dueDate).slice(0, 10) < today
  );

  // ============================================
  // SEARCH AND FILTER
  // ============================================
  const source =
    activeTab === "active" ? activeIssues : returnedIssues;

  const term = search.trim().toLowerCase();

  const filteredIssues = source
    .filter((issue) =>
      [
        issue.studentName,
        issue.studentId,
        issue.bookTitle,
        issue.isbn
      ].some((field) =>
        String(field ?? "").toLowerCase().includes(term)
      )
    )
    .sort((a, b) =>
      String(
        activeTab === "active"
          ? b.issueDate || ""
          : b.returnDate || ""
      ).localeCompare(
        String(
          activeTab === "active"
            ? a.issueDate || ""
            : a.returnDate || ""
        )
      )
    );

  // ============================================
  // UI
  // ============================================
  return (
    <main className="return-books-page">

      <div className="return-page-header">
        <div>
          <h1>Return Books</h1>
          <p>Manage book returns and track borrowing records.</p>
        </div>

        <button
          type="button"
          className="return-refresh-btn"
          onClick={refreshRecords}
        >
          <RefreshCw size={17} /> Refresh Records
        </button>
      </div>

      {message && (
        <div
          className={`return-notice ${
            message.type === "error" ? "error" : "success"
          }`}
          role="status"
        >
          {message.text}
        </div>
      )}

      <div className="return-summary-grid">

        <div className="return-summary-card">
          <div className="return-summary-icon blue">
            <BookOpen size={23} />
          </div>
          <div>
            <p>Currently Issued</p>
            <h2>{activeIssues.length}</h2>
          </div>
        </div>

        <div className="return-summary-card">
          <div className="return-summary-icon green">
            <BookCheck size={23} />
          </div>
          <div>
            <p>Total Returned</p>
            <h2>{returnedIssues.length}</h2>
          </div>
        </div>

        <div className="return-summary-card">
          <div className="return-summary-icon red">
            <AlertTriangle size={23} />
          </div>
          <div>
            <p>Overdue Books</p>
            <h2>{overdueIssues.length}</h2>
          </div>
        </div>

      </div>

      <section
        className="return-table-section"
        aria-label="Book return management"
      >

        <div className="return-table-header">

          <div>
            <h2>Book Return Management</h2>
            <p>{filteredIssues.length} records found</p>
          </div>

          <label className="return-search-box">
            <Search size={18} aria-hidden="true" />

            <input
              type="search"
              aria-label="Search by student, ID, book or ISBN"
              placeholder="Search student or book..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

        </div>

        <div className="return-tabs" role="group" aria-label="Return record filter">

          <button
            type="button"
            className={`return-tab ${activeTab === "active" ? "active" : ""}`}
            aria-pressed={activeTab === "active"}
            onClick={() => setActiveTab("active")}
          >
            <Clock size={17} /> Active Issues
            <span>{activeIssues.length}</span>
          </button>

          <button
            type="button"
            className={`return-tab ${activeTab === "returned" ? "active" : ""}`}
            aria-pressed={activeTab === "returned"}
            onClick={() => setActiveTab("returned")}
          >
            <CheckCircle2 size={17} /> Return History
            <span>{returnedIssues.length}</span>
          </button>

        </div>

        <div className="return-table-wrapper">

          <table className="return-table">

            <thead>
              <tr>
                <th>Student</th>
                <th>Book Details</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>
                  {activeTab === "active" ? "Status" : "Return Date"}
                </th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td colSpan={6} className="return-empty-message">
                    Loading return records...
                  </td>
                </tr>

              ) : filteredIssues.length === 0 ? (

                <tr>
                  <td colSpan={6} className="return-empty-message">
                    {term
                      ? "No matching records found."
                      : activeTab === "active"
                        ? "No active book issues found."
                        : "No returned books found."}
                  </td>
                </tr>

              ) : (

                filteredIssues.map((issue) => {

                  const dueDate = String(issue.dueDate || "").slice(0, 10);

                  const isOverdue =
                    issue.status === "Issued" &&
                    dueDate &&
                    dueDate < today;

                  return (
                    <tr key={issue._id}>

                      <td>
                        <div className="return-student-info">
                          <h4>{issue.studentName || "Unknown student"}</h4>
                          <p>{issue.studentId || "—"}</p>
                        </div>
                      </td>

                      <td>
                        <div className="return-book-info">

                          <div className="return-book-icon">
                            <BookOpen size={19} />
                          </div>

                          <div>
                            <h4>{issue.bookTitle || "Unknown book"}</h4>
                            <p>ISBN: {issue.isbn || "—"}</p>
                          </div>

                        </div>
                      </td>

                      <td>
                        {String(issue.issueDate || "").slice(0, 10) || "—"}
                      </td>

                      <td>{dueDate || "—"}</td>

                      <td>
                        {activeTab === "active" ? (

                          <span className={`return-status ${isOverdue ? "overdue" : "issued"}`}>
                            {isOverdue ? "Overdue" : "Issued"}
                          </span>

                        ) : (

                          <span className="return-date-text">
                            {issue.returnDate
                              ? String(issue.returnDate).slice(0, 10)
                              : "—"}
                          </span>

                        )}
                      </td>

                      <td>

                        {activeTab === "active" ? (

                          <button
                            type="button"
                            className="return-action-btn"
                            onClick={(event) => openModal(issue, event)}
                          >
                            <RotateCcw size={16} /> Return
                          </button>

                        ) : (

                          <span className="return-completed-label">
                            <CheckCircle2 size={16} /> Completed
                          </span>

                        )}

                      </td>

                    </tr>
                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* RETURN CONFIRMATION MODAL */}

      {selectedIssue && (

        <div
          className="return-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >

          <div
            className="return-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="return-modal-title"
            ref={dialogRef}
          >

            <div className="return-modal-header">

              <div className="return-modal-icon">
                <RotateCcw size={25} />
              </div>

              <button
                type="button"
                className="return-close-btn"
                onClick={closeModal}
                aria-label="Close confirmation"
              >
                <X size={22} />
              </button>

            </div>

            <h2 id="return-modal-title">
              Confirm Book Return
            </h2>

            <p className="return-modal-description">
              Confirm that the physical book has been received before marking it as returned.
            </p>

            <div className="return-confirm-details">

              <div>
                <span>Student</span>
                <strong>{selectedIssue.studentName || "—"}</strong>
              </div>

              <div>
                <span>Student ID</span>
                <strong>{selectedIssue.studentId || "—"}</strong>
              </div>

              <div>
                <span>Book</span>
                <strong>{selectedIssue.bookTitle || "—"}</strong>
              </div>

              <div>
                <span>Due Date</span>
                <strong>{String(selectedIssue.dueDate || "").slice(0, 10) || "—"}</strong>
              </div>

              <div>
                <span>Return Date</span>
                <strong>
                  <CalendarDays size={15} /> {today}
                </strong>
              </div>

            </div>

            <div className="return-modal-actions">

              <button
                type="button"
                className="return-cancel-btn"
                disabled={busy}
                onClick={closeModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className="return-confirm-btn"
                disabled={busy}
                onClick={confirmReturn}
              >
                <CheckCircle2 size={18} />
                {busy ? "Saving..." : "Confirm Return"}
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}

export default ReturnBook;