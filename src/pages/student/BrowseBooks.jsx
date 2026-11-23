import { useEffect, useState } from "react";

import {
    Search,
    BookOpen,
    Filter,
    ArrowRight,
    Library,
    X,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

import "./BrowseBooks.css";

function BrowseBooks() {

    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [availability, setAvailability] = useState("all");

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalBooks: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedBook, setSelectedBook] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Book request states
    const [requestSubmitting, setRequestSubmitting] = useState(false);
    const [requestMessage, setRequestMessage] = useState("");
    const [requestError, setRequestError] = useState("");


    // Fetch books from logged-in student's library
    useEffect(() => {

        const fetchBooks = async () => {

            try {

                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");

                if (!token) {
                    throw new Error("Please log in to browse books.");
                }

                const params = new URLSearchParams({
                    search,
                    category,
                    availability,
                    page,
                    limit: 12
                });

                const response = await fetch(
                    `http://localhost:5000/api/books/student?${params}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to load books."
                    );
                }

                setBooks(data.books || []);
                setCategories(data.categories || []);
                setPagination(data.pagination);

            } catch (err) {

                setError(err.message);

            } finally {

                setLoading(false);

            }

        };

        // Small delay to avoid an API request for every keystroke
        const timer = setTimeout(fetchBooks, 350);

        return () => clearTimeout(timer);

    }, [search, category, availability, page]);


    // Reset page when filters change
    const handleSearch = (value) => {
        setSearch(value);
        setPage(1);
    };

    const handleCategory = (value) => {
        setCategory(value);
        setPage(1);
    };

    const handleAvailability = (value) => {
        setAvailability(value);
        setPage(1);
    };


    // Fetch individual book details
    const handleViewDetails = async (bookId) => {

        try {

            setDetailsLoading(true);
            setSelectedBook(null);

            setRequestMessage("");
            setRequestError("");

            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Please log in to view book details.");
            }

            const response = await fetch(
                `http://localhost:5000/api/books/student/${bookId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load book details.");
            }

            setSelectedBook(data);

        } catch (err) {

            setError(err.message);

        } finally {

            setDetailsLoading(false);

        }

    };


    // Apply for a book
    const handleApplyForBook = async () => {

        try {

            setRequestSubmitting(true);
            setRequestMessage("");
            setRequestError("");

            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Please log in to apply for a book.");
            }

            const response = await fetch(
                "http://localhost:5000/api/book-requests",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        bookId: selectedBook._id
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to submit book request."
                );
            }

            setRequestMessage(
                data.message || "Book request submitted successfully!"
            );

        } catch (err) {

            setRequestError(err.message);

        } finally {

            setRequestSubmitting(false);

        }

    };


    // Clear filters
    const clearFilters = () => {

        setSearch("");
        setCategory("All");
        setAvailability("all");
        setPage(1);

    };


    return (

        <div className="browse-books-page">

            {/* PAGE HEADER */}

            <div className="browse-page-header">

                <div>

                    <span className="browse-eyebrow">
                        LIBRARY COLLECTION
                    </span>

                    <h1>Browse Books</h1>

                    <p>
                        Discover books, explore new subjects
                        and find your next favourite read.
                    </p>

                </div>

                <div className="browse-header-icon">
                    <Library size={35} />
                </div>

            </div>


            {/* SEARCH AND FILTER */}

            <div className="browse-filter-section">

                <div className="browse-search-box">

                    <Search size={20} />

                    <input
                        type="text"
                        placeholder="Search by title, author or ISBN..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                    />

                    {search && (

                        <button
                            className="browse-clear-search"
                            onClick={() => handleSearch("")}
                        >
                            <X size={17} />
                        </button>

                    )}

                </div>


                <div className="browse-category-filter">

                    <Filter size={18} />

                    <select
                        value={category}
                        onChange={(e) => handleCategory(e.target.value)}
                    >

                        <option value="All">All Categories</option>

                        {categories.map((item) => (

                            <option key={item} value={item}>
                                {item}
                            </option>

                        ))}

                    </select>

                </div>


                <div className="browse-category-filter">

                    <select
                        value={availability}
                        onChange={(e) => handleAvailability(e.target.value)}
                    >

                        <option value="all">All Availability</option>
                        <option value="available">Available</option>
                        <option value="unavailable">Unavailable</option>

                    </select>

                </div>

            </div>


            {/* COLLECTION HEADING */}

            <div className="browse-section-heading">

                <div>

                    <h2>Explore Collection</h2>

                    <p>
                        Showing {books.length} of {pagination.totalBooks || 0} books
                    </p>

                </div>

                {(search || category !== "All" || availability !== "all") && (

                    <button
                        className="browse-reset-btn"
                        onClick={clearFilters}
                    >
                        Clear Filters
                    </button>

                )}

            </div>


            {/* LOADING */}

            {loading && (

                <div className="browse-message">
                    <BookOpen size={30} />
                    <p>Loading library books...</p>
                </div>

            )}


            {/* ERROR */}

            {!loading && error && (

                <div className="browse-error">
                    <p>{error}</p>

                    <button onClick={() => setPage(page)}>
                        Try Again
                    </button>
                </div>

            )}


            {/* BOOK GRID */}

            {!loading && !error && books.length > 0 && (

                <div className="browse-books-grid">

                    {books.map((book) => (

                        <div
                            className="browse-book-card"
                            key={book._id}
                        >

                            <div className="browse-book-cover">

                                <BookOpen size={43} />

                                <span>LIBRARY COLLECTION</span>

                            </div>


                            <div className="browse-book-content">

                                <span className="browse-book-category">
                                    {book.category}
                                </span>

                                <h3>{book.title}</h3>

                                <p className="browse-book-author">
                                    By {book.author}
                                </p>

                                <p className="browse-book-description">
                                    {book.description ||
                                        "Explore this book from your library collection."}
                                </p>

                                <div className="browse-book-isbn">
                                    ISBN: {book.isbn}
                                </div>


                                <div className="browse-book-footer">

                                    <span
                                        className={`browse-availability ${
                                            book.availableCopies > 0
                                                ? "available"
                                                : "unavailable"
                                        }`}
                                    >

                                        {book.availableCopies > 0
                                            ? `${book.availableCopies} Available`
                                            : "Unavailable"}

                                    </span>


                                    <button
                                        className="browse-request-btn"
                                        onClick={() => handleViewDetails(book._id)}
                                    >

                                        View Details
                                        <ArrowRight size={15} />

                                    </button>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}


            {/* EMPTY STATE */}

            {!loading && !error && books.length === 0 && (

                <div className="browse-empty-state">

                    <div>
                        <BookOpen size={38} />
                    </div>

                    <h3>No Books Found</h3>

                    <p>
                        We couldn't find any books matching your search.
                        Try another title, author or category.
                    </p>

                    <button onClick={clearFilters}>
                        Clear Filters
                    </button>

                </div>

            )}


            {/* PAGINATION */}

            {!loading && !error && pagination.totalPages > 1 && (

                <div className="browse-pagination">

                    <button
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                    >
                        <ChevronLeft size={17} />
                        Previous
                    </button>

                    <span>
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>

                    <button
                        disabled={page >= pagination.totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        Next
                        <ChevronRight size={17} />
                    </button>

                </div>

            )}


            {/* BOOK DETAILS MODAL */}

            {(selectedBook || detailsLoading) && (

                <div
                    className="browse-modal-overlay"
                    onClick={() => {
                        setSelectedBook(null);
                    }}
                >

                    <div
                        className="browse-details-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <button
                            className="browse-modal-close"
                            onClick={() => setSelectedBook(null)}
                        >
                            <X size={20} />
                        </button>

                        {detailsLoading ? (

                            <p>Loading book details...</p>

                        ) : selectedBook && (

                            <>

                                <div className="browse-modal-icon">
                                    <BookOpen size={35} />
                                </div>

                                <span className="browse-book-category">
                                    {selectedBook.category}
                                </span>

                                <h2>{selectedBook.title}</h2>

                                <p>
                                    By {selectedBook.author}
                                </p>

                                <div className="browse-modal-info">

                                    <p>
                                        <strong>ISBN:</strong> {selectedBook.isbn}
                                    </p>

                                    <p>
                                        <strong>Total Copies:</strong>{" "}
                                        {selectedBook.totalCopies}
                                    </p>

                                    <p>
                                        <strong>Available Copies:</strong>{" "}
                                        {selectedBook.availableCopies}
                                    </p>

                                    <p>
                                        <strong>Status:</strong>{" "}
                                        {selectedBook.availableCopies > 0
                                            ? "Available"
                                            : "Unavailable"}
                                    </p>

                                </div>

                                <p className="browse-modal-description">
                                    {selectedBook.description ||
                                        "No additional description available."}
                                </p>


                                {/* APPLY FOR BOOK */}

                                {requestMessage && (
                                    <p className="book-request-success">
                                        {requestMessage}
                                    </p>
                                )}

                                {requestError && (
                                    <p className="book-request-error">
                                        {requestError}
                                    </p>
                                )}

                                <button
                                    className="browse-apply-btn"
                                    onClick={handleApplyForBook}
                                    disabled={
                                        requestSubmitting ||
                                        !!requestMessage ||
                                        selectedBook.availableCopies <= 0
                                    }
                                >

                                    {requestSubmitting
                                        ? "Submitting Request..."
                                        : requestMessage
                                            ? "Request Submitted"
                                            : selectedBook.availableCopies <= 0
                                                ? "Currently Unavailable"
                                                : "Apply for Book"}

                                </button>

                            </>

                        )}

                    </div>

                </div>

            )}

        </div>

    );

}

export default BrowseBooks;