import type { UserRole } from '@/types/canvas';
import { CanvasAPI } from '@/lib/canvas/api';

export async function getUserRole(userId: string, canvasAPI: CanvasAPI): Promise<UserRole> {
  try {
    // Get user's enrollments to determine role
    const courses = await canvasAPI.getUserCourses(userId);
    
    // Check if user has any teacher enrollments
    for (const course of courses) {
      const enrollments = await canvasAPI.getCourseEnrollments(course.id.toString());
      const userEnrollment = enrollments.find(e => e.user_id.toString() === userId);
      
      if (userEnrollment) {
        if (userEnrollment.type === 'TeacherEnrollment') {
          return 'teacher';
        }
        if (userEnrollment.type === 'TaEnrollment') {
          return 'teacher'; // TAs are treated as teachers
        }
        if (userEnrollment.type === 'ObserverEnrollment') {
          return 'advisor';
        }
        if (userEnrollment.type === 'StudentEnrollment') {
          return 'student';
        }
      }
    }
    
    return 'student'; // default
  } catch (error) {
    console.error('Error determining user role:', error);
    return 'student'; // default fallback
  }
}

export function canAccess(role: UserRole, requiredRoles: UserRole[]): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    'admin': 4,
    'teacher': 3,
    'advisor': 2,
    'student': 1,
  };
  
  return requiredRoles.some(r => roleHierarchy[role] >= roleHierarchy[r]);
}

