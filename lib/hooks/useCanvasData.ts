'use client';

import { useQuery } from '@tanstack/react-query';
import { CanvasAPI } from '@/lib/canvas/api';
import type { CanvasCourse, CanvasAssignment, CanvasSubmission } from '@/types/canvas';

const canvasAPI = new CanvasAPI();

export function useUserCourses(userId: string, enrollmentType?: string) {
  return useQuery<CanvasCourse[]>({
    queryKey: ['courses', userId, enrollmentType || 'all'],
    queryFn: () => canvasAPI.getUserCourses(userId, enrollmentType),
    enabled: !!userId,
  });
}

export function useCourseAssignments(courseId: string) {
  return useQuery<CanvasAssignment[]>({
    queryKey: ['assignments', courseId],
    queryFn: () => canvasAPI.getCourseAssignments(courseId),
    enabled: !!courseId,
  });
}

export function useUpcomingEvents(userId: string) {
  return useQuery({
    queryKey: ['events', userId],
    queryFn: () => canvasAPI.getUpcomingEvents(userId),
    enabled: !!userId,
  });
}

export function useUserSubmissions(userId: string) {
  return useQuery<Array<CanvasSubmission & { assignment?: CanvasAssignment; course?: CanvasCourse }>>({
    queryKey: ['submissions', userId],
    queryFn: () => canvasAPI.getUserSubmissions(userId),
    enabled: !!userId,
  });
}
