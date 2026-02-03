import PageTitle from "@/components/layout/PageTitle";
import prisma from "@/lib/prisma";
import { toggleUserStatus } from "@/app/actions/admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import RoleSelect from "@/components/admin/RoleSelect";

export default async function UserManagementPage() {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "admin") {
        redirect("/");
    }

    const users = await prisma.user.findMany({
        orderBy: { name: "asc" },
    });

    return (
        <>
            <PageTitle title="User Management" />
            <div className="p-4 md:p-6 flex-1 space-y-6 pb-20 md:pb-6">

                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 uppercase">
                                <tr>
                                    <th className="px-4 md:px-6 py-3">Name</th>
                                    <th className="px-4 md:px-6 py-3">Email</th>
                                    <th className="px-4 md:px-6 py-3">Role</th>
                                    <th className="px-4 md:px-6 py-3">Status</th>
                                    <th className="px-4 md:px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 md:px-6 py-4 font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {user.name?.[0] || "U"}
                                                </div>
                                                {user.name}
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-4">{user.email}</td>
                                        <td className="px-4 md:px-6 py-4">
                                            <RoleSelect userId={user.id} currentRole={user.role} />
                                        </td>
                                        <td className="px-4 md:px-6 py-4">
                                            {user.active ? (
                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 md:px-6 py-4">
                                            <form action={toggleUserStatus.bind(null, user.id, user.active)}>
                                                <button
                                                    type="submit"
                                                    className={`text-xs font-medium hover:underline ${user.active ? "text-red-600" : "text-green-600"}`}
                                                >
                                                    {user.active ? "Deactivate" : "Activate"}
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
