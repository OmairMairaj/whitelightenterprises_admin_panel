import { NextResponse } from 'next/server';
import { apiEndpoint } from '@/app/config';

export async function middleware(request) {
  const cookies = request.cookies;
  const token = cookies.get('token');

  const authUrl = `${apiEndpoint}/admin/check-auth`;
  const loginUrl = new URL('/auth/signin', request.url);

  if (token && authUrl) {
    try {
      const apiResponse = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.value}`,
        },
      });

      if (!apiResponse.ok) {
        console.error('API responded with a non-OK status:', apiResponse.status);
        throw new Error(`API responded with status: ${apiResponse.status}`);
      }

      const result = await apiResponse.json();
    

      if (result.status === true) {
        const { userData } = result;

        if (userData) {
          const response = NextResponse.next();
          response.cookies.set('userData', JSON.stringify(userData), {
            httpOnly: false,
            path: '/',
            sameSite: 'lax',
          });
          return response;
        }

        return NextResponse.next(); // Proceed without setting userData if not present
      }
    } catch (error) {
      console.error('API request error:', error);
    }
  }

  // Redirect to the login page if no token or API error
  loginUrl.searchParams.set('redirect', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
