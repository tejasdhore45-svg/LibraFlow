// ======================================================
// LIBRARY MANAGEMENT SYSTEM - ISSUE BOOK
// MULTI-LIBRARY MONGODB INTEGRATION
// ======================================================

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus, Search, X, BookOpen, CalendarDays,
  Clock, AlertTriangle, BookMarked, Users, RefreshCw,
} from "lucide-react";
import "./IssueBook.css";

const BOOKS_API = "http://localhost:5000/api/books";
const STUDENTS_API = "http://localhost:5000/api/students";
const ISSUES_API = "http://localhost:5000/api/issues";

function todayLocal() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function blankForm() {
  return { studentId: "", bookId: "", issueDate: todayLocal(), dueDate: "" };
}

const isActive = (student) =>
  String(student.status || "").trim().toLowerCase() === "active";

function IssueBook() {
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [issues, setIssues] = useState([]);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(blankForm);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const modalRef = useRef(null);
  const studentSelectRef = useRef(null);
  const openerRef = useRef(null);

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
  // FETCH ALL LIBRARY DATA
  // ============================================
  async function refreshData() {
    try {
      const [booksData, studentsData, issuesData] = await Promise.all([
        apiRequest(BOOKS_API),
        apiRequest(STUDENTS_API),
        apiRequest(ISSUES_API),
      ]);

      setBooks(booksData);
      setStudents(studentsData);
      setIssues(issuesData);

    } catch (error) {
      setError(error.message || "Unable to load library data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshData();

    function onFocus() {
      refreshData();
    }

    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // ============================================
  // MODAL FUNCTIONS
  // ============================================
  function openModal() {
    setFormData(blankForm());
    setError("");
    setNotice("");

    openerRef.current = document.activeElement;
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setError("");

    requestAnimationFrame(() => openerRef.current?.focus());
  }

  useEffect(() => {
    if (!showModal) return;

    studentSelectRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
      }

      if (event.key !== "Tab" || !modalRef.current) return;

      const focusables = Array.from(
        modalRef.current.querySelectorAll(
          'button:not([disabled]), select:not([disabled]), input:not([disabled]), a[href]'
        )
      );

      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showModal, saving]);

  // ============================================
  // FORM FIELD CHANGES
  // ============================================
  function changeField(event) {
    const { name, value } = event.target;

    setFormData((old) => ({
      ...old,
      [name]: value,
      ...(name === "issueDate" && old.dueDate && old.dueDate < value
        ? { dueDate: "" }
        : {}),
    }));

    setError("");
  }

  // ============================================
  // ISSUE BOOK THROUGH BACKEND
  // ============================================
  async function handleIssueBook(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      if (!formData.studentId || !formData.bookId) {
        throw new Error("Please select a student and a book.");
      }

      if (!formData.issueDate || !formData.dueDate) {
        throw new Error("Please select both issue and due dates.");
      }

      if (formData.issueDate > todayLocal()) {
        throw new Error("Issue date cannot be in the future.");
      }

      if (formData.dueDate <= formData.issueDate) {
        throw new Error("Due date must be later than the issue date.");
      }

      const selectedStudent = students.find(
        (student) => String(student._id) === String(formData.studentId)
      );

      const selectedBook = books.find(
        (book) => String(book._id) === String(formData.bookId)
      );

      if (!selectedStudent || !isActive(selectedStudent)) {
        throw new Error("Select a registered, active student.");
      }

      if (!selectedBook) {
        throw new Error("Select a valid library book.");
      }

      if (Number(selectedBook.availableCopies) <= 0) {
        throw new Error("This book has no available copies.");
      }

      // Backend verifies library ownership and updates book copies.
      await apiRequest(ISSUES_API, {
        method: "POST",
        body: JSON.stringify({
          studentId: selectedStudent._id,
          bookId: selectedBook._id,
          issueDate: formData.issueDate,
          dueDate: formData.dueDate,
        }),
      });

      await refreshData();

      setShowModal(false);

      requestAnimationFrame(() => openerRef.current?.focus());

      setNotice(
        `Successfully issued "${selectedBook.title}" to ${selectedStudent.name}.`
      );

    } catch (issueError) {
      setError(issueError.message || "Unable to issue the book.");
    } finally {
      setSaving(false);
    }
  }

  // ============================================
  // STATISTICS AND FILTERING
  // ============================================
  const today = todayLocal();

  const activeIssues = issues.filter(
    (issue) => issue.status === "Issued"
  );

  const dueToday = activeIssues.filter(
    (issue) => todayLocal() === String(issue.dueDate).slice(0, 10)
  ).length;

  const overdue = activeIssues.filter(
    (issue) => issue.dueDate && String(issue.dueDate).slice(0, 10) < today
  ).length;

  const query = search.trim().toLowerCase();

  const filteredIssues = activeIssues.filter((issue) =>
    [
      issue.studentName,
      issue.studentId,
      issue.bookTitle,
      issue.isbn,
    ].some((value) =>
      String(value || "").toLowerCase().includes(query)
    )
  );

  const activeStudents = students.filter(isActive);

  const availableBooks = books.filter(
    (book) => Number(book.availableCopies) > 0
  );

  const selectedBook = availableBooks.find(
    (book) => String(book._id) === String(formData.bookId)
  );

  // ============================================
  // UI
  // ============================================
  return (
    <main className="issue-books-page">

      <header className="issue-page-header">
        <div>
          <h1>Issue Books</h1>
          <p>Manage borrowing, due dates, and active student loans.</p>
        </div>

        <button
          type="button"
          className="issue-add-btn"
          onClick={openModal}
        >
          <Plus size={18} /> Issue New Book
        </button>
      </header>

      {notice && (
        <div className="issue-notice" role="status">
          {notice}
        </div>
      )}

      {error && !showModal && (
        <div className="issue-form-error" role="alert">
          {error}
        </div>
      )}

      <section className="issue-summary-grid" aria-label="Issue statistics">

        <div className="issue-summary-card">
          <div className="issue-summary-icon blue">
            <BookMarked size={23} />
          </div>
          <div>
            <p>Currently Issued</p>
            <h2>{activeIssues.length}</h2>
          </div>
        </div>

        <div className="issue-summary-card">
          <div className="issue-summary-icon orange">
            <Clock size={23} />
          </div>
          <div>
            <p>Due Today</p>
            <h2>{dueToday}</h2>
          </div>
        </div>

        <div className="issue-summary-card">
          <div className="issue-summary-icon red">
            <AlertTriangle size={23} />
          </div>
          <div>
            <p>Overdue Books</p>
            <h2>{overdue}</h2>
          </div>
        </div>

      </section>

      <section className="issue-table-section">

        <div className="issue-table-header">

          <div>
            <h2>Active Book Issues</h2>
            <p>{filteredIssues.length} records found</p>
          </div>

          <div className="issue-table-controls">

            <label className="issue-search-box">
              <Search size={18} aria-hidden="true" />

              <span className="issue-visually-hidden">
                Search active issues
              </span>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search student or book..."
              />
            </label>

            <button
              type="button"
              className="issue-refresh-btn"
              onClick={refreshData}
              aria-label="Refresh issue records"
              title="Refresh records"
            >
              <RefreshCw size={18} />
            </button>

          </div>
        </div>

        <div className="issue-table-wrapper">

          <table className="issue-table">

            <thead>
              <tr>
                <th>Student</th>
                <th>Book Details</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan="5" className="issue-empty-message">
                    Loading issue records...
                  </td>
                </tr>
              ) : filteredIssues.length ? (

                filteredIssues.map((issue) => {

                  const issueDate = String(issue.dueDate || "").slice(0, 10);
                  const late = Boolean(issueDate && issueDate < today);

                  return (
                    <tr key={issue._id}>

                      <td>
                        <div className="issue-student-info">
                          <h4>{issue.studentName || "Unknown Student"}</h4>
                          <p>{issue.studentId}</p>
                        </div>
                      </td>

                      <td>
                        <div className="issue-book-info">

                          <div className="issue-book-icon">
                            <BookOpen size={19} />
                          </div>

                          <div>
                            <h4>{issue.bookTitle || "Unknown Book"}</h4>
                            <p>ISBN: {issue.isbn || "—"}</p>
                          </div>

                        </div>
                      </td>

                      <td>
                        {String(issue.issueDate || "").slice(0, 10) || "—"}
                      </td>

                      <td>
                        {issueDate || "—"}
                      </td>

                      <td>
                        <span className={`issue-status ${late ? "overdue" : "issued"}`}>
                          {late ? "Overdue" : "Issued"}
                        </span>
                      </td>

                    </tr>
                  );
                })

              ) : (

                <tr>
                  <td colSpan="5" className="issue-empty-message">
                    No active issue records found.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* ISSUE BOOK MODAL */}

      {showModal && (

        <div
          className="issue-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >

          <div
            ref={modalRef}
            className="issue-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="issue-modal-title"
            aria-describedby="issue-modal-description"
          >

            <div className="issue-modal-header">

              <div>
                <h2 id="issue-modal-title">Issue New Book</h2>
                <p id="issue-modal-description">
                  Select a registered student and an available book.
                </p>
              </div>

              <button
                type="button"
                className="issue-close-btn"
                onClick={closeModal}
                aria-label="Close issue form"
                disabled={saving}
              >
                <X size={22} />
              </button>

            </div>

            {error && (
              <div className="issue-form-error" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleIssueBook}>

              <div className="issue-form-group">

                <label htmlFor="issue-student">
                  Registered Student
                </label>

                <div className="issue-select-with-icon">
                  <Users size={18} aria-hidden="true" />

                  <select
                    ref={studentSelectRef}
                    id="issue-student"
                    name="studentId"
                    value={formData.studentId}
                    onChange={changeField}
                    required
                  >
                    <option value="">Select an active student</option>

                    {activeStudents.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.studentId} — {student.name}
                      </option>
                    ))}

                  </select>
                </div>

                {!activeStudents.length && (
                  <p className="issue-form-hint">
                    No active students.{" "}
                    <Link to="/admin/students" onClick={closeModal}>
                      Manage students
                    </Link>{" "}
                    first.
                  </p>
                )}

              </div>

              <div className="issue-form-group">

                <label htmlFor="issue-book">
                  Available Book
                </label>

                <div className="issue-select-with-icon">
                  <BookOpen size={18} aria-hidden="true" />

                  <select
                    id="issue-book"
                    name="bookId"
                    value={formData.bookId}
                    onChange={changeField}
                    required
                  >
                    <option value="">Select an available book</option>

                    {availableBooks.map((book) => (
                      <option key={book._id} value={book._id}>
                        {book.title} ({book.availableCopies} available)
                      </option>
                    ))}

                  </select>
                </div>

                {selectedBook && (
                  <p className="issue-form-hint">
                    ISBN: {selectedBook.isbn} · {selectedBook.availableCopies} copies available
                  </p>
                )}

                {!availableBooks.length && (
                  <p className="issue-form-hint">
                    No available books.{" "}
                    <Link to="/admin/books" onClick={closeModal}>
                      Manage books
                    </Link>{" "}
                    first.
                  </p>
                )}

              </div>

              <div className="issue-date-grid">

                <div className="issue-form-group">

                  <label htmlFor="issue-date">
                    Issue Date
                  </label>

                  <div className="issue-date-input">
                    <CalendarDays size={18} aria-hidden="true" />

                    <input
                      id="issue-date"
                      type="date"
                      name="issueDate"
                      value={formData.issueDate}
                      onChange={changeField}
                      max={today}
                      required
                    />
                  </div>

                </div>

                <div className="issue-form-group">

                  <label htmlFor="issue-due">
                    Due Date
                  </label>

                  <div className="issue-date-input">
                    <CalendarDays size={18} aria-hidden="true" />

                    <input
                      id="issue-due"
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={changeField}
                      min={formData.issueDate}
                      required
                    />
                  </div>

                </div>

              </div>

              <div className="issue-modal-actions">

                <button
                  type="button"
                  className="issue-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="issue-save-btn"
                  disabled={
                    saving ||
                    !activeStudents.length ||
                    !availableBooks.length
                  }
                >
                  {saving ? "Issuing..." : "Issue Book"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </main>
  );
}

export default IssueBook;