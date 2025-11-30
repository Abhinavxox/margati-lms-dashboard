// Canvas API Type Definitions

export type UserRole = 'student' | 'teacher' | 'advisor' | 'admin';

export interface CanvasUser {
  id: number;
  name: string;
  email: string;
  login_id?: string;
  avatar_url?: string;
}

export interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
  start_at?: string;
  end_at?: string;
  enrollment_term_id?: number;
  default_view?: string;
  workflow_state?: string;
  total_scores?: CanvasGrade;
}

export interface CanvasAssignment {
  id: number;
  name: string;
  description?: string;
  due_at?: string;
  points_possible?: number;
  submission_types?: string[];
  published: boolean;
  course_id: number;
}

export interface CanvasSubmission {
  id: number;
  assignment_id: number;
  user_id: number;
  submitted_at?: string;
  score?: number;
  grade?: string;
  workflow_state: string;
  assignment?: CanvasAssignment;
  course?: CanvasCourse;
}

export interface CanvasEnrollment {
  id: number;
  user_id: number;
  course_id: number;
  type: string; // 'StudentEnrollment' | 'TeacherEnrollment' | etc.
  enrollment_state: string;
  role: string;
}

export interface CanvasModule {
  id: number;
  name: string;
  position: number;
  published: boolean;
  items_count?: number;
}

export interface CanvasModuleItem {
  id: number;
  module_id: number;
  type: string; // 'Assignment' | 'Quiz' | 'Page' | etc.
  content_id?: number;
  page_url?: string;
  position: number;
  title: string;
}

export interface CanvasQuiz {
  id: number;
  title: string;
  description?: string;
  points_possible?: number;
  time_limit?: number;
  published: boolean;
  assignment_id?: number;
}

export interface CanvasPage {
  url: string;
  title: string;
  body?: string;
  published: boolean;
}

export interface CanvasGrade {
  current_score?: number;
  final_score?: number;
  current_grade?: string;
  final_grade?: string;
}

