import { useEffect, useRef, useState } from "react";
import {
  Search, ClipboardList, BookOpen, BookCheck, AlertTriangle,
  Download, Eye, X, CalendarDays, User, Hash, RotateCcw,
} from "lucide-react";
import "./Transaction.css";

const ISSUES_API = "http://localhost:5000/api/issues";

// ============================================
// API REQUEST
// ============================================
async function apiRequest(url) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
  });

  const contentType = response.headers.get("content-type");

  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("Server returned an invalid response. Please check backend.");
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to fetch transactions.");
  }

  return data;
}


// ============================================
// DATE FUNCTIONS
// ============================================
function getToday() {
  const date = new Date();

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getDateOnly(value) {
  if (!value) return "";

  return String(value).slice(0, 10);
}

function getTransactionStatus(record, today) {
  if (record.status === "Returned") return "Returned";

  if (
    record.status === "Issued" &&
    record.dueDate &&
    getDateOnly(record.dueDate) < today
  ) {
    return "Overdue";
  }

  return "Issued";
}

function formatDate(value) {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function safeText(value) {
  return String(value ?? "");
}


// ============================================
// CSV SECURITY
// ============================================
function escapeCSV(value) {
  let text = safeText(value);

  if (/^[\s\u0000-\u001f]*[=+@-]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}


// ============================================
// TRANSACTION COMPONENT
// ============================================
function Transaction() {

  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  const today = getToday();


  // ============================================
  // FETCH TRANSACTIONS FROM MONGODB
  // ============================================
  async function refreshTransactions() {
    try {
      setError("");

      const data = await apiRequest(ISSUES_API);

      setTransactions(Array.isArray(data) ? data : []);

    } catch (error) {
      console.error("Transaction fetching error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }


  // ============================================
  // LOAD DATA WHEN PAGE OPENS
  // ============================================
  useEffect(() => {
    refreshTransactions();

    function handleFocus() {
      refreshTransactions();
    }

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);


  // ============================================
  // MODAL ACCESSIBILITY
  // ============================================
  useEffect(() => {
    if (!selectedTransaction) return undefined;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function onKeyDown(event) {

      if (event.key === "Escape") {
        setSelectedTransaction(null);
      }

      if (event.key === "Tab") {
        const buttons = [
          ...document.querySelectorAll(
            ".transactions-modal button:not(:disabled)"
          ),
        ];

        if (!buttons.length) return;

        const first = buttons[0];
        const last = buttons[buttons.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();

        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      document.removeEventListener("keydown", onKeyDown);

      previousFocusRef.current?.focus();
    };

  }, [selectedTransaction]);


  // ============================================
  // TRANSACTION STATISTICS
  // ============================================
  const totalTransactions = transactions.length;

  const currentlyIssued = transactions.filter(
    (item) => item.status === "Issued"
  ).length;

  const totalReturned = transactions.filter(
    (item) => item.status === "Returned"
  ).length;

  const totalOverdue = transactions.filter(
    (item) => getTransactionStatus(item, today) === "Overdue"
  ).length;


  // ============================================
  // SEARCH AND FILTER
  // ============================================
  const filteredTransactions = transactions
    .filter((item) => {

      const needle = search.trim().toLowerCase();

      const searchable = [
        item.studentName,
        item.studentId,
        item.bookTitle,
        item.isbn,
        item._id,
      ].some((value) =>
        safeText(value).toLowerCase().includes(needle)
      );

      const status = getTransactionStatus(item, today);

      return (
        searchable &&
        (statusFilter === "All" || status === statusFilter)
      );
    })
    .sort((a, b) =>
      safeText(b.issueDate).localeCompare(safeText(a.issueDate))
    );


  // ============================================
  // EXPORT CSV
  // ============================================
  function handleExportCSV() {

    if (!filteredTransactions.length) {
      alert("There are no transactions to export.");
      return;
    }

    const headers = [
      "Transaction ID",
      "Student Name",
      "Student ID",
      "Book Title",
      "ISBN",
      "Issue Date",
      "Due Date",
      "Return Date",
      "Status",
    ];

    const rows = filteredTransactions.map((item) => [
      item._id,
      item.studentName,
      item.studentId,
      item.bookTitle,
      item.isbn,
      getDateOnly(item.issueDate),
      getDateOnly(item.dueDate),
      getDateOnly(item.returnDate),
      getTransactionStatus(item, today),
    ]);

    const content = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const url = URL.createObjectURL(
      new Blob(["\uFEFF", content], {
        type: "text/csv;charset=utf-8",
      })
    );

    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `library-transactions-${today}.csv`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }


  // ============================================
  // OPEN TRANSACTION DETAILS
  // ============================================
  function openDetails(item) {
    previousFocusRef.current = document.activeElement;
    setSelectedTransaction(item);
  }


  // ============================================
  // SUMMARY CARDS
  // ============================================
  const summaryCards = [
    {
      title: "Total Transactions",
      value: totalTransactions,
      icon: ClipboardList,
      color: "blue",
    },
    {
      title: "Currently Issued",
      value: currentlyIssued,
      icon: BookOpen,
      color: "orange",
    },
    {
      title: "Total Returned",
      value: totalReturned,
      icon: BookCheck,
      color: "green",
    },
    {
      title: "Overdue Books",
      value: totalOverdue,
      icon: AlertTriangle,
      color: "red",
    },
  ];


  // ============================================
  // UI
  // ============================================
  return (
    <main className="transactions-page">

      {/* HEADER */}
      <div className="transactions-page-header">

        <div>
          <h1>Transactions</h1>
          <p>Track book borrowing, returns, and overdue records.</p>
        </div>

        <div className="transactions-header-actions">

          <button
            type="button"
            className="transactions-refresh-btn"
            onClick={refreshTransactions}
            disabled={loading}
          >
            <RotateCcw size={17} /> Refresh
          </button>

          <button
            type="button"
            className="transactions-export-btn"
            onClick={handleExportCSV}
          >
            <Download size={18} /> Export CSV
          </button>

        </div>
      </div>


      {/* SUMMARY CARDS */}
      <div className="transactions-summary-grid">

        {summaryCards.map(({ title, value, icon: Icon, color }) => (

          <div className="transactions-summary-card" key={title}>

            <div className={`transactions-summary-icon ${color}`}>
              <Icon size={23} />
            </div>

            <div>
              <p>{title}</p>
              <h2>{value}</h2>
            </div>

          </div>

        ))}

      </div>


      {/* TRANSACTION TABLE */}
      <section className="transactions-table-section">

        <div className="transactions-table-header">

          <div>
            <h2>Transaction History</h2>
            <p>{filteredTransactions.length} records found</p>
          </div>

          <div className="transactions-table-actions">

            <label className="transactions-search-box">

              <Search size={18} />

              <input
                aria-label="Search transactions"
                type="search"
                placeholder="Search transactions..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

            </label>

            <select
              className="transactions-status-filter"
              aria-label="Filter transaction status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Issued">Issued</option>
              <option value="Returned">Returned</option>
              <option value="Overdue">Overdue</option>
            </select>

          </div>

        </div>


        <div className="transactions-table-wrapper">

          <table className="transactions-table">

            <thead>
              <tr>
                <th>Student</th>
                <th>Book Details</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td colSpan={7} className="transactions-empty-message">
                    Loading transactions...
                  </td>
                </tr>

              ) : error ? (

                <tr>
                  <td colSpan={7} className="transactions-empty-message">
                    {error}
                  </td>
                </tr>

              ) : filteredTransactions.length ? (

                filteredTransactions.map((item) => {

                  const status = getTransactionStatus(item, today);

                  return (

                    <tr key={item._id}>

                      <td>
                        <div className="transactions-student-info">
                          <h4>{item.studentName || "N/A"}</h4>
                          <p>{item.studentId || "N/A"}</p>
                        </div>
                      </td>

                      <td>
                        <div className="transactions-book-info">

                          <div className="transactions-book-icon">
                            <BookOpen size={19} />
                          </div>

                          <div>
                            <h4>{item.bookTitle || "N/A"}</h4>
                            <p>ISBN: {item.isbn || "N/A"}</p>
                          </div>

                        </div>
                      </td>

                      <td>{formatDate(item.issueDate)}</td>

                      <td>{formatDate(item.dueDate)}</td>

                      <td>{formatDate(item.returnDate)}</td>

                      <td>
                        <span className={`transactions-status ${status.toLowerCase()}`}>
                          {status}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="transactions-view-btn"
                          onClick={() => openDetails(item)}
                          aria-label={`View transaction for ${item.studentName || "student"}`}
                        >
                          <Eye size={17} /> View
                        </button>
                      </td>

                    </tr>

                  );

                })

              ) : (

                <tr>
                  <td colSpan={7} className="transactions-empty-message">
                    No transactions found.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* TRANSACTION DETAILS MODAL */}
      {selectedTransaction && (

        <div
          className="transactions-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedTransaction(null);
            }
          }}
        >

          <div
            className="transactions-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-modal-title"
          >

            <div className="transactions-modal-header">

              <div>
                <h2 id="transaction-modal-title">Transaction Details</h2>
                <p>Complete borrowing record information.</p>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                className="transactions-close-btn"
                onClick={() => setSelectedTransaction(null)}
                aria-label="Close details"
              >
                <X size={22} />
              </button>

            </div>


            <div className="transactions-detail-id">
              <Hash size={17} />
              <span>ID: {selectedTransaction._id || "N/A"}</span>
            </div>


            {/* STUDENT INFORMATION */}
            <div className="transactions-detail-section">

              <h3>
                <User size={18} /> Student Information
              </h3>

              <div className="transactions-detail-row">
                <span>Student Name</span>
                <strong>{selectedTransaction.studentName || "N/A"}</strong>
              </div>

              <div className="transactions-detail-row">
                <span>Student ID</span>
                <strong>{selectedTransaction.studentId || "N/A"}</strong>
              </div>

            </div>


            {/* BOOK INFORMATION */}
            <div className="transactions-detail-section">

              <h3>
                <BookOpen size={18} /> Book Information
              </h3>

              <div className="transactions-detail-row">
                <span>Book Title</span>
                <strong>{selectedTransaction.bookTitle || "N/A"}</strong>
              </div>

              <div className="transactions-detail-row">
                <span>ISBN</span>
                <strong>{selectedTransaction.isbn || "N/A"}</strong>
              </div>

            </div>


            {/* BORROWING INFORMATION */}
            <div className="transactions-detail-section">

              <h3>
                <CalendarDays size={18} /> Borrowing Information
              </h3>

              <div className="transactions-detail-row">
                <span>Issue Date</span>
                <strong>{formatDate(selectedTransaction.issueDate)}</strong>
              </div>

              <div className="transactions-detail-row">
                <span>Due Date</span>
                <strong>{formatDate(selectedTransaction.dueDate)}</strong>
              </div>

              <div className="transactions-detail-row">
                <span>Return Date</span>
                <strong>{formatDate(selectedTransaction.returnDate)}</strong>
              </div>

              <div className="transactions-detail-row">
                <span>Status</span>

                <span className={`transactions-status ${getTransactionStatus(selectedTransaction, today).toLowerCase()}`}>
                  {getTransactionStatus(selectedTransaction, today)}
                </span>
              </div>

            </div>


            <div className="transactions-modal-actions">

              <button
                type="button"
                className="transactions-close-action-btn"
                onClick={() => setSelectedTransaction(null)}
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}

export default Transaction;