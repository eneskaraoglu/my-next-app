import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Success sayfasına erişmeye çalışıyorsa
  if (request.nextUrl.pathname.startsWith('/success')) {
    // Token'ı kontrol et
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      // Token yoksa login sayfasına yönlendir
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return NextResponse.next()
}

// Middleware'in hangi yollar için çalışacağını belirt
export const config = {
  matcher: '/success/:path*'
} 