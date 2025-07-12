import { NextResponse } from 'next/server';

export async function POST() {
  // Create response that will clear the cookie
  const response = NextResponse.json({ success: true });

  // Clear the auth cookie
  response.cookies.set('superadmin-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // This will cause the cookie to be deleted
  });

  return response;
}
