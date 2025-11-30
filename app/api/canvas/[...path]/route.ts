import { NextRequest, NextResponse } from 'next/server';

const CANVAS_API_URL = process.env.NEXT_PUBLIC_CANVAS_API_URL || 'http://canvas.docker';
const CANVAS_API_KEY = process.env.CANVAS_API_KEY || '';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const searchParams = request.nextUrl.searchParams;
    
    const url = new URL(`/api/v1/${path}`, CANVAS_API_URL);
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });
    
    console.log('[API Proxy] GET request:', {
      path: `/api/v1/${path}`,
      fullUrl: url.toString(),
      params: Object.fromEntries(searchParams),
    });
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${CANVAS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    console.log('[API Proxy] Response status:', {
      path: `/api/v1/${path}`,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API Proxy] Error response:', {
        path: `/api/v1/${path}`,
        status: response.status,
        error: errorText,
      });
      return NextResponse.json(
        { error: `Canvas API error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('[API Proxy] Success response:', {
      path: `/api/v1/${path}`,
      dataType: Array.isArray(data) ? 'array' : typeof data,
      dataLength: Array.isArray(data) ? data.length : 'N/A',
      data: data,
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Proxy] Exception:', {
      path: params.path.join('/'),
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to fetch from Canvas API', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const body = await request.json();
    
    const url = new URL(`/api/v1/${path}`, CANVAS_API_URL);
    
    console.log('[API Proxy] POST request:', {
      path: `/api/v1/${path}`,
      fullUrl: url.toString(),
      body: body,
    });
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CANVAS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    console.log('[API Proxy] POST response status:', {
      path: `/api/v1/${path}`,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API Proxy] POST error response:', {
        path: `/api/v1/${path}`,
        status: response.status,
        error: errorText,
      });
      return NextResponse.json(
        { error: `Canvas API error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('[API Proxy] POST success response:', {
      path: `/api/v1/${path}`,
      dataType: Array.isArray(data) ? 'array' : typeof data,
      dataLength: Array.isArray(data) ? data.length : 'N/A',
      data: data,
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Proxy] POST exception:', {
      path: params.path.join('/'),
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to post to Canvas API', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

