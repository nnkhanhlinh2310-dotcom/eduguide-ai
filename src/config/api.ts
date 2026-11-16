/**
 * Cấu hình kết nối API trung gian Google Apps Script.
 * Không lưu khóa API bí mật tại frontend.
 */

export const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbx9KQgsZJT019io1SSY_9JirMlMVZY5-eGLnYIpiNIwWTRpe7PEPmFfH6hHvokdIlPY/exec";

export const API_TIMEOUT_MS = 25000;

export const API_ACTIONS = {
  PING: "",
  SCHOOLS: "schools",
  SCHOOL_COMBOS: "schoolCombos",
  PROVINCES: "provinces",
  UNIVERSITIES: "universities",
  PROGRAMS: "programs",
  ADMISSIONS: "admissions",
  CAREER_LOOKUP: "TRA_CUU_NGANH_NGHE",
  MAJORS: "majors",
  HOLLAND_QUESTIONS: "hollandQuestions",
  HOLLAND_GROUPS: "hollandGroups",
} as const;

export type ApiActionName = (typeof API_ACTIONS)[keyof typeof API_ACTIONS];
