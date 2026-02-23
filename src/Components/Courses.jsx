import { useMemo, useState } from "react";
import { useCourseSystem } from "../context/useCourseSystem";

function Courses() {
  const { courses, enrolledCourseIds, actions } = useCourseSystem();
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [sortBy, setSortBy] = useState("recent");

  const filteredCourses = useMemo(() => {
    const searched = courses.filter((course) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        course.title.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query) ||
        course.tags.join(" ").toLowerCase().includes(query);
      const matchesLevel = levelFilter === "All" || course.level === levelFilter;
      return matchesSearch && matchesLevel;
    });

    if (sortBy === "title") {
      return [...searched].sort((first, second) => first.title.localeCompare(second.title));
    }

    if (sortBy === "workload") {
      return [...searched].sort(
        (first, second) => second.assignments.length - first.assignments.length
      );
    }

    return searched;
  }, [courses, searchTerm, levelFilter, sortBy]);

  const enrolledCount = enrolledCourseIds.length;

  return (
    <section className="page">
      <h2>Course Catalog</h2>
      <p>Explore available courses, compare workload, and enroll to start learning.</p>

      <article className="card">
        <div className="form-grid">
          <label>
            Search Courses
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by title or category"
            />
          </label>
          <label>
            Filter by Level
            <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)}>
              <option>All</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </label>
          <label>
            Sort By
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="recent">Recently Added</option>
              <option value="title">Title (A-Z)</option>
              <option value="workload">Assessment Workload</option>
            </select>
          </label>
        </div>
        <p className="inline-note">Active enrollments: {enrolledCount}</p>
      </article>

      <div className="grid grid-2">
        {filteredCourses.map((course) => {
          const isEnrolled = enrolledCourseIds.includes(course.id);

          return (
            <article className="card" key={course.id}>
              <h3>{course.title}</h3>
              <p>
                {course.category} • {course.level}
              </p>
              <p>{course.description}</p>
              <p>Tags: {course.tags.join(", ")}</p>
              <p>
                Modules: {course.modules.length} | Assignments: {course.assignments.length}
              </p>
              <button
                className={`btn ${isEnrolled ? "btn--ghost" : ""}`}
                onClick={() => actions.enrollCourse(course.id)}
              >
                {isEnrolled ? "Enrolled" : "Enroll in Course"}
              </button>
            </article>
          );
        })}
      </div>
      {filteredCourses.length === 0 && <p>No courses match your current search/filter.</p>}
    </section>
  );
}

export default Courses;