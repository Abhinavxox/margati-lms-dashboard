'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUserCourses, useUpcomingEvents, useUserSubmissions } from '@/lib/hooks/useCanvasData';
import { getSession } from '@/lib/auth/session';
import { ChevronDown, ChevronUp, BookOpen, Calendar, TrendingUp, Clock, Award, CheckCircle, XCircle, FileText, AlertCircle } from 'lucide-react';
import type { CanvasCourse, CanvasSubmission, CanvasAssignment } from '@/types/canvas';

export default function StudentDashboard() {
  const [session, setSession] = useState<any>(null);
  const [userId, setUserId] = useState<string>('1');
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandedAssignments, setExpandedAssignments] = useState(false);
  const [expandedSubmissions, setExpandedSubmissions] = useState(false);
  const [selectedStat, setSelectedStat] = useState<'courses' | 'assignments' | 'submissions' | null>(null);

  useEffect(() => {
    // Only access localStorage on client side
    const userSession = getSession();
    setSession(userSession);
    setUserId(userSession?.userId || '1');
  }, []);
  
  const { data: courses, isLoading: coursesLoading } = useUserCourses(userId, 'student');
  const { data: events, isLoading: eventsLoading } = useUpcomingEvents(userId);
  const { data: submissions, isLoading: submissionsLoading } = useUserSubmissions(userId);

  // Calculate statistics
  const stats = useMemo(() => {
    const submitted = submissions?.filter(s => s.workflow_state === 'graded' || s.workflow_state === 'submitted') || [];
    const graded = submissions?.filter(s => s.workflow_state === 'graded') || [];
    const pending = events?.filter((a: any) => {
      const submission = submissions?.find(s => s.assignment_id === a.id);
      return !submission || submission.workflow_state === 'unsubmitted';
    }) || [];
    const missing = events?.filter((a: any) => {
      if (!a.due_at) return false;
      const dueDate = new Date(a.due_at);
      const now = new Date();
      if (dueDate < now) {
        const submission = submissions?.find(s => s.assignment_id === a.id);
        return !submission || submission.workflow_state === 'unsubmitted';
      }
      return false;
    }) || [];

    // Calculate average grade
    const gradedSubmissions = submissions?.filter(s => s.score !== null && s.score !== undefined) || [];
    const avgGrade = gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / gradedSubmissions.length
      : 0;

    return {
      submitted: submitted.length,
      graded: graded.length,
      pending: pending.length,
      missing: missing.length,
      avgGrade: avgGrade.toFixed(1),
    };
  }, [submissions, events]);

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

  const toggleAssignmentsExpansion = () => {
    setExpandedAssignments(prev => !prev);
  };

  const toggleSubmissionsExpansion = () => {
    setExpandedSubmissions(prev => !prev);
  };

  const handleStatClick = (stat: 'courses' | 'assignments' | 'submissions') => {
    setSelectedStat(selectedStat === stat ? null : stat);
  };

  if (coursesLoading || eventsLoading || submissionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const showCount = 5;
  const displayAssignments = expandedAssignments ? events : (events?.slice(0, showCount) || []);
  const remainingAssignments = events ? Math.max(0, events.length - showCount) : 0;
  
  const sortedSubmissions = submissions?.sort((a, b) => {
    const dateA = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
    const dateB = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
    return dateB - dateA;
  }) || [];
  const displaySubmissions = expandedSubmissions ? sortedSubmissions : sortedSubmissions.slice(0, showCount);
  const remainingSubmissions = Math.max(0, sortedSubmissions.length - showCount);

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600 mt-1">View your courses, assignments, and grades</p>
      </div>
      
      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => handleStatClick('courses')}
          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow text-left"
        >
          <p className="text-sm text-gray-600 mb-1">Active Courses</p>
          <p className="text-2xl font-bold text-blue-600">{courses?.length || 0}</p>
        </button>
        <button
          onClick={() => handleStatClick('submissions')}
          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow text-left"
        >
          <p className="text-sm text-gray-600 mb-1">Submitted</p>
          <p className="text-2xl font-bold text-green-600">{stats.submitted}</p>
        </button>
        <button
          onClick={() => handleStatClick('assignments')}
          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow text-left"
        >
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
        </button>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-1">Avg Grade</p>
          <p className="text-2xl font-bold text-purple-600">{stats.avgGrade}%</p>
        </div>
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
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {courses && courses.length > 0 ? (
                courses.map((course: CanvasCourse) => {
                  const isExpanded = expandedCourses.has(course.id.toString());
                  const courseSubmissions = submissions?.filter(s => s.course?.id === course.id) || [];
                  const courseGrade = course.total_scores?.current_score || course.total_scores?.final_score;
                  
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
                          {courseGrade && (
                            <p className="text-sm font-medium text-green-600 mt-1">
                              Grade: {courseGrade.toFixed(1)}%
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {courseSubmissions.length} submission{courseSubmissions.length !== 1 ? 's' : ''}
                          </p>
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
                            {course.total_scores && (
                              <div className="mt-2 pt-2 border-t">
                                <p className="text-sm font-medium text-gray-700">Grades</p>
                                {course.total_scores.current_score !== null && (
                                  <p className="text-sm text-gray-600">
                                    Current: {course.total_scores.current_score.toFixed(1)}%
                                  </p>
                                )}
                                {course.total_scores.final_score !== null && (
                                  <p className="text-sm text-gray-600">
                                    Final: {course.total_scores.final_score.toFixed(1)}%
                                  </p>
                                )}
                              </div>
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

        {/* My Submissions */}
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                My Submissions
              </h2>
              {submissions && submissions.length > 0 && (
                <span className="text-sm text-gray-500">{submissions.length} total</span>
              )}
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {submissions && submissions.length > 0 ? (
                <>
                  {displaySubmissions.map((submission: CanvasSubmission & { assignment?: CanvasAssignment; course?: CanvasCourse }) => {
                    const isGraded = submission.workflow_state === 'graded';
                    const isSubmitted = submission.workflow_state === 'submitted' || isGraded;
                    const score = submission.score;
                    const pointsPossible = submission.assignment?.points_possible;
                    const percentage = pointsPossible && score !== null && score !== undefined
                      ? ((score / pointsPossible) * 100).toFixed(1)
                      : null;
                    
                    return (
                      <div 
                        key={submission.id} 
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 text-sm">
                              {submission.assignment?.name || `Assignment ${submission.assignment_id}`}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">
                              {submission.course?.name || submission.course?.course_code || 'Unknown Course'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isGraded ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : isSubmitted ? (
                              <Clock className="w-4 h-4 text-blue-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          {submission.submitted_at && (
                            <div className="flex items-center gap-1 text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>Submitted: {new Date(submission.submitted_at).toLocaleDateString()}</span>
                            </div>
                          )}
                          {isGraded && score !== null && score !== undefined && (
                            <div className="flex items-center gap-1">
                              <Award className="w-3 h-3 text-green-600" />
                              <span className="font-medium text-green-600">
                                {score}{pointsPossible ? `/${pointsPossible}` : ''} 
                                {percentage ? ` (${percentage}%)` : ''}
                              </span>
                            </div>
                          )}
                          {submission.grade && (
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              isGraded ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {submission.grade}
                            </span>
                          )}
                        </div>
                        <div className="mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            submission.workflow_state === 'graded' 
                              ? 'bg-green-100 text-green-700'
                              : submission.workflow_state === 'submitted'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {submission.workflow_state}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {!expandedSubmissions && remainingSubmissions > 0 && (
                    <button
                      onClick={toggleSubmissionsExpansion}
                      className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2 hover:bg-blue-50 rounded transition-colors flex items-center justify-center gap-1"
                    >
                      <ChevronDown className="w-4 h-4" />
                      Show {remainingSubmissions} more submission{remainingSubmissions !== 1 ? 's' : ''}
                    </button>
                  )}
                  {expandedSubmissions && remainingSubmissions > 0 && (
                    <button
                      onClick={toggleSubmissionsExpansion}
                      className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2 hover:bg-blue-50 rounded transition-colors flex items-center justify-center gap-1"
                    >
                      <ChevronUp className="w-4 h-4" />
                      Show less
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No submissions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Assignments and Missing Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Upcoming Assignments */}
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                Upcoming Assignments
              </h2>
              {events && events.length > 0 && (
                <span className="text-sm text-gray-500">{events.length} total</span>
              )}
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {events && events.length > 0 ? (
                <>
                  {displayAssignments.map((assignment: any) => {
                    const submission = submissions?.find(s => s.assignment_id === assignment.id);
                    const isSubmitted = submission && (submission.workflow_state === 'submitted' || submission.workflow_state === 'graded');
                    
                    return (
                      <div 
                        key={assignment.id} 
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 text-sm">{assignment.name}</h3>
                            <p className="text-xs text-gray-600 mt-1">{assignment.course_name}</p>
                          </div>
                          {isSubmitted && (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {assignment.due_at ? (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Due: {new Date(assignment.due_at).toLocaleDateString()}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">No due date</span>
                          )}
                          {assignment.points_possible && (
                            <div className="flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              <span>{assignment.points_possible} points</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {!expandedAssignments && remainingAssignments > 0 && (
                    <button
                      onClick={toggleAssignmentsExpansion}
                      className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2 hover:bg-blue-50 rounded transition-colors flex items-center justify-center gap-1"
                    >
                      <ChevronDown className="w-4 h-4" />
                      Show {remainingAssignments} more assignment{remainingAssignments !== 1 ? 's' : ''}
                    </button>
                  )}
                  {expandedAssignments && remainingAssignments > 0 && (
                    <button
                      onClick={toggleAssignmentsExpansion}
                      className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2 hover:bg-blue-50 rounded transition-colors flex items-center justify-center gap-1"
                    >
                      <ChevronUp className="w-4 h-4" />
                      Show less
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No upcoming assignments</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Missing Assignments */}
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Missing Assignments
              </h2>
              <span className="text-sm text-gray-500">{stats.missing} missing</span>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {events && events.length > 0 ? (
                (() => {
                  const missing = events.filter((a: any) => {
                    if (!a.due_at) return false;
                    const dueDate = new Date(a.due_at);
                    const now = new Date();
                    if (dueDate < now) {
                      const submission = submissions?.find(s => s.assignment_id === a.id);
                      return !submission || submission.workflow_state === 'unsubmitted';
                    }
                    return false;
                  });

                  return missing.length > 0 ? (
                    missing.map((assignment: any) => (
                      <div 
                        key={assignment.id} 
                        className="border border-red-200 rounded-lg p-4 bg-red-50 hover:bg-red-100 transition-colors"
                      >
                        <h3 className="font-medium text-gray-900 text-sm">{assignment.name}</h3>
                        <p className="text-xs text-gray-600 mt-1">{assignment.course_name}</p>
                        <div className="flex items-center gap-3 text-xs text-red-600 mt-2">
                          <Clock className="w-3 h-3" />
                          <span>Due: {new Date(assignment.due_at).toLocaleDateString()}</span>
                          {assignment.points_possible && (
                            <>
                              <span>•</span>
                              <span>{assignment.points_possible} points</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                      <p>No missing assignments!</p>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No assignments found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
