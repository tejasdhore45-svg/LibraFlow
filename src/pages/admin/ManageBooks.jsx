// ======================================================
// LIBRARY MANAGEMENT SYSTEM - MANAGE BOOKS
// MongoDB API Integration
// ======================================================

import { useEffect, useRef, useState } from "react";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
    BookOpen,
    Filter
} from "lucide-react";

import "./ManageBooks.css";

const API_URL = "http://localhost:5000/api/books";

const CATEGORIES = [
    "Programming",
    "Computer Science",
    "Database",
    "Networking",
    "Operating Systems",
    "Mathematics",
    "Science",
    "Literature",
    "Other"
];

const EMPTY_FORM = {
    title: "",
    author: "",
    isbn: "",
    category: "",
    totalCopies: ""
};


function ManageBooks() {

    const [books, setBooks] = useState([]);

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pageError, setPageError] = useState("");

    const modalRef = useRef(null);
    const titleRef = useRef(null);
    const previousFocusRef = useRef(null);


    // ======================================================
    // AUTHENTICATED API REQUEST
    // ======================================================

    async function apiRequest(url, options = {}) {

        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("Please login again.");
        }

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


    // ======================================================
    // FETCH BOOKS FROM MONGODB
    // ======================================================

    async function fetchBooks() {

        try {

            setLoading(true);
            setPageError("");

            const data = await apiRequest(API_URL);

            setBooks(
                data.map((book) => ({
                    ...book,
                    id: book._id
                }))
            );

        } catch (error) {

            setPageError(error.message);

        } finally {

            setLoading(false);

        }
    }


    useEffect(() => {
        fetchBooks();
    }, []);


    // ======================================================
    // MODAL KEYBOARD BEHAVIOR
    // ======================================================

    useEffect(() => {

        if (!showModal) return;

        titleRef.current?.focus();

        const onKeyDown = (event) => {

            if (event.key === "Escape") {
                event.preventDefault();
                closeModal();
            }

            if (event.key !== "Tab" || !modalRef.current) return;

            const elements = [
                ...modalRef.current.querySelectorAll(
                    'button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href]'
                )
            ];

            if (!elements.length) return;

            const first = elements[0];
            const last = elements[elements.length - 1];

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


    // ======================================================
    // OPEN MODAL
    // ======================================================

    function openModal(book = null) {

        previousFocusRef.current = document.activeElement;

        setEditingId(book?.id ?? null);

        setFormData(
            book
                ? {
                    title: book.title,
                    author: book.author,
                    isbn: book.isbn,
                    category: book.category,
                    totalCopies: String(book.totalCopies)
                }
                : { ...EMPTY_FORM }
        );

        setFormError("");
        setShowModal(true);
    }


    // ======================================================
    // CLOSE MODAL
    // ======================================================

    function closeModal() {

        if (saving) return;

        setShowModal(false);
        setEditingId(null);
        setFormError("");

        requestAnimationFrame(() => {
            previousFocusRef.current?.focus?.();
        });
    }


    // ======================================================
    // INPUT CHANGE
    // ======================================================

    function handleInputChange(event) {

        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        if (formError) {
            setFormError("");
        }
    }


    // ======================================================
    // ADD / UPDATE BOOK
    // ======================================================

    async function handleSubmit(event) {

        event.preventDefault();

        if (saving) return;

        const title = formData.title.trim();
        const author = formData.author.trim();

        const isbn = formData.isbn.trim().replace(/[\s-]/g, "");

        const totalCopies = Number(formData.totalCopies);

        if (
            !title ||
            !author ||
            !CATEGORIES.includes(formData.category)
        ) {
            setFormError("Complete all required book details.");
            return;
        }

        if (!/^(?:\d{10}|\d{13})$/.test(isbn)) {
            setFormError("ISBN must contain exactly 10 or 13 digits.");
            return;
        }

        if (
            !Number.isSafeInteger(totalCopies) ||
            totalCopies < 1
        ) {
            setFormError("Total copies must be a positive whole number.");
            return;
        }

        const duplicate = books.some(
            (book) =>
                String(book.isbn).replace(/[\s-]/g, "") === isbn &&
                book.id !== editingId
        );

        if (duplicate) {
            setFormError("A book with this ISBN already exists.");
            return;
        }

        const bookData = {
            title,
            author,
            isbn,
            category: formData.category,
            totalCopies
        };

        try {

            setSaving(true);
            setFormError("");

            if (editingId !== null) {

                // UPDATE BOOK IN MONGODB

                await apiRequest(`${API_URL}/${editingId}`, {
                    method: "PUT",
                    body: JSON.stringify(bookData)
                });

                window.alert("Book updated successfully!");

            } else {

                // ADD BOOK TO MONGODB

                await apiRequest(API_URL, {
                    method: "POST",
                    body: JSON.stringify(bookData)
                });

                window.alert("Book added successfully!");

            }

            closeModal();

            await fetchBooks();

        } catch (error) {

            setFormError(error.message);

        } finally {

            setSaving(false);

        }
    }


    // ======================================================
    // DELETE BOOK
    // ======================================================

    async function handleDeleteBook(book) {

        if (
            Number(book.totalCopies) !==
            Number(book.availableCopies)
        ) {

            window.alert(
                "This book has issued or unavailable copies and cannot be deleted."
            );

            return;
        }

        const confirmed = window.confirm(
            `Delete "${book.title}"? This cannot be undone.`
        );

        if (!confirmed) return;

        try {

            await apiRequest(`${API_URL}/${book.id}`, {
                method: "DELETE"
            });

            window.alert("Book deleted successfully!");

            await fetchBooks();

        } catch (error) {

            window.alert(error.message);

        }
    }


    // ======================================================
    // SEARCH AND CATEGORY FILTER
    // ======================================================

    const filteredBooks = books.filter((book) => {

        const query = search.trim().toLowerCase();

        const matchesText = [
            book.title,
            book.author,
            book.isbn
        ].some((value) =>
            String(value ?? "").toLowerCase().includes(query)
        );

        return (
            matchesText &&
            (
                categoryFilter === "All" ||
                book.category === categoryFilter
            )
        );

    });


    // ======================================================
    // SUMMARY CALCULATIONS
    // ======================================================

    const totalCopies = books.reduce(
        (sum, book) => sum + Number(book.totalCopies || 0),
        0
    );

    const availableCopies = books.reduce(
        (sum, book) => sum + Number(book.availableCopies || 0),
        0
    );


    // ======================================================
    // UI
    // ======================================================

    return (

        <main className="manage-books-page">

            {/* HEADER */}

            <header className="manage-books-header">

                <div>
                    <h1>Manage Books</h1>
                    <p>Add, update, and manage your library collection.</p>
                </div>

                <button
                    type="button"
                    className="add-book-btn"
                    onClick={() => openModal()}
                >
                    <Plus size={19} />
                    Add New Book
                </button>

            </header>


            {/* ERROR MESSAGE */}

            {pageError && (

                <p className="book-form-error" role="alert">
                    {pageError}
                </p>

            )}


            {/* SUMMARY */}

            <section
                className="book-summary-grid"
                aria-label="Book summary"
            >

                <div className="book-summary-card">
                    <p>Total Book Titles</p>
                    <h2>{books.length.toLocaleString("en-IN")}</h2>
                </div>

                <div className="book-summary-card">
                    <p>Total Copies</p>
                    <h2>{totalCopies.toLocaleString("en-IN")}</h2>
                </div>

                <div className="book-summary-card">
                    <p>Available Copies</p>
                    <h2>{availableCopies.toLocaleString("en-IN")}</h2>
                </div>

            </section>


            {/* BOOKS TABLE */}

            <section className="books-table-section">

                <div className="books-table-header">

                    <div>
                        <h2>Library Books</h2>
                        <p>{filteredBooks.length} book titles found</p>
                    </div>

                    <div className="books-table-actions">

                        <label className="books-search-box">

                            <Search size={18} aria-hidden="true" />

                            <input
                                aria-label="Search books"
                                type="search"
                                placeholder="Search books..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                            />

                        </label>


                        <label className="books-filter-box">

                            <Filter size={17} aria-hidden="true" />

                            <select
                                aria-label="Filter books by category"
                                value={categoryFilter}
                                onChange={(event) =>
                                    setCategoryFilter(event.target.value)
                                }
                            >

                                <option value="All">
                                    All Categories
                                </option>

                                {CATEGORIES.map((category) => (

                                    <option
                                        key={category}
                                        value={category}
                                    >
                                        {category}
                                    </option>

                                ))}

                            </select>

                        </label>

                    </div>

                </div>


                {/* TABLE */}

                <div
                    className="books-table-wrapper"
                    role="region"
                    aria-label="Books table"
                    tabIndex="0"
                >

                    <table className="books-table">

                        <thead>

                            <tr>
                                <th>Book Details</th>
                                <th>ISBN</th>
                                <th>Category</th>
                                <th>Total Copies</th>
                                <th>Available</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>

                        </thead>


                        <tbody>

                            {loading ? (

                                <tr>
                                    <td colSpan="7" className="no-books-message">
                                        Loading books...
                                    </td>
                                </tr>

                            ) : filteredBooks.length ? (

                                filteredBooks.map((book) => (

                                    <tr key={book.id}>

                                        <td>

                                            <div className="book-info">

                                                <div className="book-icon">
                                                    <BookOpen size={20} />
                                                </div>

                                                <div>
                                                    <h4>{book.title}</h4>
                                                    <p>{book.author}</p>
                                                </div>

                                            </div>

                                        </td>

                                        <td>{book.isbn}</td>

                                        <td>
                                            <span className="book-category">
                                                {book.category}
                                            </span>
                                        </td>

                                        <td>{book.totalCopies}</td>

                                        <td>{book.availableCopies}</td>

                                        <td>

                                            <span
                                                className={`book-status ${
                                                    Number(book.availableCopies) > 0
                                                        ? "available"
                                                        : "unavailable"
                                                }`}
                                            >
                                                {Number(book.availableCopies) > 0
                                                    ? "Available"
                                                    : "Unavailable"}
                                            </span>

                                        </td>

                                        <td>

                                            <div className="book-action-buttons">

                                                <button
                                                    type="button"
                                                    className="edit-book-btn"
                                                    onClick={() => openModal(book)}
                                                    title="Edit Book"
                                                    aria-label={`Edit ${book.title}`}
                                                >
                                                    <Pencil size={17} />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="delete-book-btn"
                                                    onClick={() => handleDeleteBook(book)}
                                                    title="Delete Book"
                                                    aria-label={`Delete ${book.title}`}
                                                >
                                                    <Trash2 size={17} />
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>
                                    <td colSpan="7" className="no-books-message">
                                        {books.length
                                            ? "No books match your search or filter."
                                            : "No books yet. Add your first book."}
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
                    className="book-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeModal();
                        }
                    }}
                >

                    <div
                        className="book-modal"
                        ref={modalRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="book-modal-title"
                        aria-describedby="book-modal-description"
                    >

                        <div className="book-modal-header">

                            <div>

                                <h2 id="book-modal-title">
                                    {editingId !== null
                                        ? "Edit Book"
                                        : "Add New Book"}
                                </h2>

                                <p id="book-modal-description">
                                    Enter the book's details below.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="close-modal-btn"
                                onClick={closeModal}
                                aria-label="Close dialog"
                                disabled={saving}
                            >
                                <X size={22} />
                            </button>

                        </div>


                        <form onSubmit={handleSubmit}>

                            <div className="book-form-group">

                                <label htmlFor="book-title">
                                    Book Title
                                </label>

                                <input
                                    ref={titleRef}
                                    id="book-title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter book title"
                                    maxLength={150}
                                    required
                                />

                            </div>


                            <div className="book-form-group">

                                <label htmlFor="book-author">
                                    Author Name
                                </label>

                                <input
                                    id="book-author"
                                    name="author"
                                    value={formData.author}
                                    onChange={handleInputChange}
                                    placeholder="Enter author name"
                                    maxLength={120}
                                    required
                                />

                            </div>


                            <div className="book-form-group">

                                <label htmlFor="book-isbn">
                                    ISBN Number
                                </label>

                                <input
                                    id="book-isbn"
                                    name="isbn"
                                    value={formData.isbn}
                                    onChange={handleInputChange}
                                    placeholder="10 or 13 digits"
                                    inputMode="numeric"
                                    required
                                />

                            </div>


                            <div className="book-form-group">

                                <label htmlFor="book-category">
                                    Category
                                </label>

                                <select
                                    id="book-category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                >

                                    <option value="">
                                        Select Category
                                    </option>

                                    {CATEGORIES.map((category) => (

                                        <option
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </option>

                                    ))}

                                </select>

                            </div>


                            <div className="book-form-group">

                                <label htmlFor="book-copies">
                                    Total Copies
                                </label>

                                <input
                                    id="book-copies"
                                    type="number"
                                    name="totalCopies"
                                    value={formData.totalCopies}
                                    onChange={handleInputChange}
                                    min="1"
                                    step="1"
                                    placeholder="Enter total copies"
                                    required
                                />

                            </div>


                            {formError && (

                                <p className="book-form-error" role="alert">
                                    {formError}
                                </p>

                            )}


                            <div className="book-modal-actions">

                                <button
                                    type="button"
                                    className="cancel-book-btn"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-book-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingId !== null
                                            ? "Update Book"
                                            : "Add Book"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </main>

    );

}

export default ManageBooks;