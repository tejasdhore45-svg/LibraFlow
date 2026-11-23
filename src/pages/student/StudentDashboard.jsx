import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";

import {
    BookOpen,
    BookCheck,
    Clock,
    History,
    ArrowRight,
    CalendarDays
} from "lucide-react";

function StudentDashboard() {

    const navigate = useNavigate();

    const [student, setStudent] = useState(null);

    const [stats, setStats] = useState({
        borrowedBooks: 0,
        returnedBooks: 0,
        dueSoon: 0,
        totalTransactions: 0
    });

    const [borrowedBooks, setBorrowedBooks] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch logged-in student's dashboard data
    useEffect(() => {

        const fetchDashboard = async () => {

            try {

                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                const response = await fetch(
                    "http://localhost:5000/api/dashboard/student",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Unable to load dashboard.");
                }

                setStudent(data.student);
                setStats(data.stats);
                setBorrowedBooks(data.recentBorrowedBooks);

            } catch (err) {

                setError(err.message);

            } finally {

                setLoading(false);

            }
        };

        fetchDashboard();

    }, [navigate]);


    const statCards = [
        {
            title: "Borrowed Books",
            value: stats.borrowedBooks,
            icon: <BookOpen size={22} />,
            color: "blue"
        },
        {
            title: "Returned Books",
            value: stats.returnedBooks,
            icon: <BookCheck size={22} />,
            color: "green"
        },
        {
            title: "Due Soon",
            value: stats.dueSoon,
            icon: <Clock size={22} />,
            color: "orange"
        },
        {
            title: "Total Transactions",
            value: stats.totalTransactions,
            icon: <History size={22} />,
            color: "purple"
        }
    ];


    if (loading) {
        return <div className="student-dashboard">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="student-dashboard">{error}</div>;
    }


    return (

        <div className="student-dashboard">

            {/* Welcome Section */}

            <section className="dashboard-welcome">

                <div>

                    <span>STUDENT PORTAL</span>

                    <h1>
                        Welcome back, {student?.name || "Student"}!
                    </h1>

                    <p>
                        Explore your library activities and
                        manage your borrowed books.
                    </p>

                    <button onClick={() => navigate("/student/books")}>
                        Explore Books
                        <ArrowRight size={17} />
                    </button>

                </div>

                <BookOpen size={90} />

            </section>


            {/* Statistics Section */}

            <section className="dashboard-stats">

                {statCards.map((item, index) => (

                    <div className="dashboard-stat-card" key={index}>

                        <div className={`stat-icon ${item.color}`}>
                            {item.icon}
                        </div>

                        <div>
                            <p>{item.title}</p>
                            <h2>{item.value}</h2>
                        </div>

                    </div>

                ))}

            </section>


            {/* Borrowed Books Section */}

            <section className="dashboard-books">

                <div className="dashboard-section-header">

                    <div>
                        <h2>Recently Borrowed Books</h2>
                        <p>Keep track of your borrowing activities.</p>
                    </div>

                    <button onClick={() => navigate("/student/borrowed-books")}>
                        View All
                        <ArrowRight size={16} />
                    </button>

                </div>


                <div className="dashboard-table-wrapper">

                    <table>

                        <thead>
                            <tr>
                                <th>Book Title</th>
                                <th>Due Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>

                            {borrowedBooks.length > 0 ? (

                                borrowedBooks.map((book) => (

                                    <tr key={book.id}>

                                        <td>{book.title}</td>

                                        <td>
                                            <CalendarDays size={15} />

                                            {book.dueDate
                                                ? new Date(book.dueDate).toLocaleDateString("en-IN")
                                                : "-"
                                            }
                                        </td>

                                        <td>
                                            <span className={`book-status ${
                                                book.status === "Due Soon" ||
                                                book.status === "Overdue"
                                                    ? "warning"
                                                    : "success"
                                            }`}>
                                                {book.status}
                                            </span>
                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>
                                    <td colSpan="3">
                                        No borrowing records found.
                                    </td>
                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </section>

        </div>

    );

}

export default StudentDashboard;