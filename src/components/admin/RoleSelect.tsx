"use client";

import { updateUserRole } from "@/app/actions/admin";

interface RoleSelectProps {
    userId: string;
    currentRole: string;
}

export default function RoleSelect({ userId, currentRole }: RoleSelectProps) {
    return (
        <form action={async (formData) => {
            await updateUserRole(userId, formData.get("role") as string, formData);
        }}>
            <select
                name="role"
                defaultValue={currentRole}
                className="input py-1 text-xs w-32 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                onChange={(e) => e.target.form?.requestSubmit()}
            >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Admin</option>
            </select>
            <noscript>
                <button type="submit" className="ml-2 btn btn-xs btn-outline">Save</button>
            </noscript>
        </form>
    );
}
