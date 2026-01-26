import { updateSession } from "@/lib/supabase/middleware"
import { NextRequest, NextResponse } from "next/server"

/**
 * CORS headers for Chrome extension
 */
function getCorsHeaders(origin: string | null) {
  // Allow Chrome extension origins and localhost for development
  const allowedOrigins = [
    "chrome-extension://",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ]
  
  const isAllowed = origin && allowedOrigins.some(allowed => origin.startsWith(allowed))
  
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  }
}

export async function middleware(request: NextRequest) {
  const origin = request.headers.get("origin")
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/")
  
  // Handle CORS preflight requests for API routes
  if (isApiRoute && request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    })
  }
  
  // Process the request normally
  const response = await updateSession(request)
  
  // Add CORS headers to API responses
  if (isApiRoute && origin) {
    const corsHeaders = getCorsHeaders(origin)
    Object.entries(corsHeaders).forEach(([key, value]) => {
      if (value) {
        response.headers.set(key, value)
      }
    })
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - API routes that don't need auth
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
