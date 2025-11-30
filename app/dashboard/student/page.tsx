'use client';

import { useState, useEffect } from 'react';
import { useUserCourses, useUpcomingEvents } from '@/lib/hooks/useCanvasData';
import { getSession } from '@/lib/auth/session';

export default function StudentDashboard() {
  const [session, setSession] = useState<any>(null);
  const [userId, setUserId] = useState<string>('1');

  useEffect(() => {
    // Only access localStorage on client side
    const userSession = getSession();
    setSession(userSession);
    setUserId(userSession?.userId || '1');
  }, []);
  
  const { data: courses, isLoading: coursesLoading } = useUserCourses(userId);
  const { data: events, isLoading: eventsLoading } = useUpcomingEvents(userId);

  if (coursesLoading || eventsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Student Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* My Courses */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">My Courses</h2>
            <div className="space-y-2">
              {courses && courses.length > 0 ? (
                courses.map((course) => (
                  <div key={course.id} className="border-b pb-2 last:border-0">
                    <h3 className="font-medium text-gray-900">{course.name}</h3>
                    <p className="text-sm text-gray-600">{course.course_code}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No courses found</p>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Assignments */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Assignments</h2>
            <div className="space-y-2">
              {events && events.length > 0 ? (
                events.slice(0, 5).map((assignment: any) => (
                  <div key={assignment.id} className="border-b pb-2 last:border-0">
                    <h3 className="font-medium text-gray-900">{assignment.name}</h3>
                    <p className="text-sm text-gray-600">{assignment.course_name}</p>
                    <p className="text-sm text-gray-500">
                      Due: {assignment.due_at ? new Date(assignment.due_at).toLocaleDateString() : 'No due date'}
                    </p>
                    {assignment.points_possible && (
                      <p className="text-xs text-gray-400">{assignment.points_possible} points</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No upcoming assignments</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900">{courses?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{events?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

