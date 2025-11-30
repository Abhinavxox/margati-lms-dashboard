import axios, { AxiosInstance } from 'axios';
import type {
  CanvasUser,
  CanvasCourse,
  CanvasAssignment,
  CanvasSubmission,
  CanvasEnrollment,
  CanvasModule,
  CanvasModuleItem,
  CanvasQuiz,
  CanvasPage,
} from '@/types/canvas';

export class CanvasAPI {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(apiKey?: string, baseURL?: string) {
    // Use Next.js API proxy route instead of direct Canvas API
    this.baseURL = typeof window !== 'undefined' ? '/api/canvas' : baseURL || process.env.NEXT_PUBLIC_CANVAS_API_URL || 'http://canvas.docker';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // User methods
  async getUser(userId: string): Promise<CanvasUser> {
    const response = await this.client.get(`/users/${userId}`);
    console.log('[Canvas API] getUser response:', { userId, data: response.data });
    return response.data;
  }

  async getUserCourses(userId: string, enrollmentType?: string): Promise<CanvasCourse[]> {
    const params: any = {
      include: ['total_scores'],
    };
    
    // Only add enrollment_type filter if specified
    if (enrollmentType) {
      params.enrollment_type = enrollmentType;
    }
    
    const response = await this.client.get(`/users/${userId}/courses`, { params });
    console.log('[Canvas API] getUserCourses response:', { userId, enrollmentType, count: response.data?.length, data: response.data });
    return response.data;
  }

  // Course methods
  async getCourse(courseId: string): Promise<CanvasCourse> {
    const response = await this.client.get(`/courses/${courseId}`);
    console.log('[Canvas API] getCourse response:', { courseId, data: response.data });
    return response.data;
  }

  async getCourseAssignments(courseId: string): Promise<CanvasAssignment[]> {
    const response = await this.client.get(`/courses/${courseId}/assignments`);
    console.log('[Canvas API] getCourseAssignments response:', { courseId, count: response.data?.length, data: response.data });
    return response.data;
  }

  async getCourseEnrollments(courseId: string): Promise<CanvasEnrollment[]> {
    const response = await this.client.get(`/courses/${courseId}/enrollments`);
    console.log('[Canvas API] getCourseEnrollments response:', { courseId, count: response.data?.length, data: response.data });
    return response.data;
  }

  async getCourseModules(courseId: string): Promise<CanvasModule[]> {
    const response = await this.client.get(`/courses/${courseId}/modules`);
    return response.data;
  }

  async getModuleItems(courseId: string, moduleId: string): Promise<CanvasModuleItem[]> {
    const response = await this.client.get(`/courses/${courseId}/modules/${moduleId}/items`);
    return response.data;
  }

  // Assignment methods
  async getAssignment(courseId: string, assignmentId: string): Promise<CanvasAssignment> {
    const response = await this.client.get(`/courses/${courseId}/assignments/${assignmentId}`);
    return response.data;
  }

  async getSubmissions(courseId: string, assignmentId: string): Promise<CanvasSubmission[]> {
    const response = await this.client.get(
      `/courses/${courseId}/assignments/${assignmentId}/submissions`,
      {
        params: {
          include: ['user', 'submission_history'],
        },
      }
    );
    return response.data;
  }

  // Get a specific user's submission for an assignment
  async getUserSubmission(courseId: string, assignmentId: string, userId: string): Promise<CanvasSubmission | null> {
    try {
      const response = await this.client.get(
        `/courses/${courseId}/assignments/${assignmentId}/submissions/${userId}`,
        {
          params: {
            include: ['submission_history', 'user'],
          },
        }
      );
      console.log('[Canvas API] getUserSubmission response:', { courseId, assignmentId, userId, data: response.data });
      return response.data;
    } catch (error: any) {
      // 404 means no submission yet
      if (error.response?.status === 404) {
        return null;
      }
      console.error('[Canvas API] Error getting user submission:', error);
      throw error;
    }
  }

  // Get all submissions for a user across all their courses
  async getUserSubmissions(userId: string): Promise<Array<CanvasSubmission & { assignment?: CanvasAssignment; course?: CanvasCourse }>> {
    try {
      const courses = await this.getUserCourses(userId, 'student');
      const allSubmissions: Array<CanvasSubmission & { assignment?: CanvasAssignment; course?: CanvasCourse }> = [];
      
      for (const course of courses) {
        try {
          const assignments = await this.getCourseAssignments(course.id.toString());
          
          for (const assignment of assignments) {
            try {
              const submission = await this.getUserSubmission(course.id.toString(), assignment.id.toString(), userId);
              if (submission) {
                allSubmissions.push({
                  ...submission,
                  assignment,
                  course,
                });
              }
            } catch (error) {
              // Skip if submission doesn't exist or fails
              console.error(`[Canvas API] Failed to get submission for assignment ${assignment.id}:`, error);
            }
          }
        } catch (error) {
          console.error(`[Canvas API] Failed to get assignments for course ${course.id}:`, error);
        }
      }
      
      console.log('[Canvas API] getUserSubmissions response:', { userId, count: allSubmissions.length });
      return allSubmissions;
    } catch (error) {
      console.error('[Canvas API] Error getting user submissions:', error);
      return [];
    }
  }

  // Quiz methods
  async getCourseQuizzes(courseId: string): Promise<CanvasQuiz[]> {
    const response = await this.client.get(`/courses/${courseId}/quizzes`);
    return response.data;
  }

  // Page methods
  async getCoursePages(courseId: string): Promise<CanvasPage[]> {
    const response = await this.client.get(`/courses/${courseId}/pages`);
    return response.data;
  }

  async getPage(courseId: string, pageUrl: string): Promise<CanvasPage> {
    const response = await this.client.get(`/courses/${courseId}/pages/${pageUrl}`);
    return response.data;
  }

  // Calendar/Events - Get upcoming assignments from user's courses
  async getUpcomingEvents(userId: string): Promise<any[]> {
    try {
      console.log('[Canvas API] getUpcomingEvents called for userId:', userId);
      
      // Try calendar_events endpoint first
      try {
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days from now
        
        const response = await this.client.get(`/users/${userId}/calendar_events`, {
          params: {
            start_date: startDate,
            end_date: endDate,
            type: 'assignment',
          },
        });
        
        console.log('[Canvas API] calendar_events response:', { userId, count: response.data?.length, data: response.data });
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          return response.data;
        }
      } catch (calendarError) {
        // Fall back to getting assignments from courses
        console.log('[Canvas API] Calendar events endpoint not available, using course assignments:', calendarError);
      }
      
      // Fallback: Get user's courses and their assignments
      const courses = await this.getUserCourses(userId);
      console.log('[Canvas API] Found courses for upcoming events:', courses.length);
      
      // Get assignments from all courses
      const allAssignments: any[] = [];
      for (const course of courses) {
        try {
          const assignments = await this.getCourseAssignments(course.id.toString());
          // Filter assignments with due dates in the future
          const upcoming = assignments
            .filter((a: any) => {
              if (!a.due_at) return false;
              const dueDate = new Date(a.due_at);
              return dueDate > new Date();
            })
            .map((a: any) => ({
              ...a,
              course_name: course.name,
              course_code: course.course_code,
            }));
          allAssignments.push(...upcoming);
          console.log(`[Canvas API] Found ${upcoming.length} upcoming assignments in course ${course.name}`);
        } catch (error) {
          // Skip courses that fail
          console.error(`[Canvas API] Failed to get assignments for course ${course.id}:`, error);
        }
      }
      
      // Sort by due date
      allAssignments.sort((a, b) => {
        const dateA = a.due_at ? new Date(a.due_at).getTime() : 0;
        const dateB = b.due_at ? new Date(b.due_at).getTime() : 0;
        return dateA - dateB;
      });
      
      console.log('[Canvas API] getUpcomingEvents final result:', { userId, totalAssignments: allAssignments.length });
      return allAssignments;
    } catch (error) {
      console.error('[Canvas API] Error getting upcoming events:', error);
      return [];
    }
  }
}

// Singleton instance
let canvasAPIInstance: CanvasAPI | null = null;

export function getCanvasAPI(apiKey?: string, baseURL?: string): CanvasAPI {
  if (!canvasAPIInstance) {
    canvasAPIInstance = new CanvasAPI(apiKey, baseURL);
  }
  return canvasAPIInstance;
}

