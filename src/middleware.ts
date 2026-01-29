import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Admin-only routes
        const adminRoutes = ["/admin", "/inventory/categories", "/inventory/products"];
        // Manager+ routes
        const managerRoutes = ["/schedules/manage"];

        if (adminRoutes.some(route => path.startsWith(route)) && token?.role !== "admin" && token?.role !== "manager") {
            return NextResponse.redirect(new URL("/", req.url));
        }

        if (managerRoutes.some(route => path.startsWith(route)) && token?.role !== "admin" && token?.role !== "manager" && token?.role !== "supervisor") {
            return NextResponse.redirect(new URL("/", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth API routes)
         * - auth/signin (custom signin page)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api/auth|auth/signin|_next/static|_next/image|favicon.ico).*)",
    ],
};
