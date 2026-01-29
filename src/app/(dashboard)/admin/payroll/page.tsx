import Header from "@/components/layout/Header";
import PayrollTable from "@/components/admin/PayrollTable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PayrollPage() {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as any)?.role === "admin" || (session?.user as any)?.role === "manager";

    if (!isAdmin) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-12">
            <Header title="Payroll & Hours Report" showSearch={false} />
            <div className="p-6 flex-1">
                <PayrollTable />
            </div>
        </div>
    );
}
