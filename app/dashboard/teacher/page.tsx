'use client';

import { useState, useEffect } from 'react';
import { getSession } from '@/lib/auth/session';
import { useQuery } from '@tanstack/react-query';
import { CanvasAPI } from '@/lib/canvas/api';
import type { CanvasCourse, CanvasEnrollment } from '@/types/canvas';

const canvasAPI = new CanvasAPI();

export default function TeacherDashboard() {
  const [session, setSession] = useState<any>(null);
  const [userId, setUserId] = useState<string>('1');

  useEffect(() => {
    // Only access localStorage on client side
    const userSession = getSession();
    setSession(userSession);
    setUserId(userSession?.userId || '1');
  }, []);

  // Get courses where user is a teacher
  const { data: courses, isLoading: coursesLoading } = useQuery<CanvasCourse[]>({
    queryKey: ['teacher-courses', userId],
    queryFn: async () => {
      // Get all courses and filter by teacher enrollments
      const allCourses = await canvasAPI.getUserCourses(userId);
      // Filter courses where user is teacher
      const teacherCourses = [];
      for (const course of allCourses) {
        const enrollments = await canvasAPI.getCourseEnrollments(course.id.toString());
        const isTeacher = enrollments.some(
          (e: CanvasEnrollment) => 
            e.user_id.toString() === userId && 
            (e.type === 'TeacherEnrollment' || e.type === 'TaEnrollment')
        );
        if (isTeacher) {
          teacherCourses.push(course);
        }
      }
      return teacherCourses;
    },
    enabled: !!userId,
  });

  // Get enrollments for each course
  const { data: enrollmentsData } = useQuery({
    queryKey: ['teacher-enrollments', courses],
    queryFn: async () => {
      if (!courses) return {};
      const enrollmentsMap: Record<string, CanvasEnrollment[]> = {};
      for (const course of courses) {
        const enrollments = await canvasAPI.getCourseEnrollments(course.id.toString());
        enrollmentsMap[course.id] = enrollments.filter(
          (e: CanvasEnrollment) => e.type === 'StudentEnrollment'
        );
      }
      return enrollmentsMap;
    },
    enabled: !!courses && courses.length > 0,
  });

  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Teacher Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Courses */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">My Courses</h2>
            <div className="space-y-4">
              {courses && courses.length > 0 ? (
                courses.map((course) => {
                  const studentCount = enrollmentsData?.[course.id]?.length || 0;
                  return (
                    <div key={course.id} className="border-b pb-4 last:border-0">
                      <h3 className="font-medium text-gray-900">{course.name}</h3>
                      <p className="text-sm text-gray-600">{course.course_code}</p>
                      <p className="text-sm text-blue-600 mt-1">
                        {studentCount} student{studentCount !== 1 ? 's' : ''} enrolled
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500">No courses found</p>
              )}
            </div>
          </div>
        </div>

        {/* Students in Classes */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Students in My Classes</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {courses && courses.length > 0 ? (
                courses.map((course) => {
                  const students = enrollmentsData?.[course.id] || [];
                  return (
                    <div key={course.id} className="border-b pb-4 last:border-0">
                      <h3 className="font-medium text-gray-900 mb-2">{course.name}</h3>
                      <div className="space-y-1">
                        {students.length > 0 ? (
                          students.slice(0, 5).map((enrollment: CanvasEnrollment) => (
                            <div key={enrollment.id} className="text-sm text-gray-600">
                              • Student ID: {enrollment.user_id}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No students enrolled</p>
                        )}
                        {students.length > 5 && (
                          <p className="text-sm text-gray-500">
                            + {students.length - 5} more student{students.length - 5 !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500">No courses to display</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{courses?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {enrollmentsData 
                  ? Object.values(enrollmentsData).reduce((sum, students) => sum + students.length, 0)
                  : 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average per Course</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses && courses.length > 0 && enrollmentsData
                  ? Math.round(
                      Object.values(enrollmentsData).reduce((sum, students) => sum + students.length, 0) /
                      courses.length
                    )
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
