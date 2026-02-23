import { useEffect, useMemo, useState } from "react";
import { initialCourses, initialEnrollment, initialSubmissions } from "../data/seedData";
import { CourseSystemContext } from "./courseSystemContext";

const STORAGE_KEYS = {
  courses: "course-system-courses",
  enrolled: "course-system-enrolled",
  submissions: "course-system-submissions",
  auth: "course-system-auth",
  users: "course-system-users",
};

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

export function CourseProvider({ children }) {
  const [courses, setCourses] = useState(() => readStoredValue(STORAGE_KEYS.courses, initialCourses));
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(() =>
    readStoredValue(STORAGE_KEYS.enrolled, initialEnrollment)
  );
  const [submissions, setSubmissions] = useState(() =>
    readStoredValue(STORAGE_KEYS.submissions, initialSubmissions)
  );
  const [auth, setAuth] = useState(() => readStoredValue(STORAGE_KEYS.auth, null));
  const [users, setUsers] = useState(() => readStoredValue(STORAGE_KEYS.users, []));

  const studentName = auth?.role === "student" && auth?.name ? auth.name : defaultStudentName;

  const enrolledCourses = useMemo(
    () => courses.filter((course) => enrolledCourseIds.includes(course.id)),
    [courses, enrolledCourseIds]
  );

  function createCourse(courseInput) {
    const courseId = buildId("c");
    const assignmentId = buildId("a");

    const newCourse = {
      id: courseId,
      title: courseInput.title,
      category: courseInput.category,
      level: courseInput.level,
      description: courseInput.description,
      tags: courseInput.tags
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
      modules: [
        { id: buildId("m"), title: "Course Overview", type: "Lecture", duration: "30 min" },
        { id: buildId("m"), title: "Core Concepts", type: "Workshop", duration: "45 min" },
      ],
      assignments: [
        {
          id: assignmentId,
          title: `${courseInput.title} - Initial Assessment`,
          dueDate: courseInput.dueDate,
          maxMarks: 100,
          type: "Assessment",
        },
      ],
    };

    setCourses((previousCourses) => [newCourse, ...previousCourses]);
  }

  function addModule(courseId, moduleInput) {
    setCourses((previousCourses) =>
      previousCourses.map((course) => {
        if (course.id !== courseId) {
          return course;
        }

        return {
          ...course,
          modules: [...course.modules, { id: buildId("m"), ...moduleInput }],
        };
      })
    );
  }

  function addAssignment(courseId, assignmentInput) {
    setCourses((previousCourses) =>
      previousCourses.map((course) => {
        if (course.id !== courseId) {
          return course;
        }

        return {
          ...course,
          assignments: [
            ...course.assignments,
            {
              id: buildId("a"),
              title: assignmentInput.title,
              dueDate: assignmentInput.dueDate,
              maxMarks: Number(assignmentInput.maxMarks),
              type: assignmentInput.type,
            },
          ],
        };
      })
    );
  }

  function enrollCourse(courseId) {
    setEnrolledCourseIds((previousIds) =>
      previousIds.includes(courseId) ? previousIds : [...previousIds, courseId]
    );
  }

  function login(loginInput) {
    const role = loginInput?.role || "student";
    const email = (loginInput?.email || "").trim().toLowerCase();
    const name = (loginInput?.name || "").trim();
    const matchedAccount = users.find((account) => account.role === role && account.email === email);

    const resolvedName =
      matchedAccount?.name ||
      name ||
      (role === "educator" ? "Educator" : defaultStudentName);

    setAuth({
      role,
      name: resolvedName,
      email: matchedAccount?.email || email || "",
    });
  }

  function registerAccount(accountInput) {
    const role = accountInput?.role || "student";
    const email = (accountInput?.email || "").trim().toLowerCase();
    const name = (accountInput?.name || "").trim();
    const password = accountInput?.password || "";

    if (!email || !name || !password) {
      return;
    }

    setUsers((previousUsers) => {
      const accountExists = previousUsers.some(
        (account) => account.role === role && account.email === email
      );

      if (accountExists) {
        return previousUsers.map((account) =>
          account.role === role && account.email === email
            ? {
                ...account,
                name,
                password,
                updatedAt: new Date().toISOString(),
              }
            : account
        );
      }

      return [
        {
          id: buildId("u"),
          role,
          name,
          email,
          password,
          createdAt: new Date().toISOString(),
        },
        ...previousUsers,
      ];
    });
  }

  function logout() {
    setAuth(null);
  }

  function submitAssignment(submissionInput) {
    const selectedCourse = courses.find((course) => course.id === submissionInput.courseId);
    const selectedAssignment = selectedCourse?.assignments.find(
      (assignment) => assignment.id === submissionInput.assignmentId
    );

    if (!selectedCourse || !selectedAssignment) {
      return;
    }

    const createdAt = new Date().toLocaleString();

    setSubmissions((previousSubmissions) => {
      const existingSubmission = previousSubmissions.find(
        (item) =>
          item.courseId === submissionInput.courseId &&
          item.assignmentId === submissionInput.assignmentId &&
          item.studentName === studentName
      );

      if (existingSubmission) {
        return previousSubmissions.map((item) =>
          item.id === existingSubmission.id
            ? {
                ...item,
                fileName: submissionInput.fileName,
                notes: submissionInput.notes,
                createdAt,
                status: "Resubmitted",
                marks: null,
                feedback: "",
              }
            : item
        );
      }

      return [
        {
          id: buildId("s"),
          studentName,
          ...submissionInput,
          courseTitle: selectedCourse.title,
          assignmentTitle: selectedAssignment.title,
          assignmentType: selectedAssignment.type,
          dueDate: selectedAssignment.dueDate,
          maxMarks: selectedAssignment.maxMarks,
          status: "Submitted",
          createdAt,
          marks: null,
          feedback: "",
        },
        ...previousSubmissions,
      ];
    });
  }

  function gradeSubmission(submissionId, marks, feedback) {
    setSubmissions((previousSubmissions) =>
      previousSubmissions.map((submission) =>
        submission.id === submissionId
          ? {
              ...submission,
              marks,
              feedback,
              status: "Graded",
            }
          : submission
      )
    );
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.courses, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.enrolled, JSON.stringify(enrolledCourseIds));
  }, [enrolledCourseIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.submissions, JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    if (auth) {
      localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(auth));
      return;
    }

    localStorage.removeItem(STORAGE_KEYS.auth);
  }, [auth]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }, [users]);

  const value = {
    auth,
    isLoggedIn: Boolean(auth),
    role: auth?.role || null,
    displayName: auth?.name || "",
    userCount: users.length,
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

  return <CourseSystemContext.Provider value={value}>{children}</CourseSystemContext.Provider>;
}