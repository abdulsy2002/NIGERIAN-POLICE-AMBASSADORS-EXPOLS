import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. PUBLIC ROUTES: Anyone on the internet can see these
const publicRoutes = [
  '/',
  '/about',
  '/contact',
  '/gallery',
  '/validate',
  '/reunion',
  '/faqs',
  '/login',
  '/register',
  '/ambassador',
  '/forgot-password',
  '/reset-password',
  '/privacy-policy',
  '/admin/login',
  '/admin/setup',
  '/leadership',
];

function decodeJwt(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // Base64Url decode helper for Edge runtime
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 2. Allow Public Routes
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 3. ADMIN ROUTES: Require Admin Session (JWT Token)
  if (pathname.startsWith('/admin')) {
    const adminSession = request.cookies.get('admin_session');
    
    if (!adminSession) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Decode JWT token instead of raw JSON
      const sessionData = decodeJwt(adminSession.value);
      
      if (!sessionData || !sessionData.userId || !sessionData.role) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      // Force password change redirect for new admins
      if (sessionData.mustChangePassword && pathname !== '/admin/change-password') {
        return NextResponse.redirect(new URL('/admin/change-password', request.url));
      }

      // Prevent logged-in admins from accessing login page
      if (pathname === '/admin/login') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }

      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 4. USER ROUTES: Require User Session (JWT Token)
  const userSession = request.cookies.get('user_session');
  
  if (!userSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const sessionData = decodeJwt(userSession.value);
    if (!sessionData) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Prevent logged-in users from accessing login/register pages
    if (pathname === '/login' || pathname === '/register') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } catch {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};