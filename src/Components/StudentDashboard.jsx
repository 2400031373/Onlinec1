import { useMemo } from "react";
import { useCourseSystem } from "../context/useCourseSystem";

function StudentDashboard() {
  const { enrolledCourses, submissions, studentName } = useCourseSystem();
  const courses = enrolledCourses;

  const totalAssignments = courses.reduce((count, course) => count + course.assignments.length, 0);
  const mySubmissions = submissions.filter((submission) => submission.studentName === studentName);
  const gradedSubmissions = mySubmissions.filter((submission) => submission.status === "Graded");
  const averageMarks =
    gradedSubmissions.length > 0
      ? Math.round(
          gradedSubmissions.reduce((sum, submission) => sum + Number(submission.marks || 0), 0) /
            gradedSubmissions.length
        )
      : 0;
  const completionRate = totalAssignments > 0 ? Math.round((mySubmissions.length / totalAssignments) * 100) : 0;

  const upcomingItems = useMemo(() => {
    return courses
      .flatMap((course) =>
        course.assignments.map((assignment) => ({
          ...assignment,
          courseTitle: course.title,
        }))
      )
      .sort((first, second) => new Date(first.dueDate) - new Date(second.dueDate))
      .slice(0, 5);
  }, [courses]);

  const assessmentPerformance = gradedSubmissions
    .filter((item) => item.assignmentType === "Quiz" || item.assignmentType === "Assessment")
    .map((item) => ({
      id: item.id,
      title: item.assignmentTitle,
      score: item.marks,
      maxMarks: item.maxMarks || 100,
    }));

  return (
    <section className="page">
      <h2>Student Dashboard</h2>
      <p>Welcome, {studentName}. Continue your enrolled courses and track assignment completion.</p>

      <div className="grid grid-3">
        <article className="card stat-card">
          <p>Enrolled Courses</p>
          <h3>{courses.length}</h3>
        </article>
        <article className="card stat-card">
          <p>Completion Rate</p>
          <h3>{completionRate}%</h3>
        </article>
        <article className="card stat-card">
          <p>Average Marks</p>
          <h3>{averageMarks}</h3>
        </article>
        <article className="card stat-card">
          <p>Completed Work</p>
          <h3>{mySubmissions.length}</h3>
        </article>
      </div>

      <article className="card">
        <h3>My Enrolled Courses</h3>
        {courses.length === 0 ? (
          <p>No enrolled courses yet. Visit the Courses page to enroll.</p>
        ) : (
          <div className="stack-list">
            {courses.map((course) => (
              <div className="list-row" key={course.id}>
                <div>
                  <h4>{course.title}</h4>
                  <p>{course.description}</p>
                  <p>
                    Level: {course.level} • {course.modules.length} modules
                  </p>
                </div>
                <div className="list-meta">
                  <span>{course.assignments.length} assessments</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="card">
        <h3>Upcoming Deadlines</h3>
        {upcomingItems.length === 0 ? (
          <p>No upcoming assessments right now.</p>
        ) : (
          <div className="stack-list">
            {upcomingItems.map((item) => (
              <div className="list-row" key={`${item.courseTitle}-${item.id}`}>
                <div>
                  <h4>{item.title}</h4>
                  <p>
                    {item.courseTitle} • {item.type}
                  </p>
                </div>
                <div className="list-meta">
                  <span>Due: {item.dueDate}</span>
                  <span>Max: {item.maxMarks}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="card">
        <h3>Assignment Status</h3>
        {mySubmissions.length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          <div className="stack-list">
            {mySubmissions.map((submission) => (
              <div className="list-row" key={submission.id}>
                <div>
                  <h4>{submission.assignmentTitle || submission.assignmentId}</h4>
                  <p>{submission.courseTitle || submission.courseId}</p>
                  {submission.feedback && <p>Feedback: {submission.feedback}</p>}
                </div>
                <div className="list-meta">
                  <span>Status: {submission.status}</span>
                  <span>
                    Marks: {submission.marks === null || submission.marks === undefined ? "Pending" : submission.marks}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="card">
        <h3>Assessment Performance</h3>
        {assessmentPerformance.length === 0 ? (
          <p>No graded quizzes/assessments yet.</p>
        ) : (
          <div className="stack-list">
            {assessmentPerformance.map((assessment) => (
              <div className="list-row" key={assessment.id}>
                <div>
                  <h4>{assessment.title}</h4>
                </div>
                <div className="list-meta">
                  <span>
                    Score: {assessment.score}/{assessment.maxMarks}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}

export default StudentDashboard;