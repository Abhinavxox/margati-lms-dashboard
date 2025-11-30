'use client';

import { useState, useEffect } from 'react';
import { getSession } from '@/lib/auth/session';
import { useQuery } from '@tanstack/react-query';
import { CanvasAPI } from '@/lib/canvas/api';
import type { CanvasCourse, CanvasEnrollment } from '@/types/canvas';

const canvasAPI = new CanvasAPI();

export default function AdvisorDashboard() {
  const [session, setSession] = useState<any>(null);
  const [userId, setUserId] = useState<string>('1');

  useEffect(() => {
    // Only access localStorage on client side
    const userSession = getSession();
    setSession(userSession);
    setUserId(userSession?.userId || '1');
  }, []);

  // Get all courses to find students
  const { data: allCourses, isLoading: coursesLoading } = useQuery<CanvasCourse[]>({
    queryKey: ['all-courses'],
    queryFn: async () => {
      // Get courses - advisors can see all courses
      // In a real implementation, you'd filter by advisor's assigned students
      return [];
    },
    enabled: false, // For now, we'll show a simplified view
  });

  // Get students (simplified - in production, filter by advisor assignments)
  const { data: studentsData } = useQuery({
    queryKey: ['advisor-students'],
    queryFn: async () => {
      // In production, this would get students assigned to this advisor
      // For now, return empty array
      return [];
    },
    enabled: false,
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Advisor Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Roster */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Student Roster</h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                View all students assigned to you. Click on a student to see their academic progress.
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  Student roster will be displayed here. In production, this would show students assigned to this advisor.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Progress */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Academic Progress Overview</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  Track student academic performance across all courses. Monitor GPA trends, course completion rates, and identify at-risk students.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Alerts */}
      <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Risk Alerts</h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Students who may need additional support based on their academic performance.
            </p>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                Risk alerts will be displayed here. This would show students with low grades, missing assignments, or other academic concerns.
              </p>
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
              <p className="text-sm text-gray-600">Assigned Students</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">At-Risk Students</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average GPA</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
