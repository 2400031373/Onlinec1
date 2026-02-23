import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useCourseSystem } from "../context/useCourseSystem";

function Login() {
  const navigate = useNavigate();
  const { isLoggedIn, role, actions, userCount } = useCourseSystem();
  const [mode, setMode] = useState("login");
  const [selectedRole, setSelectedRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  if (isLoggedIn) {
    return <Navigate to={role === "educator" ? "/admin" : "/student"} replace />;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!password.trim()) {
      setStatusMessage("Please enter a password to continue.");
      return;
    }

    if (mode === "register") {
      if (!name.trim() || !email.trim()) {
        setStatusMessage("Name and email are required to create an account.");
        return;
      }

      actions.registerAccount({
        role: selectedRole,
        name,
        email,
        password,
      });
    }

    actions.login({
      role: selectedRole,
      name,
      email,
      password,
    });

    setStatusMessage("");
    navigate(selectedRole === "educator" ? "/admin" : "/student");
  }

  return (
    <section className="page narrow">
      <article className="card">
        <h2>{mode === "login" ? "Login to Your Workspace" : "Create an Account"}</h2>
        <p>
          {mode === "login"
            ? "Sign in as student or instructor to access your role-based workspace."
            : "Create a student or instructor account. You can use it right away after signup."}
        </p>

        <div className="button-row auth-switch-row">
          <button
            type="button"
            className={`btn ${mode === "login" ? "" : "btn--ghost"}`}
            onClick={() => {
              setMode("login");
              setStatusMessage("");
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={`btn ${mode === "register" ? "" : "btn--ghost"}`}
            onClick={() => {
              setMode("register");
              setStatusMessage("");
            }}
          >
            Create Account
          </button>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          {(mode === "register" || selectedRole === "educator") && (
            <label className="full-width">
              Display Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Rohit"
              />
            </label>
          )}

          <label className="full-width">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="e.g. rohit@example.com"
            />
          </label>

          <label>
            Role
            <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}>
              <option value="student">Student</option>
              <option value="educator">Instructor / Educator</option>
            </select>
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
            />
          </label>

          {statusMessage && <p className="auth-status auth-status--error">{statusMessage}</p>}

          {mode === "login" && (
            <p className="auth-status">
              Existing accounts: {userCount}. Use your registered role and email for a personalized workspace.
            </p>
          )}

          <button className="btn" type="submit">
            {mode === "register" ? "Create Account & Continue" : "Continue to Dashboard"}
          </button>
        </form>
      </article>
    </section>
  );
}

export default Login;