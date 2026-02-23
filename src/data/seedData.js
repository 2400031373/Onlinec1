export const initialCourses = [
  {
    id: "c1",
    title: "Java Programming",
    category: "Programming",
    level: "Beginner",
    description: "Learn Java fundamentals, OOP, and problem solving patterns.",
    tags: ["java", "oop", "backend"],
    modules: [
      { id: "m1", title: "Introduction to Java", type: "Lecture", duration: "45 min" },
      { id: "m2", title: "OOP Concepts", type: "Workshop", duration: "60 min" },
      { id: "m3", title: "Collections", type: "Lab", duration: "50 min" },
    ],
    assignments: [
      {
        id: "a1",
        title: "Build a Calculator",
        dueDate: "2026-03-05",
        maxMarks: 100,
        type: "Project",
      },
      {
        id: "a2",
        title: "OOP Quiz",
        dueDate: "2026-03-08",
        maxMarks: 50,
        type: "Quiz",
      },
    ],
  },
  {
    id: "c2",
    title: "Web Development",
    category: "Development",
    level: "Intermediate",
    description: "Build responsive applications with modern web tooling and React.",
    tags: ["html", "css", "react"],
    modules: [
      { id: "m4", title: "HTML & CSS", type: "Lecture", duration: "40 min" },
      { id: "m5", title: "JavaScript Essentials", type: "Workshop", duration: "65 min" },
      { id: "m6", title: "React Basics", type: "Lab", duration: "70 min" },
    ],
    assignments: [
      {
        id: "a3",
        title: "Portfolio Website",
        dueDate: "2026-03-10",
        maxMarks: 100,
        type: "Project",
      },
      {
        id: "a4",
        title: "React Assessment",
        dueDate: "2026-03-14",
        maxMarks: 75,
        type: "Assessment",
      },
    ],
  },
  {
    id: "c3",
    title: "Python Basics",
    category: "Programming",
    level: "Beginner",
    description: "Start coding with Python syntax, functions, and data structures.",
    tags: ["python", "fundamentals", "scripting"],
    modules: [
      { id: "m7", title: "Python Syntax", type: "Lecture", duration: "35 min" },
      { id: "m8", title: "Functions", type: "Workshop", duration: "50 min" },
      { id: "m9", title: "Lists & Dictionaries", type: "Lab", duration: "55 min" },
    ],
    assignments: [
      {
        id: "a5",
        title: "Data Cleaning Script",
        dueDate: "2026-03-15",
        maxMarks: 100,
        type: "Assignment",
      },
    ],
  },
];

export const initialEnrollment = ["c1"];

export const initialSubmissions = [];