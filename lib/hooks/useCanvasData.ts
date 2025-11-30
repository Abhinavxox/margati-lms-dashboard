'use client';

import { useQuery } from '@tanstack/react-query';
import { CanvasAPI } from '@/lib/canvas/api';
import type { CanvasCourse, CanvasAssignment } from '@/types/canvas';

const canvasAPI = new CanvasAPI();

export function useUserCourses(userId: string) {
  return useQuery<CanvasCourse[]>({
    queryKey: ['courses', userId],
    queryFn: () => canvasAPI.getUserCourses(userId),
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

