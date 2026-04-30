import { useEffect, useMemo, useState } from "react";
import { CourseSystemContext } from "./courseSystemContext";

const STORAGE_KEYS = {
  enrolled: "course-system-enrolled",
  auth: "course-system-auth",
};

const API_BASE_URL = "http://localhost:8080/api";

const defaultStudentName = "Rohit";

function readStoredValue(key, fallbackValue) {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function buildId(prefix) {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

function normalizeCourse(course) {
  return {
    ...course,
    tags: Array.isArray(course.tags)
      ? course.tags
      : String(course.tags || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
    modules: Array.isArray(course.modules) ? course.modules : [],
    assignments: Array.isArray(course.assignments) ? course.assignments : [],
  };
}

function normalizeSubmission(submission) {
  return {
    ...submission,
    status: submission.status || "Submitted",
    marks: submission.marks ?? null,
    feedback: submission.feedback || "",
  };
}

export function CourseProvider({ children }) {
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(() =>
    readStoredValue(STORAGE_KEYS.enrolled, [])
  );
  const [submissions, setSubmissions] = useState([]);
  const [auth, setAuth] = useState(() =>
    readStoredValue(STORAGE_KEYS.auth, null)
  );

  const studentName =
    auth?.role === "student" && auth?.name
      ? auth.name
      : defaultStudentName;

  const enrolledCourses = useMemo(
    () => courses.filter((course) => enrolledCourseIds.includes(course.id)),
    [courses, enrolledCourseIds]
  );

  useEffect(() => {
    async function loadCourses() {
      try {
        const response = await fetch(`${API_BASE_URL}/courses`);
        if (!response.ok) return;

        const data = await response.json();
        setCourses(Array.isArray(data) ? data.map(normalizeCourse) : []);
      } catch {
        setCourses([]);
      }
    }

    loadCourses();
  }, []);

  useEffect(() => {
    async function loadSubmissions() {
      try {
        const response = await fetch(`${API_BASE_URL}/submissions`);
        if (!response.ok) return;

        const data = await response.json();
        setSubmissions(
          Array.isArray(data) ? data.map(normalizeSubmission) : []
        );
      } catch {
        setSubmissions([]);
      }
    }

    loadSubmissions();
  }, []);

  async function createCourse(courseInput) {
    const parsedTags = (courseInput.tags || "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    const payload = {
      title: courseInput.title,
      category: courseInput.category,
      level: courseInput.level,
      description: courseInput.description,
      tags: parsedTags,
    };

    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return;

    const newCourse = await response.json();

    setCourses((previousCourses) => [
      normalizeCourse(newCourse),
      ...previousCourses,
    ]);

    if (courseInput.dueDate) {
      addAssignment(newCourse.id, {
        title: `${courseInput.title} - Initial Assessment`,
        type: "Assessment",
        dueDate: courseInput.dueDate,
        maxMarks: 100,
      });
    }
  }

  async function addModule(courseId, moduleInput) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/courses/${courseId}/modules`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(moduleInput),
        }
      );

      if (response.ok) {
        const createdModule = await response.json();

        setCourses((previousCourses) =>
          previousCourses.map((course) =>
            course.id === courseId
              ? {
                  ...course,
                  modules: [...course.modules, createdModule],
                }
              : course
          )
        );
      }
    } catch {}
  }

  async function addAssignment(courseId, assignmentInput) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/courses/${courseId}/assignments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(assignmentInput),
        }
      );

      if (response.ok) {
        const createdAssignment = await response.json();

        setCourses((previousCourses) =>
          previousCourses.map((course) =>
            course.id === courseId
              ? {
                  ...course,
                  assignments: [
                    ...course.assignments,
                    createdAssignment,
                  ],
                }
              : course
          )
        );
      }
    } catch {}
  }

  async function enrollCourse(courseId) {
    try {
      await fetch(`${API_BASE_URL}/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      });
    } catch {}

    setEnrolledCourseIds((previousIds) =>
      previousIds.includes(courseId)
        ? previousIds
        : [...previousIds, courseId]
    );
  }

  async function login(loginInput) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: loginInput.role,
          email: loginInput.email,
          password: loginInput.password,
        }),
      });

      if (!response.ok) {
        alert("Invalid Login");
        return false;
      }

      const user = await response.json();

      setAuth({
        role: user.role,
        name: user.name,
        email: user.email,
      });

      return true;
    } catch {
      alert("Server Error");
      return false;
    }
  }

  async function registerAccount(accountInput) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountInput),
      });

      if (!response.ok) {
        alert("Registration Failed");
        return false;
      }

      alert("Account Created Successfully");
      return true;
    } catch {
      alert("Server Error");
      return false;
    }
  }

  function logout() {
    setAuth(null);
  }

  async function submitAssignment(submissionInput) {
    const selectedCourse = courses.find(
      (course) => course.id === submissionInput.courseId
    );

    const selectedAssignment = selectedCourse?.assignments.find(
      (assignment) =>
        assignment.id === submissionInput.assignmentId
    );

    if (!selectedCourse || !selectedAssignment) return;

    const response = await fetch(`${API_BASE_URL}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...submissionInput,
        studentName,
      }),
    });

    if (!response.ok) return;

    const created = await response.json();

    setSubmissions((previousSubmissions) => [
      {
        ...normalizeSubmission(created),
        studentName,
        courseTitle: selectedCourse.title,
        assignmentTitle: selectedAssignment.title,
      },
      ...previousSubmissions,
    ]);
  }

  async function gradeSubmission(submissionId, marks, feedback) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/submissions/${submissionId}/grade`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ marks, feedback }),
        }
      );

      if (response.ok) {
        const updated = await response.json();

        setSubmissions((previousSubmissions) =>
          previousSubmissions.map((submission) =>
            submission.id === submissionId
              ? { ...submission, ...updated }
              : submission
          )
        );
      }
    } catch {}
  }

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.enrolled,
      JSON.stringify(enrolledCourseIds)
    );
  }, [enrolledCourseIds]);

  useEffect(() => {
    if (auth) {
      localStorage.setItem(
        STORAGE_KEYS.auth,
        JSON.stringify(auth)
      );
    } else {
      localStorage.removeItem(STORAGE_KEYS.auth);
    }
  }, [auth]);

  const value = {
    auth,
    isLoggedIn: Boolean(auth),
    role: auth?.role || "student",
    displayName: auth?.name || "",
    studentName,
    courses,
    enrolledCourseIds,
    enrolledCourses,
    submissions,

    actions: {
      login,
      registerAccount,
      logout,
      createCourse,
      addModule,
      addAssignment,
      enrollCourse,
      submitAssignment,
      gradeSubmission,
    },
  };

  return (
    <CourseSystemContext.Provider value={value}>
      {children}
    </CourseSystemContext.Provider>
  );
}