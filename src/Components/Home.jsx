import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useCourseSystem } from "../context/useCourseSystem";

function Home() {
  const { courses, submissions, enrolledCourseIds, role, isLoggedIn } = useCourseSystem();

  const totalAssessments = useMemo(
    () => courses.reduce((count, course) => count + course.assignments.length, 0),
    [courses]
  );

  return (
    <section className="page">
      <div className="hero">
        <p className="hero__eyebrow">Online Course System for Educators and Students</p>
        <h1>Create, Manage, and Deliver Better Online Learning</h1>
        <p>
          This platform helps instructors create courses, manage content, and evaluate assessments,
          while students can enroll, access materials, and submit assignments in one neat workflow.
        </p>
        <div className="button-row">
          {!isLoggedIn && (
            <Link className="btn" to="/login">
              Login as Student or Instructor
            </Link>
          )}
          {role === "educator" && (
            <Link className="btn" to="/admin">
              Open Instructor Dashboard
            </Link>
          )}
          {role === "student" && (
            <>
              <Link className="btn" to="/student">
                Open Student Dashboard
              </Link>
              <Link className="btn btn--ghost" to="/courses">
                Browse Courses
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-3">
        <article className="card stat-card">
          <p>Published Courses</p>
          <h3>{courses.length}</h3>
        </article>
        <article className="card stat-card">
          <p>Assessments Planned</p>
          <h3>{totalAssessments}</h3>
        </article>
        <article className="card stat-card">
          <p>Submission Events</p>
          <h3>{submissions.length}</h3>
        </article>
      </div>

      <div className="grid grid-2">
        <article className="card">
          <h3>Instructor Workspace</h3>
          <ul>
            <li>Create and organize structured online courses</li>
            <li>Add modules, assignments, quizzes, and assessments</li>
            <li>Track submissions, grade work, and monitor progress</li>
          </ul>
        </article>

        <article className="card">
          <h3>Student Workspace</h3>
          <ul>
            <li>Enroll in available courses</li>
            <li>Access modules and course learning materials</li>
            <li>Submit assignments and review assessment feedback</li>
          </ul>
        </article>
      </div>

      <article className="card">
        <h3>Current Platform Activity</h3>
        <p>
          {enrolledCourseIds.length} active enrollments are currently tracked in the student
          workspace.
        </p>
      </article>
    </section>
  );
}

export default Home;