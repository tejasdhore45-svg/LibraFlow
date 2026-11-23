import { useEffect, useRef, useState } from "react";
import {
  Plus, Search, Pencil, Trash2, X,
  Users, UserCheck, GraduationCap, RefreshCw
} from "lucide-react";

import "./ManageStudent.css";
import API_BASE_URL from "../../config/api";

const API_URL = `${API_BASE_URL}/api/students`;

const emptyForm = {
  id: "",
  name: "",
  email: "",
  phone: "",
  department: "",
  year: "",
  status: "Active"
};

const departments = [
  "Computer Science",
  "Information Technology",
  "Mechanical",
  "Civil",
  "Electrical",
  "Electronics",
  "Other"
];

const years = [
  "First Year",
  "Second Year",
  "Third Year",
  "Fourth Year"
];

// API helper
async function apiRequest(url, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

export default function ManageStudent() {

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const firstInputRef = useRef(null);
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  // FETCH STUDENTS FROM MONGODB
  async function refresh() {
    try {
      setLoading(true);

      const data = await apiRequest(API_URL);

      const formattedStudents = data.map((student) => ({
        mongoId: student._id,
        id: student.studentId,
        name: student.name,
        email: student.email,
        phone: student.phone,
        department: student.department,
        year: student.year,
        status: student.status
      }));

      setStudents(formattedStudents);
      setError("");

    } catch (err) {
      setError(err.message || "Unable to load students.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();

    window.addEventListener("focus", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
    };
  }, []);

  // MODAL ACCESSIBILITY
  useEffect(() => {
    if (!showModal) return;

    firstInputRef.current?.focus();

    const onKeyDown = (event) => {

      if (event.key === "Escape") closeModal();

      if (event.key !== "Tab") return;

      const focusables = [
        ...dialogRef.current.querySelectorAll(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex="0"]'
        )
      ];

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
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };

  }, [showModal]);

  // OPEN MODAL
  function openModal(student = null) {

    previousFocusRef.current = document.activeElement;

    setEditingId(student ? student.mongoId : null);

    setFormData(
      student
        ? { ...emptyForm, ...student }
        : { ...emptyForm }
    );

    setError("");
    setNotice("");
    setShowModal(true);
  }

  // CLOSE MODAL
  function closeModal() {

    setShowModal(false);
    setEditingId(null);
    setFormData({ ...emptyForm });
    setError("");

    requestAnimationFrame(() => {
      previousFocusRef.current?.focus?.();
    });
  }

  // ADD OR UPDATE STUDENT
  async function handleSubmit(event) {

    event.preventDefault();

    setError("");
    setSaving(true);

    const data = {
      studentId: formData.id.trim().toUpperCase(),
      name: formData.name.trim().replace(/\s+/g, " "),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      department: formData.department,
      year: formData.year,
      status: formData.status
    };

    if (Object.values(data).some((value) => !value)) {
      setSaving(false);
      return setError("Complete all required fields.");
    }

    if (!/^[A-Z0-9_-]{3,24}$/.test(data.studentId)) {
      setSaving(false);
      return setError("Student ID must be 3–24 letters, numbers, underscores or hyphens.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setSaving(false);
      return setError("Enter a valid email address.");
    }

    if (!/^[0-9]{10}$/.test(data.phone)) {
      setSaving(false);
      return setError("Enter a valid 10-digit phone number.");
    }

    if (
      !departments.includes(data.department) ||
      !years.includes(data.year) ||
      !["Active", "Inactive"].includes(data.status)
    ) {
      setSaving(false);
      return setError("Choose valid student details.");
    }

    try {

      if (editingId) {

        // UPDATE EXISTING STUDENT
        await apiRequest(`${API_URL}/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(data)
        });

      } else {

        // ADD NEW STUDENT
        await apiRequest(API_URL, {
          method: "POST",
          body: JSON.stringify(data)
        });

      }

      await refresh();

      closeModal();

      setNotice(
        editingId
          ? "Student updated successfully."
          : "Student registered successfully."
      );

    } catch (err) {

      setError(err.message || "Could not save student.");

    } finally {
      setSaving(false);
    }
  }

  // DELETE STUDENT
  async function handleDelete(student) {

    setError("");
    setNotice("");

    const confirmed = window.confirm(
      `Delete ${student.name} (${student.id})? Past transaction history will remain.`
    );

    if (!confirmed) return;

    try {

      await apiRequest(`${API_URL}/${student.mongoId}`, {
        method: "DELETE"
      });

      await refresh();

      setNotice("Student deleted successfully.");

    } catch (err) {

      setError(err.message || "Could not delete student.");

    }
  }

  // SEARCH AND FILTER
  const query = search.trim().toLowerCase();

  const filtered = students.filter((student) => {

    const searchable = [
      student.name,
      student.id,
      student.email,
      student.phone,
      student.department,
      student.year
    ].map((value) => String(value ?? "").toLowerCase());

    return (
      searchable.some((value) => value.includes(query)) &&
      (statusFilter === "All" || student.status === statusFilter) &&
      (departmentFilter === "All" || student.department === departmentFilter)
    );
  });

  // STATISTICS
  const activeCount = students.filter(
    (student) => student.status === "Active"
  ).length;

  const inactiveCount = students.filter(
    (student) => student.status === "Inactive"
  ).length;

  return (

    <main className="manage-students-page">

      <header className="students-page-header">

        <div>
          <h1>Manage Students</h1>
          <p>Register and manage library student records.</p>
        </div>

        <button
          className="students-add-btn"
          onClick={() => openModal()}
        >
          <Plus size={19} />
          Add New Student
        </button>

      </header>

      {error && !showModal && (
        <div className="students-alert error" role="alert">
          {error}
        </div>
      )}

      {notice && (
        <div className="students-alert success" role="status">
          {notice}
        </div>
      )}

      {/* SUMMARY CARDS */}

      <div className="students-summary-grid">

        <div className="students-summary-card">
          <div className="students-summary-icon blue">
            <Users size={23} />
          </div>
          <div>
            <p>Total Students</p>
            <h2>{students.length}</h2>
          </div>
        </div>

        <div className="students-summary-card">
          <div className="students-summary-icon green">
            <UserCheck size={23} />
          </div>
          <div>
            <p>Active Students</p>
            <h2>{activeCount}</h2>
          </div>
        </div>

        <div className="students-summary-card">
          <div className="students-summary-icon orange">
            <GraduationCap size={23} />
          </div>
          <div>
            <p>Inactive Students</p>
            <h2>{inactiveCount}</h2>
          </div>
        </div>

      </div>

      {/* STUDENT TABLE */}

      <section className="students-table-section">

        <div className="students-table-header">

          <div>
            <h2>Registered Students</h2>
            <p>{filtered.length} students found</p>
          </div>

          <div className="students-table-actions">

            <label className="students-search-box">
              <Search size={18} />

              <input
                aria-label="Search students"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>

            <select
              className="students-status-filter"
              aria-label="Filter by department"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="All">All Departments</option>

              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>

            <select
              className="students-status-filter"
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <button
              className="students-refresh-btn"
              onClick={refresh}
              title="Refresh student records"
              aria-label="Refresh student records"
              disabled={loading}
            >
              <RefreshCw size={17} />
            </button>

          </div>

        </div>

        <div className="students-table-wrapper">

          <table className="students-table">

            <thead>
              <tr>
                <th>Student</th>
                <th>Student ID</th>
                <th>Contact</th>
                <th>Department</th>
                <th>Year</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {loading && students.length === 0 ? (

                <tr>
                  <td colSpan={7} className="students-empty-message">
                    Loading students...
                  </td>
                </tr>

              ) : filtered.length ? (

                filtered.map((student) => (

                  <tr key={student.mongoId}>

                    <td>
                      <div className="students-name-cell">

                        <div className="students-avatar">
                          {String(student.name || "?").charAt(0).toUpperCase()}
                        </div>

                        <strong>{student.name}</strong>

                      </div>
                    </td>

                    <td>{student.id}</td>

                    <td>
                      <div className="students-contact">
                        <span>{student.email}</span>
                        <small>{student.phone}</small>
                      </div>
                    </td>

                    <td>{student.department}</td>

                    <td>{student.year}</td>

                    <td>
                      <span
                        className={`students-status ${
                          student.status === "Active" ? "active" : "inactive"
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>

                    <td>
                      <div className="students-action-buttons">

                        <button
                          className="students-edit-btn"
                          onClick={() => openModal(student)}
                          aria-label={`Edit ${student.name}`}
                          title="Edit student"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="students-delete-btn"
                          onClick={() => handleDelete(student)}
                          aria-label={`Delete ${student.name}`}
                          title="Delete student"
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>
                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td colSpan={7} className="students-empty-message">
                    No students match your search or filters.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* ADD / EDIT MODAL */}

      {showModal && (

        <div
          className="students-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >

          <div
            className="students-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="students-modal-title"
            ref={dialogRef}
          >

            <div className="students-modal-header">

              <div>
                <h2 id="students-modal-title">
                  {editingId ? "Edit Student" : "Add New Student"}
                </h2>

                <p>Enter student registration details.</p>
              </div>

              <button
                className="students-close-btn"
                onClick={closeModal}
                aria-label="Close dialog"
                disabled={saving}
              >
                <X size={22} />
              </button>

            </div>

            {error && (
              <div className="students-alert error" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="students-form-grid">

                <div className="students-form-group">
                  <label htmlFor="student-id">Student ID</label>

                  <input
                    id="student-id"
                    ref={firstInputRef}
                    value={formData.id}
                    onChange={(e) =>
                      setFormData({ ...formData, id: e.target.value })
                    }
                    placeholder="e.g. STU005"
                    disabled={Boolean(editingId)}
                    maxLength={24}
                    required
                  />
                </div>

                <div className="students-form-group">
                  <label htmlFor="student-name">Full Name</label>

                  <input
                    id="student-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter full name"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="students-form-group">
                  <label htmlFor="student-email">Email Address</label>

                  <input
                    id="student-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="student@example.com"
                    required
                  />
                </div>

                <div className="students-form-group">
                  <label htmlFor="student-phone">Phone Number</label>

                  <input
                    id="student-phone"
                    type="tel"
                    inputMode="numeric"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    required
                  />
                </div>

                <div className="students-form-group">
                  <label htmlFor="student-department">Department</label>

                  <select
                    id="student-department"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Department</option>

                    {departments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="students-form-group">
                  <label htmlFor="student-year">Academic Year</label>

                  <select
                    id="student-year"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Year</option>

                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="students-form-group students-form-full">
                  <label htmlFor="student-status">Account Status</label>

                  <select
                    id="student-status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

              </div>

              <div className="students-modal-actions">

                <button
                  type="button"
                  className="students-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="students-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Student"
                      : "Add Student"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </main>
  );
}
