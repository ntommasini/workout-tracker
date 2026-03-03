import NextAuth from 'next-auth';
import authConfig from './auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
  const isApiRoute = req.nextUrl.pathname.startsWith('/api');

  if (isApiRoute) return;
  if (isAuthPage) {
    if (isLoggedIn) {
      return Response.redirect(new URL('/', req.url));
    }
    return;
  }

  if (!isLoggedIn) {
    return Response.redirect(new URL('/auth/signin', req.url));
  }
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
