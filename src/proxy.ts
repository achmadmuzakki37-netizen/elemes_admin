import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export default async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    // Do not run on API routes, internal Next.js paths, or favicon
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname === '/favicon.ico' ||
        pathname.includes('.') // Catch all file extensions just in case
    ) {
        return supabaseResponse
    }

    // Define public routes that don't require authentication
    const isPublicRoute = pathname === '/login' || pathname.startsWith('/login')

    // 1. If user is NOT logged in and trying to access a protected route
    if (!user && !isPublicRoute) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/login'
        return NextResponse.redirect(redirectUrl)
    }

    // 2. If user IS logged in and trying to access root ("/") or login page
    if (user && (pathname === '/' || isPublicRoute)) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/dashboard'
        return NextResponse.redirect(redirectUrl)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api (API routes)
         * - all files with extensions (e.g. svg, jpg, etc)
         */
        '/((?!_next/static|_next/image|favicon.ico|api|.*\\.[\\w]+$).*)',
    ],
}
