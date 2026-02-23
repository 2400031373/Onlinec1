import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Login from "./Components/Login";
import Home from "./Components/Home";
import StudentDashboard from "./Components/StudentDashboard";
import AdminDashboard from "./Components/AdminDashboard";
import Courses from "./Components/Courses";
import Assignment from "./Components/Assignment";
import { CourseProvider } from "./context/CourseContext";
import { useCourseSystem } from "./context/useCourseSystem";

function ProtectedRoute({ allowedRole, children }) {
  const { isLoggedIn, role } = useCourseSystem();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (role !== allowedRole) {
    return <Navigate to={role === "educator" ? "/admin" : "/student"} replace />;
  }

  return children;
}

function App() {
  return (
    <CourseProvider>
      <BrowserRouter>
        <Navbar />
        <main className="app-shell">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRole="educator">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses"
              element={
                <ProtectedRoute allowedRole="student">
                  <Courses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignment"
              element={
                <ProtectedRoute allowedRole="student">
                  <Assignment />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </CourseProvider>
  );
}

export default App;