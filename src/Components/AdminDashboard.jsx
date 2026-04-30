import { useEffect, useMemo, useState } from "react";
import { useCourseSystem } from "../context/useCourseSystem";

function AdminDashboard() {
  const { courses, submissions, enrolledCourseIds, actions } = useCourseSystem();

  const [formData, setFormData] = useState({
    title: "",
    category: "Programming",
    level: "Beginner",
    description: "",
    dueDate: "",
    tags: "",
  });
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || "");
  const [moduleInput, setModuleInput] = useState({ title: "", type: "Lecture", duration: "" });
  const [assignmentInput, setAssignmentInput] = useState({
    title: "",
    type: "Assignment",
    dueDate: "",
    maxMarks: 100,
  });
  const [gradingInputs, setGradingInputs] = useState({});

  useEffect(() => {
    if (!selectedCourseId && courses.length > 0) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  const totalAssignments = useMemo(
    () => courses.reduce((count, course) => count + course.assignments.length, 0),
    [courses]
  );
  const totalModules = useMemo(
    () => courses.reduce((count, course) => count + course.modules.length, 0),
    [courses]
  );

  const pendingReviews = submissions.filter((submission) => submission.status !== "Graded");
  const gradedCount = submissions.filter((submission) => submission.status === "Graded").length;
  const trackedStudents = [...new Set(submissions.map((submission) => submission.studentName))];
  const assignedWorkload = enrolledCourseIds.length * totalAssignments;
  const completionRate = assignedWorkload > 0 ? Math.round((submissions.length / assignedWorkload) * 100) : 0;

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.dueDate) {
      return;
    }

    actions.createCourse(formData);
    setFormData({
      title: "",
      category: "Programming",
      level: "Beginner",
      description: "",
      dueDate: "",
      tags: "",
    });
  }

  function handleModuleSubmit(event) {
    event.preventDefault();
    if (!selectedCourseId || !moduleInput.title.trim() || !moduleInput.duration.trim()) {
      return;
    }

    actions.addModule(selectedCourseId, moduleInput);
    setModuleInput({ title: "", type: "Lecture", duration: "" });
  }

  function handleAssignmentSubmit(event) {
    event.preventDefault();
    if (
      !selectedCourseId ||
      !assignmentInput.title.trim() ||
      !assignmentInput.dueDate ||
      Number(assignmentInput.maxMarks) <= 0
    ) {
      return;
    }

    actions.addAssignment(selectedCourseId, assignmentInput);
    setAssignmentInput({
      title: "",
      type: "Assignment",
      dueDate: "",
      maxMarks: 100,
    });
  }

  function handleGradingInputChange(submissionId, field, value) {
    setGradingInputs((previous) => ({
      ...previous,
      [submissionId]: {
        ...previous[submissionId],
        [field]: value,
      },
    }));
  }

  function handleGrade(submissionId) {
    const gradeInput = gradingInputs[submissionId] || {};
    const marks = Number(gradeInput.marks);
    const feedback = (gradeInput.feedback || "").trim();

    if (Number.isNaN(marks) || marks < 0 || marks > 100) {
      return;
    }

    actions.gradeSubmission(submissionId, marks, feedback);
  }

  return (
    <section className="page">
      <h2>Educator Dashboard</h2>

      <div className="grid grid-3">
        <article className="card stat-card">
          <p>Total Courses</p>
          <h3>{courses.length}</h3>
        </article>
        <article className="card stat-card">
          <p>Total Assignments</p>
          <h3>{totalAssignments}</h3>
        </article>
        <article className="card stat-card">
          <p>Total Modules</p>
          <h3>{totalModules}</h3>
        </article>
        <article className="card stat-card">
          <p>Student Submissions</p>
          <h3>{submissions.length}</h3>
        </article>
        <article className="card stat-card">
          <p>Graded Submissions</p>
          <h3>{gradedCount}</h3>
        </article>
      </div>

      <article className="card">
        <h3>Create New Course</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Course Title
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Data Structures"
            />
          </label>
          <label>
            Category
            <input
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Programming"
            />
          </label>
          <label>
            Level
            <select name="level" value={formData.level} onChange={handleChange}>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </label>
          <label>
            Assignment Due Date
            <input name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} />
          </label>
          <label className="full-width">
            Course Description
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Write a concise course description"
            />
          </label>
          <label className="full-width">
            Tags (comma-separated)
            <input
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g. java, backend, fundamentals"
            />
          </label>
          <button className="btn" type="submit">
            Create Course
          </button>
        </form>
      </article>

      <article className="card">
        <h3>Content & Assessment Builder</h3>
        <div className="form-grid">
          <label className="full-width">
            Select Course
            <select value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)}>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-2">
          <form className="card card--muted" onSubmit={handleModuleSubmit}>
            <h4>Add Module</h4>
            <div className="form-grid">
              <label>
                Module Title
                <input
                  value={moduleInput.title}
                  onChange={(event) =>
                    setModuleInput((previous) => ({ ...previous, title: event.target.value }))
                  }
                />
              </label>
              <label>
                Type
                <select
                  value={moduleInput.type}
                  onChange={(event) =>
                    setModuleInput((previous) => ({ ...previous, type: event.target.value }))
                  }
                >
                  <option>Lecture</option>
                  <option>Workshop</option>
                  <option>Lab</option>
                  <option>Reading</option>
                </select>
              </label>
              <label className="full-width">
                Duration
                <input
                  placeholder="e.g. 45 min"
                  value={moduleInput.duration}
                  onChange={(event) =>
                    setModuleInput((previous) => ({ ...previous, duration: event.target.value }))
                  }
                />
              </label>
              <button className="btn" type="submit">
                Add Module
              </button>
            </div>
          </form>

          <form className="card card--muted" onSubmit={handleAssignmentSubmit}>
            <h4>Add Assessment</h4>
            <div className="form-grid">
              <label>
                Title
                <input
                  value={assignmentInput.title}
                  onChange={(event) =>
                    setAssignmentInput((previous) => ({ ...previous, title: event.target.value }))
                  }
                />
              </label>
              <label>
                Type
                <select
                  value={assignmentInput.type}
                  onChange={(event) =>
                    setAssignmentInput((previous) => ({ ...previous, type: event.target.value }))
                  }
                >
                  <option>Assignment</option>
                  <option>Quiz</option>
                  <option>Project</option>
                  <option>Assessment</option>
                </select>
              </label>
              <label>
                Due Date
                <input
                  type="date"
                  value={assignmentInput.dueDate}
                  onChange={(event) =>
                    setAssignmentInput((previous) => ({ ...previous, dueDate: event.target.value }))
                  }
                />
              </label>
              <label>
                Max Marks
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={assignmentInput.maxMarks}
                  onChange={(event) =>
                    setAssignmentInput((previous) => ({ ...previous, maxMarks: event.target.value }))
                  }
                />
              </label>
              <button className="btn" type="submit">
                Add Assessment
              </button>
            </div>
          </form>
        </div>
      </article>

      <article className="card">
        <h3>Course Content Management</h3>
        <div className="stack-list">
          {courses.map((course) => (
            <div key={course.id} className="list-row">
              <div>
                <h4>{course.title}</h4>
                <p>
                  {course.category} • {course.level}
                </p>
                <p>{course.description}</p>
              </div>
              <div className="list-meta">
                <span>{course.modules.length} modules</span>
                <span>{course.assignments.length} assessments</span>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="card">
        <h3>Track Student Progress</h3>
        <p>Tracked students: <strong>{trackedStudents.length || 1}</strong></p>
        <p>
          Enrolled courses: {enrolledCourseIds.length} | Submitted assignments: {submissions.length}
        </p>
        <p>Overall completion rate: {completionRate}%</p>
      </article>

      <article className="card">
        <h3>Assessment Review Queue</h3>
        {pendingReviews.length === 0 ? (
          <p>All current submissions are graded.</p>
        ) : (
          <div className="stack-list">
            {pendingReviews.map((submission) => {
              const gradeInput = gradingInputs[submission.id] || {};

              return (
                <div key={submission.id} className="list-row list-row--grade">
                  <div>
                    <h4>{submission.assignmentTitle || submission.assignmentId}</h4>
                    <p>
                      {submission.courseTitle || submission.courseId} • {submission.fileName}
                    </p>
                    <p>
                      Student: {submission.studentName} • Submitted: {submission.createdAt} • Type: {submission.assignmentType}
                    </p>
                    {submission.notes && <p>Student Note: {submission.notes}</p>}
                  </div>
                  <div className="grade-controls">
                    <input
                      type="number"
                      min="0"
                      max={submission.maxMarks || 100}
                      placeholder="Marks"
                      value={gradeInput.marks || ""}
                      onChange={(event) =>
                        handleGradingInputChange(submission.id, "marks", event.target.value)
                      }
                    />
                    <input
                      placeholder="Feedback"
                      value={gradeInput.feedback || ""}
                      onChange={(event) =>
                        handleGradingInputChange(submission.id, "feedback", event.target.value)
                      }
                    />
                    <button className="btn" onClick={() => handleGrade(submission.id)}>
                      Save Grade
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </article>
    </section>
  );
}

export default AdminDashboard;