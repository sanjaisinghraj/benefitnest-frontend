import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of reserved subdomains that should NOT be treated as tenant portals
const RESERVED_SUBDOMAINS = [
    'www',
    'admin',
    'api',
    'app',
    'dashboard',
    'mail',
    'staging',
    'dev',
    'test'
];

// Main domain (without subdomain)
const MAIN_DOMAIN = 'benefitnest.space';

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    const hostname = request.headers.get('host') || '';
    
    // Remove port if present (for local development)
    const hostWithoutPort = hostname.split(':')[0];
    
    // Check if it's localhost (development)
    if (hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1') {
        // In development, you can test with query param: ?subdomain=kindmaster
        const testSubdomain = url.searchParams.get('subdomain');
        if (testSubdomain && !RESERVED_SUBDOMAINS.includes(testSubdomain)) {
            // Rewrite to dynamic [subdomain] route - this is the correct page with all features
            url.pathname = `/${testSubdomain}${url.pathname === '/' ? '' : url.pathname}`;
            return NextResponse.rewrite(url);
        }
        return NextResponse.next();
    }
    
    // Extract subdomain
    // e.g., kindmaster.benefitnest.space → kindmaster
    let subdomain = '';
    
    if (hostWithoutPort.endsWith(MAIN_DOMAIN)) {
        const parts = hostWithoutPort.replace(`.${MAIN_DOMAIN}`, '').split('.');
        subdomain = parts[0];
    }
    
    // No subdomain or reserved subdomain - serve main site
    if (!subdomain || subdomain === MAIN_DOMAIN.split('.')[0] || RESERVED_SUBDOMAINS.includes(subdomain)) {
        return NextResponse.next();
    }
    
    // Valid tenant subdomain detected!
    const pathname = url.pathname;
    
    // Already on dynamic subdomain route - skip
    if (pathname.startsWith(`/${subdomain}`)) {
        return NextResponse.next();
    }
    
    // Skip API routes and static files
    if (pathname.startsWith('/api') || 
        pathname.startsWith('/_next') || 
        pathname.startsWith('/favicon') ||
        pathname.includes('.')) {
        return NextResponse.next();
    }
    
    // Rewrite to dynamic [subdomain] route (app/[subdomain]/page.tsx)
    // This is the correct page with all login toggle features
    // kind.benefitnest.space/ → /kind (maps to app/[subdomain]/page.tsx)
    // kind.benefitnest.space/dashboard → /kind/dashboard
    
    if (pathname === '/') {
        url.pathname = `/${subdomain}`;
    } else {
        url.pathname = `/${subdomain}${pathname}`;
    }
    
    // Add tenant to response headers for client-side access
    const response = NextResponse.rewrite(url);
    response.headers.set('x-tenant-subdomain', subdomain);
    
    return response;
}

// Configure which paths middleware runs on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/).*)',
    ],
};
