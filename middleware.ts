import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // 可以在这里添加自定义逻辑
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/auth/login',
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/generate/:path*',
    '/api/blogs/:path*',
    '/api/seo/:path*',
    '/api/stats/:path*',
  ],
};