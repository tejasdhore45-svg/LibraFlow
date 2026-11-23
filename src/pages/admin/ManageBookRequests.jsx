import { useEffect, useState } from "react";

import {
    Search,
    RefreshCw,
    ClipboardList,
    Clock,
    CheckCircle,
    XCircle,
    BookOpen,
    UserRound,
    Check,
    X
} from "lucide-react";

import "./ManageBookRequests.css";

const API_URL = "http://localhost:5000/api/book-requests";


// API HELPER
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


export default function ManageBookRequests() {

    const [requests, setRequests] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState(null);

    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");


    // FETCH BOOK REQUESTS
    async function refresh() {

        try {

            setLoading(true);
            setError("");

            const data = await apiRequest(API_URL);

            setRequests(Array.isArray(data) ? data : data.requests || []);

        } catch (err) {

            setError(err.message || "Unable to load book requests.");

        } finally {

            setLoading(false);

        }

    }


    useEffect(() => {

        refresh();

    }, []);


    // APPROVE REQUEST
    async function handleApprove(request) {

        const confirmed = window.confirm(
            `Approve the book request for "${request.book?.title}" from ${request.student?.name}?`
        );

        if (!confirmed) return;

        try {

            setProcessingId(request._id);
            setError("");
            setNotice("");

            const data = await apiRequest(
                `${API_URL}/${request._id}/approve`,
                {
                    method: "PUT"
                }
            );

            await refresh();

            setNotice(
                data.message || "Book request approved successfully. Book issued to student."
            );

        } catch (err) {

            setError(err.message || "Unable to approve request.");

        } finally {

            setProcessingId(null);

        }

    }


    // REJECT REQUEST
    async function handleReject(request) {

        const confirmed = window.confirm(
            `Are you sure you want to reject the request for "${request.book?.title}" from ${request.student?.name}?`
        );

        if (!confirmed) return;

        try {

            setProcessingId(request._id);
            setError("");
            setNotice("");

            const data = await apiRequest(
                `${API_URL}/${request._id}/reject`,
                {
                    method: "PUT",
                    body: JSON.stringify({
                        remarks: "Request rejected by library admin."
                    })
                }
            );

            await refresh();

            setNotice(
                data.message || "Book request rejected successfully."
            );

        } catch (err) {

            setError(err.message || "Unable to reject request.");

        } finally {

            setProcessingId(null);

        }

    }


    // FORMAT DATE
    function formatDate(date) {

        if (!date) return "—";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

    }


    // SEARCH AND FILTER
    const query = search.trim().toLowerCase();

    const filteredRequests = requests.filter((request) => {

        const searchable = [

            request.student?.name,
            request.student?.studentId,
            request.student?.email,
            request.book?.title,
            request.book?.author,
            request.book?.isbn

        ].map(value => String(value || "").toLowerCase());

        return (

            searchable.some(value => value.includes(query)) &&

            (
                statusFilter === "All" ||
                request.status === statusFilter
            )

        );

    });


    // STATISTICS
    const pendingCount = requests.filter(
        request => request.status === "Pending"
    ).length;

    const approvedCount = requests.filter(
        request => request.status === "Approved"
    ).length;

    const rejectedCount = requests.filter(
        request => request.status === "Rejected"
    ).length;


    return (

        <main className="book-requests-page">


            {/* PAGE HEADER */}

            <header className="book-requests-header">

                <div>

                    <span className="book-requests-eyebrow">
                        LIBRARY MANAGEMENT
                    </span>

                    <h1>Manage Book Requests</h1>

                    <p>
                        Review student book requests and manage approvals.
                    </p>

                </div>

                <button
                    className="book-requests-refresh-btn"
                    onClick={refresh}
                    disabled={loading}
                >
                    <RefreshCw size={18} />
                    Refresh
                </button>

            </header>


            {/* ALERTS */}

            {error && (

                <div className="book-requests-alert error" role="alert">
                    {error}
                </div>

            )}

            {notice && (

                <div className="book-requests-alert success" role="status">
                    {notice}
                </div>

            )}


            {/* SUMMARY CARDS */}

            <section className="book-requests-summary">

                <div className="book-request-stat-card">

                    <div className="book-request-stat-icon blue">
                        <ClipboardList size={23} />
                    </div>

                    <div>
                        <p>Total Requests</p>
                        <h2>{requests.length}</h2>
                    </div>

                </div>


                <div className="book-request-stat-card">

                    <div className="book-request-stat-icon orange">
                        <Clock size={23} />
                    </div>

                    <div>
                        <p>Pending Requests</p>
                        <h2>{pendingCount}</h2>
                    </div>

                </div>


                <div className="book-request-stat-card">

                    <div className="book-request-stat-icon green">
                        <CheckCircle size={23} />
                    </div>

                    <div>
                        <p>Approved Requests</p>
                        <h2>{approvedCount}</h2>
                    </div>

                </div>


                <div className="book-request-stat-card">

                    <div className="book-request-stat-icon red">
                        <XCircle size={23} />
                    </div>

                    <div>
                        <p>Rejected Requests</p>
                        <h2>{rejectedCount}</h2>
                    </div>

                </div>

            </section>


            {/* REQUEST TABLE */}

            <section className="book-requests-table-section">


                {/* TABLE HEADER */}

                <div className="book-requests-table-header">

                    <div>

                        <h2>Student Requests</h2>

                        <p>
                            {filteredRequests.length} requests found
                        </p>

                    </div>


                    <div className="book-requests-table-actions">

                        <label className="book-requests-search">

                            <Search size={18} />

                            <input
                                type="text"
                                placeholder="Search student or book..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                        </label>


                        <select
                            className="book-requests-filter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >

                            <option value="All">All Requests</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>

                        </select>

                    </div>

                </div>


                {/* TABLE */}

                <div className="book-requests-table-wrapper">

                    <table className="book-requests-table">

                        <thead>

                            <tr>
                                <th>Student</th>
                                <th>Book Details</th>
                                <th>Request Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>

                        </thead>


                        <tbody>

                            {loading && requests.length === 0 ? (

                                <tr>
                                    <td colSpan={5} className="book-requests-empty">
                                        Loading book requests...
                                    </td>
                                </tr>

                            ) : filteredRequests.length > 0 ? (

                                filteredRequests.map((request) => (

                                    <tr key={request._id}>

                                        {/* STUDENT */}

                                        <td>

                                            <div className="book-request-student">

                                                <div className="book-request-avatar">
                                                    <UserRound size={19} />
                                                </div>

                                                <div>

                                                    <strong>
                                                        {request.student?.name || "Unknown Student"}
                                                    </strong>

                                                    <span>
                                                        ID: {request.student?.studentId || "—"}
                                                    </span>

                                                    <small>
                                                        {request.student?.email || ""}
                                                    </small>

                                                </div>

                                            </div>

                                        </td>


                                        {/* BOOK */}

                                        <td>

                                            <div className="book-request-book">

                                                <div className="book-request-book-icon">
                                                    <BookOpen size={20} />
                                                </div>

                                                <div>

                                                    <strong>
                                                        {request.book?.title || "Unknown Book"}
                                                    </strong>

                                                    <span>
                                                        By {request.book?.author || "Unknown Author"}
                                                    </span>

                                                    <small>
                                                        ISBN: {request.book?.isbn || "—"}
                                                    </small>

                                                </div>

                                            </div>

                                        </td>


                                        {/* DATE */}

                                        <td>
                                            {formatDate(request.requestDate)}
                                        </td>


                                        {/* STATUS */}

                                        <td>

                                            <span
                                                className={`book-request-status ${
                                                    request.status?.toLowerCase()
                                                }`}
                                            >

                                                {request.status}

                                            </span>

                                        </td>


                                        {/* ACTIONS */}

                                        <td>

                                            {request.status === "Pending" ? (

                                                <div className="book-request-actions">

                                                    <button
                                                        className="book-request-approve"
                                                        onClick={() => handleApprove(request)}
                                                        disabled={processingId === request._id}
                                                        title="Approve request"
                                                    >

                                                        <Check size={16} />

                                                        {processingId === request._id
                                                            ? "Processing..."
                                                            : "Approve"}

                                                    </button>


                                                    <button
                                                        className="book-request-reject"
                                                        onClick={() => handleReject(request)}
                                                        disabled={processingId === request._id}
                                                        title="Reject request"
                                                    >

                                                        <X size={16} />
                                                        Reject

                                                    </button>

                                                </div>

                                            ) : (

                                                <span className="book-request-processed">
                                                    {request.status === "Approved"
                                                        ? "Request Approved"
                                                        : "Request Rejected"}
                                                </span>

                                            )}

                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>
                                    <td colSpan={5} className="book-requests-empty">

                                        <ClipboardList size={35} />

                                        <h3>No Book Requests Found</h3>

                                        <p>
                                            There are no requests matching your search or filter.
                                        </p>

                                    </td>
                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </section>

        </main>

    );

}