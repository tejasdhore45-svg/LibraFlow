// ======================================================
// LIBRARY MANAGEMENT SYSTEM - MAIN APPLICATION
// ======================================================

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// PUBLIC HOMEPAGE
import PublicHome from "./pages/public/PublicHome";

// AUTHENTICATION PAGES
import Login from "./pages/authentication/Login";
import Signup from "./pages/authentication/Signup";
import StudentSignup from "./pages/authentication/StudentSignup";

// ADMIN LAYOUT
import AdminLayout from "./pages/admin/AdminLayout";

// ADMIN PAGES
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageBooks from "./pages/admin/ManageBooks";
import IssueBook from "./pages/admin/IssueBook";
import ReturnBook from "./pages/admin/ReturnBook";
import ManageStudent from "./pages/admin/ManageStudent";
import Transaction from "./pages/admin/Transaction";
import ManageBookRequests from "./pages/admin/ManageBookRequests";

// STUDENT LAYOUT
import StudentLayout from "./pages/student/StudentLayout";

// STUDENT PAGES
import StudentDashboard from "./pages/student/StudentDashboard";
import BrowseBooks from "./pages/student/BrowseBooks";
import MyBorrowedBooks from "./pages/student/MyBorrowedBooks";
import StudentTransaction from "./pages/student/Transaction";
import MyProfile from "./pages/student/MyProfile";


function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* PUBLIC HOMEPAGE */}

        <Route
          path="/"
          element={<PublicHome />}
        />


        {/* AUTHENTICATION ROUTES */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/student-signup"
          element={<StudentSignup />}
        />


        {/* ADMIN DASHBOARD ROUTES */}

        <Route path="/admin" element={<AdminLayout />}>

          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />

          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="books"
            element={<ManageBooks />}
          />

          <Route
            path="issue"
            element={<IssueBook />}
          />

          <Route
            path="return"
            element={<ReturnBook />}
          />

          <Route
            path="students"
            element={<ManageStudent />}
          />

          {/* MANAGE BOOK REQUESTS */}

          <Route
            path="book-requests"
            element={<ManageBookRequests />}
          />

          <Route
            path="transactions"
            element={<Transaction />}
          />

        </Route>


        {/* STUDENT DASHBOARD ROUTES */}

        <Route path="/student" element={<StudentLayout />}>

          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />

          <Route
            path="dashboard"
            element={<StudentDashboard />}
          />

          <Route
            path="books"
            element={<BrowseBooks />}
          />

          <Route
            path="borrowed-books"
            element={<MyBorrowedBooks />}
          />

          <Route
            path="transactions"
            element={<StudentTransaction />}
          />

          <Route
            path="profile"
            element={<MyProfile />}
          />

        </Route>


        {/* UNKNOWN ROUTES */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;