import { NextRequest, NextResponse } from 'next/server';

const CANVAS_API_URL = process.env.NEXT_PUBLIC_CANVAS_API_URL || 'http://canvas.docker';
const CANVAS_API_KEY = process.env.CANVAS_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    console.log('[Login API] Login attempt:', { email });

    if (!email) {
      console.log('[Login API] Missing email');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Search for user in Canvas by email (pseudonym/login_id)
    // Canvas API: GET /api/v1/accounts/:account_id/users?search_term=email
    const accountId = '1'; // Default account ID
    const searchUrl = `${CANVAS_API_URL}/api/v1/accounts/${accountId}/users?search_term=${encodeURIComponent(email)}`;

    console.log('[Login API] Searching Canvas for user:', { searchUrl });

    const response = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${CANVAS_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('[Login API] Canvas search response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Login API] Canvas search failed:', {
        status: response.status,
        error: errorText,
      });
      return NextResponse.json(
        { error: 'Failed to search user in Canvas', details: errorText },
        { status: response.status }
      );
    }

    const users = await response.json();
    console.log('[Login API] Canvas users response:', {
      isArray: Array.isArray(users),
      count: Array.isArray(users) ? users.length : 'N/A',
      users: users,
    });
    
    // Find user with matching email
    const user = Array.isArray(users) 
      ? users.find((u: any) => 
          u.login_id === email || 
          u.email === email ||
          u.pseudonyms?.some((p: any) => p.unique_id === email)
        )
      : null;

    console.log('[Login API] Found user:', { user, email });

    if (!user) {
      console.log('[Login API] User not found for email:', email);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user enrollments to determine role
    const enrollmentsUrl = `${CANVAS_API_URL}/api/v1/users/${user.id}/enrollments`;
    console.log('[Login API] Fetching enrollments:', { enrollmentsUrl });
    
    const enrollmentsResponse = await fetch(enrollmentsUrl, {
      headers: {
        'Authorization': `Bearer ${CANVAS_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('[Login API] Enrollments response:', {
      status: enrollmentsResponse.status,
      ok: enrollmentsResponse.ok,
    });

    let role = 'student';
    if (enrollmentsResponse.ok) {
      const enrollments = await enrollmentsResponse.json();
      console.log('[Login API] Enrollments data:', {
        isArray: Array.isArray(enrollments),
        count: Array.isArray(enrollments) ? enrollments.length : 'N/A',
        enrollments: enrollments,
      });
      
      if (Array.isArray(enrollments) && enrollments.length > 0) {
        const teacherEnrollment = enrollments.find((e: any) => 
          e.type === 'TeacherEnrollment' || e.type === 'TaEnrollment'
        );
        const observerEnrollment = enrollments.find((e: any) => 
          e.type === 'ObserverEnrollment'
        );
        
        if (teacherEnrollment) {
          role = 'teacher';
          console.log('[Login API] User is a teacher');
        } else if (observerEnrollment) {
          role = 'advisor';
          console.log('[Login API] User is an advisor');
        } else {
          console.log('[Login API] User is a student');
        }
      }
    }

    const result = {
      success: true,
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email || email,
        role,
      },
    };

    console.log('[Login API] Login successful:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[Login API] Exception:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

