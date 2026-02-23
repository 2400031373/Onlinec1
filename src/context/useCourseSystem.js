import { useContext } from "react";
import { CourseSystemContext } from "./courseSystemContext";

export function useCourseSystem() {
  const context = useContext(CourseSystemContext);

  if (!context) {
    throw new Error("useCourseSystem must be used inside CourseProvider");
  }

  return context;
}
