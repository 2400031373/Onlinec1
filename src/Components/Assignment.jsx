import { useMemo, useState } from "react";
import { useCourseSystem } from "../context/useCourseSystem";

function Assignment() {
  const { enrolledCourses, submissions, studentName, actions } = useCourseSystem();
  const courses = enrolledCourses;

  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || "");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(
    courses[0]?.assignments[0]?.id || ""
  );
  const [fileName, setFileName] = useState("");
  const [notes, setNotes] = useState("");

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId),
    [courses, selectedCourseId]
  );

  const availableAssignments = selectedCourse?.assignments || [];
  const mySubmissions = submissions.filter((submission) => submission.studentName === studentName);

  function handleCourseChange(event) {
    const courseId = event.target.value;
    setSelectedCourseId(courseId);

    const course = courses.find((item) => item.id === courseId);
    setSelectedAssignmentId(course?.assignments[0]?.id || "");
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!selectedCourseId || !selectedAssignmentId || !fileName.trim()) {
      return;
    }

    actions.submitAssignment({
      courseId: selectedCourseId,
      assignmentId: selectedAssignmentId,
      fileName,
      notes,
    });

    setFileName("");
    setNotes("");
  }

  return (
    <section className="page">
      <h2>Assignment Submission</h2>

      <article className="card">
        <h3>Submit Your Work</h3>
        {courses.length === 0 ? (
          <p>No enrolled courses available. Please enroll in a course first.</p>
        ) : (
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Course
              <select value={selectedCourseId} onChange={handleCourseChange}>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Assignment
              <select
                value={selectedAssignmentId}
                onChange={(event) => setSelectedAssignmentId(event.target.value)}
              >
                {availableAssignments.map((assignment) => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.title} (Due: {assignment.dueDate})
                  </option>
                ))}
              </select>
            </label>

            <label className="full-width">
              Submission File Name
              <input
                value={fileName}
                onChange={(event) => setFileName(event.target.value)}
                placeholder="e.g. rohit-assignment1.pdf"
              />
            </label>

            <label className="full-width">
              Notes for Educator
              <textarea
                rows="3"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add comments, assumptions, or links related to your submission"
              />
            </label>

            <button className="btn" type="submit">
              Submit Assignment
            </button>
          </form>
        )}
      </article>

      <article className="card">
        <h3>Recent Submissions</h3>
        {mySubmissions.length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          <div className="stack-list">
            {mySubmissions.map((submission) => (
              <div className="list-row" key={submission.id}>
                <div>
                  <h4>
                    {submission.assignmentTitle} • {submission.fileName}
                  </h4>
                  <p>
                    Student: {studentName} • Status: {submission.status} • Type: {submission.assignmentType}
                  </p>
                  {submission.feedback && <p>Feedback: {submission.feedback}</p>}
                </div>
                <div className="list-meta">
                  <span>{submission.courseTitle}</span>
                  <span>Marks: {submission.marks ?? "Pending"}</span>
                  <span>{submission.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}

export default Assignment;