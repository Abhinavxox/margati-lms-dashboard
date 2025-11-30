'use client';

import { useState, useEffect } from 'react';
import { getSession } from '@/lib/auth/session';
import { useQuery } from '@tanstack/react-query';
import { CanvasAPI } from '@/lib/canvas/api';
import type { CanvasCourse, CanvasEnrollment } from '@/types/canvas';
import { ChevronDown, ChevronUp, Users, BookOpen, TrendingUp } from 'lucide-react';

const canvasAPI = new CanvasAPI();

export default function TeacherDashboard() {
  const [session, setSession] = useState<any>(null);
  const [userId, setUserId] = useState<string>('1');
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());

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
      // Get all courses (without enrollment_type filter) to include teacher enrollments
      const allCourses = await canvasAPI.getUserCourses(userId); // No enrollment_type filter
      console.log('[Teacher Dashboard] All courses for user:', { userId, count: allCourses.length, courses: allCourses });
      
      // Filter courses where user is teacher
      const teacherCourses = [];
      for (const course of allCourses) {
        try {
          const enrollments = await canvasAPI.getCourseEnrollments(course.id.toString());
          const isTeacher = enrollments.some(
            (e: CanvasEnrollment) => 
              e.user_id.toString() === userId && 
              (e.type === 'TeacherEnrollment' || e.type === 'TaEnrollment')
          );
          if (isTeacher) {
            teacherCourses.push(course);
          }
        } catch (error) {
          console.error(`[Teacher Dashboard] Failed to get enrollments for course ${course.id}:`, error);
        }
      }
      console.log('[Teacher Dashboard] Teacher courses:', { userId, count: teacherCourses.length, courses: teacherCourses });
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

  const toggleCourseExpansion = (courseId: string) => {
    setExpandedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const toggleStudentsExpansion = (courseId: string) => {
    setExpandedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const totalStudents = enrollmentsData 
    ? Object.values(enrollmentsData).reduce((sum, students) => sum + students.length, 0)
    : 0;

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your courses and students</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Courses */}
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                My Courses
              </h2>
              <span className="text-sm text-gray-500">{courses?.length || 0} courses</span>
            </div>
            <div className="space-y-3">
              {courses && courses.length > 0 ? (
                courses.map((course) => {
                  const studentCount = enrollmentsData?.[course.id]?.length || 0;
                  const isExpanded = expandedCourses.has(course.id.toString());
                  
                  return (
                    <div 
                      key={course.id} 
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => toggleCourseExpansion(course.id.toString())}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-lg">{course.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{course.course_code}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStudentsExpansion(course.id.toString());
                              }}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                              <Users className="w-4 h-4" />
                              {studentCount} student{studentCount !== 1 ? 's' : ''} enrolled
                            </button>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Course Details</p>
                            {course.start_at && (
                              <p className="text-sm text-gray-600">
                                Start: {new Date(course.start_at).toLocaleDateString()}
                              </p>
                            )}
                            {course.end_at && (
                              <p className="text-sm text-gray-600">
                                End: {new Date(course.end_at).toLocaleDateString()}
                              </p>
                            )}
                            {course.workflow_state && (
                              <p className="text-sm text-gray-600">
                                Status: <span className="capitalize">{course.workflow_state}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No courses found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Students in My Classes */}
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Students in My Classes
              </h2>
            </div>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {courses && courses.length > 0 ? (
                courses.map((course) => {
                  const students = enrollmentsData?.[course.id] || [];
                  const isExpanded = expandedStudents.has(course.id.toString());
                  const showCount = 5;
                  const displayStudents = isExpanded ? students : students.slice(0, showCount);
                  const remainingCount = students.length - showCount;
                  
                  return (
                    <div key={course.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{course.name}</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {students.length} student{students.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="space-y-1.5 mt-2">
                        {displayStudents.length > 0 ? (
                          <>
                            {displayStudents.map((enrollment: CanvasEnrollment) => (
                              <div 
                                key={enrollment.id} 
                                className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded hover:bg-gray-100 transition-colors"
                              >
                                <span className="font-medium">Student ID:</span> {enrollment.user_id}
                                {enrollment.workflow_state && (
                                  <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                                    enrollment.workflow_state === 'active' 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {enrollment.workflow_state}
                                  </span>
                                )}
                              </div>
                            ))}
                            {!isExpanded && remainingCount > 0 && (
                              <button
                                onClick={() => toggleStudentsExpansion(course.id.toString())}
                                className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2 hover:bg-blue-50 rounded transition-colors flex items-center justify-center gap-1"
                              >
                                <ChevronDown className="w-4 h-4" />
                                Show {remainingCount} more student{remainingCount !== 1 ? 's' : ''}
                              </button>
                            )}
                            {isExpanded && remainingCount > 0 && (
                              <button
                                onClick={() => toggleStudentsExpansion(course.id.toString())}
                                className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2 hover:bg-blue-50 rounded transition-colors flex items-center justify-center gap-1"
                              >
                                <ChevronUp className="w-4 h-4" />
                                Show less
                              </button>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No students enrolled</p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No courses to display</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Quick Stats
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
              <p className="text-sm text-gray-600 mb-1">Total Courses</p>
              <p className="text-3xl font-bold text-blue-600">{courses?.length || 0}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
              <p className="text-sm text-gray-600 mb-1">Total Students</p>
              <p className="text-3xl font-bold text-green-600">{totalStudents}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
              <p className="text-sm text-gray-600 mb-1">Average per Course</p>
              <p className="text-3xl font-bold text-purple-600">
                {courses && courses.length > 0 && totalStudents > 0
                  ? Math.round(totalStudents / courses.length)
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
