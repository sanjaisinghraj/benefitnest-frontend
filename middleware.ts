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
            // Rewrite to portal route
            url.pathname = `/portal${url.pathname}`;
            url.searchParams.set('tenant', testSubdomain);
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
    // Rewrite to portal pages
    const pathname = url.pathname;
    
    // Already on portal route
    if (pathname.startsWith('/portal')) {
        return NextResponse.next();
    }
    
    // Skip API routes and static files
    if (pathname.startsWith('/api') || 
        pathname.startsWith('/_next') || 
        pathname.startsWith('/favicon') ||
        pathname.includes('.')) {
        return NextResponse.next();
    }
    
    // Rewrite to portal route with tenant info
    // kindmaster.benefitnest.space/ → /portal?tenant=kindmaster
    // kindmaster.benefitnest.space/dashboard → /portal/dashboard?tenant=kindmaster
    
    if (pathname === '/') {
        url.pathname = '/portal';
    } else {
        url.pathname = `/portal${pathname}`;
    }
    
    // Pass tenant subdomain as search param (can also use headers/cookies)
    url.searchParams.set('tenant', subdomain);
    
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
