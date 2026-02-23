import { NavLink, useNavigate } from "react-router-dom";
import { useCourseSystem } from "../context/useCourseSystem";

function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, role, displayName, actions } = useCourseSystem();

  const navItems = [{ label: "Home", to: "/" }];

  if (!isLoggedIn) {
    navItems.push({ label: "Login", to: "/login" });
  }

  if (role === "educator") {
    navItems.push({ label: "Educator", to: "/admin" });
  }

  if (role === "student") {
    navItems.push(
      { label: "Student", to: "/student" },
      { label: "Courses", to: "/courses" },
      { label: "Assignments", to: "/assignment" }
    );
  }

  function handleLogout() {
    actions.logout();
    navigate("/login");
  }

  return (
    <header className="top-nav">
      <div className="top-nav__brand">
        <span className="top-nav__brand-main">EduCourse Pro</span>
        <span className="top-nav__brand-sub">Online Teaching Suite</span>
      </div>
      <nav className="top-nav__links">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? "nav-link nav-link--active" : "nav-link")}
          >
            {item.label}
          </NavLink>
        ))}

        {isLoggedIn && (
          <button className="btn btn--ghost nav-logout" onClick={handleLogout}>
            Logout ({displayName || role})
          </button>
        )}
      </nav>
    </header>
  );
}

export default Navbar;