import { useState, useEffect } from "react";

import {
    BookOpen,
    CalendarDays,
    Clock,
    Search,
    RotateCcw
} from "lucide-react";

import "./MyBorrowedBooks.css";

function MyBorrowedBooks() {

    const [borrowedBooks, setBorrowedBooks] = useState([]);

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ============================================
    // FETCH STUDENT BORROWED BOOKS
    // ============================================
    useEffect(() => {

        const fetchBorrowedBooks = async () => {

            try {

                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");

                if (!token) {
                    throw new Error("Please login to continue.");
                }

                const response = await fetch(
                    "http://localhost:5000/api/issues/student",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to fetch borrowed books."
                    );
                }

                setBorrowedBooks(data);

            } catch (err) {

                setError(err.message);

            } finally {

                setLoading(false);

            }
        };

        fetchBorrowedBooks();

    }, []);


    // ============================================
    // CALCULATE BOOK STATUS
    // ============================================
    const getBookStatus = (book) => {

        if (book.status === "Returned") {
            return "Returned";
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dueDate = new Date(book.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        const difference = Math.ceil(
            (dueDate - today) / (1000 * 60 * 60 * 24)
        );

        if (difference < 0) {
            return "Overdue";
        }

        if (difference <= 3) {
            return "Due Soon";
        }

        return "Active";
    };


    // ============================================
    // FORMAT DATE
    // ============================================
    const formatDate = (date) => {

        if (!date) return "—";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

    };


    // ============================================
    // SEARCH AND FILTER
    // ============================================
    const filteredBooks = borrowedBooks.filter((book) => {

        const title = book.book?.title || book.bookTitle || "";
        const author = book.book?.author || "";
        const isbn = book.book?.isbn || book.isbn || "";

        const matchesSearch =
            title.toLowerCase().includes(search.toLowerCase()) ||
            author.toLowerCase().includes(search.toLowerCase()) ||
            isbn.toLowerCase().includes(search.toLowerCase());

        const status = getBookStatus(book);

        const matchesFilter =
            filter === "All" || status === filter;

        return matchesSearch && matchesFilter;

    });


    // ============================================
    // SUMMARY STATISTICS
    // ============================================
    const activeBooks = borrowedBooks.filter(
        book => getBookStatus(book) === "Active"
    );

    const dueSoonBooks = borrowedBooks.filter(
        book => getBookStatus(book) === "Due Soon"
    );

    const overdueBooks = borrowedBooks.filter(
        book => getBookStatus(book) === "Overdue"
    );

    const handleRenewRequest = () => {

        alert("Renewal requests will be implemented in a later update.");

    };


    return (

        <div className="borrowed-books-page">

            {/* PAGE HEADER */}
            <div className="borrowed-header">

                <div>
                    <span>STUDENT LIBRARY</span>

                    <h1>My Borrowed Books</h1>

                    <p>
                        Manage your borrowed books and keep track of return deadlines.
                    </p>
                </div>

                <div className="borrowed-header-icon">
                    <BookOpen size={38} />
                </div>

            </div>


            {/* SUMMARY CARDS */}
            <div className="borrowed-summary">

                <div className="borrowed-summary-card">
                    <BookOpen size={23} />

                    <div>
                        <p>Total Borrowed</p>
                        <h2>{borrowedBooks.length}</h2>
                    </div>
                </div>


                <div className="borrowed-summary-card active-card">
                    <Clock size={23} />

                    <div>
                        <p>Active</p>
                        <h2>{activeBooks.length}</h2>
                    </div>
                </div>


                <div className="borrowed-summary-card due-card">
                    <CalendarDays size={23} />

                    <div>
                        <p>Due Soon</p>
                        <h2>{dueSoonBooks.length}</h2>
                    </div>
                </div>


                <div className="borrowed-summary-card overdue-card">
                    <Clock size={23} />

                    <div>
                        <p>Overdue</p>
                        <h2>{overdueBooks.length}</h2>
                    </div>
                </div>

            </div>


            {/* SEARCH AND FILTER */}
            <div className="borrowed-controls">

                <div className="borrowed-search">

                    <Search size={19} />

                    <input
                        type="text"
                        placeholder="Search by book title, author or ISBN..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                </div>


                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >

                    <option value="All">All Books</option>
                    <option value="Active">Active</option>
                    <option value="Due Soon">Due Soon</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Returned">Returned</option>

                </select>

            </div>


            {/* BOOK LIST HEADER */}
            <div className="borrowed-list-header">

                <div>
                    <h2>Borrowing History</h2>
                    <p>{filteredBooks.length} records found</p>
                </div>

            </div>


            {/* BOOK LIST */}
            <div className="borrowed-books-list">


                {loading ? (

                    <div className="borrowed-empty">
                        <p>Loading your borrowed books...</p>
                    </div>

                ) : error ? (

                    <div className="borrowed-empty">
                        <h3>Unable to Load Books</h3>
                        <p>{error}</p>
                    </div>

                ) : filteredBooks.length > 0 ? (

                    filteredBooks.map((book) => {

                        const status = getBookStatus(book);

                        const title =
                            book.book?.title || book.bookTitle || "Unknown Book";

                        const author =
                            book.book?.author || "Author information unavailable";

                        const isbn =
                            book.book?.isbn || book.isbn || "—";

                        return (

                            <div
                                className="borrowed-book-card"
                                key={book._id}
                            >

                                <div className="borrowed-book-icon">
                                    <BookOpen size={32} />
                                </div>


                                <div className="borrowed-book-details">

                                    <span className="borrowed-book-isbn">
                                        ISBN: {isbn}
                                    </span>

                                    <h3>{title}</h3>

                                    <p>By {author}</p>


                                    <div className="borrowed-book-dates">

                                        <div>
                                            <span>Issue Date</span>

                                            <strong>
                                                {formatDate(book.issueDate)}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>Due Date</span>

                                            <strong>
                                                {formatDate(book.dueDate)}
                                            </strong>
                                        </div>

                                    </div>

                                </div>


                                <div className="borrowed-book-actions">

                                    <span
                                        className={`borrowed-status ${
                                            status === "Active"
                                                ? "status-active"
                                                : status === "Due Soon"
                                                ? "status-due"
                                                : status === "Overdue"
                                                ? "status-overdue"
                                                : "status-active"
                                        }`}
                                    >
                                        {status}
                                    </span>


                                    {status !== "Returned" && (

                                        <button
                                            onClick={handleRenewRequest}
                                            disabled={status === "Overdue"}
                                        >
                                            <RotateCcw size={15} />
                                            Renew Request
                                        </button>

                                    )}

                                </div>

                            </div>

                        );

                    })

                ) : (

                    <div className="borrowed-empty">

                        <BookOpen size={40} />

                        <h3>No Borrowed Books Found</h3>

                        <p>
                            {borrowedBooks.length === 0
                                ? "You haven't borrowed any books yet."
                                : "Try changing your search or filter."
                            }
                        </p>

                    </div>

                )}

            </div>

        </div>

    );

}

export default MyBorrowedBooks;