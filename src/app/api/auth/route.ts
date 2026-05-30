import { NextResponse } from 'next/server';
import { verifyPassword, getSessionSignature } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Missing password in request body.' },
        { status: 400 }
      );
    }

    // Verify correct password using configured credentials
    const isMatched = verifyPassword(password);
    if (!isMatched) {
      return NextResponse.json(
        { error: 'Access Denied: Invalid terminal password.' },
        { status: 401 }
      );
    }

    // Generate secure cookie session signature using Web Crypto HMAC
    const sessionToken = await getSessionSignature();

    const response = NextResponse.json({ success: true, message: 'Authorization successful.' });

    // Set stable secure HTTP-Only session cookie
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days session lifespan
    });

    return response;
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Authentication route error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
