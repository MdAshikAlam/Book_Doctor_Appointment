import { NextResponse } from 'next/server';

export default function middleware(request) {
  const { pathname } = request.nextUrl;
  console.log('Proxy Intercepting:', pathname);
  
  const token = request.cookies.get('accessToken')?.value;
  console.log('Token in Proxy:', token ? 'Found' : 'Missing');

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/'],
};


