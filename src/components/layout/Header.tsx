import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import NotificationBell from "../notifications/NotificationBell";
import GlobalSearch from "@/components/layout/GlobalSearch";
import SignOutButton from "./SignOutButton";

export default async function Header({ title, showSearch = true }: { title?: string, showSearch?: boolean }) {
    const session = await getServerSession(authOptions);

    return (
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
            <div className="flex items-center gap-4 flex-1">
                <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap md:block pl-10 md:pl-0">{title}</h1>
                {showSearch && (
                    <div className="ml-4 w-full max-w-sm hidden lg:block">
                        <GlobalSearch />
                    </div>
                )}
            </div>
            <div className="flex items-center gap-4">
                {session?.user && <NotificationBell userId={(session.user as any).id} />}

                {session?.user && (
                    <div className="flex items-center gap-3 border-l pl-4">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-medium text-gray-900">{session.user.name}</span>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${(session.user as any).role === 'admin'
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                                }`}>
                                {(session.user as any).role || "Employee"}
                            </span>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                            {session.user.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <SignOutButton />
                    </div>
                )}
            </div>
        </header>
    );
}
