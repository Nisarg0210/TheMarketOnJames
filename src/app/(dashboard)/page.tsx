import PageTitle from "@/components/layout/PageTitle";
import prisma from "@/lib/prisma";
import { addDays, startOfDay, isBefore, isAfter } from "date-fns";
import { Package, AlertTriangle, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const now = startOfDay(new Date());
  const tomorrow = addDays(now, 1);
  const in20Days = addDays(now, 20);

  // Get expiry metrics
  const [expiringIn20Days, expiringTomorrow, expired, totalBatches] = await Promise.all([
    prisma.inventoryBatch.count({
      where: {
        expiryDate: {
          gte: tomorrow,
          lte: in20Days,
        },
        qty: { gt: 0 },
      },
    }),
    prisma.inventoryBatch.count({
      where: {
        expiryDate: {
          gte: now,
          lt: tomorrow,
        },
        qty: { gt: 0 },
      },
    }),
    prisma.inventoryBatch.count({
      where: {
        expiryDate: { lt: now },
        qty: { gt: 0 },
      },
    }),
    prisma.inventoryBatch.count({
      where: { qty: { gt: 0 } },
    }),
  ]);

  // Get upcoming schedules
  const upcomingSchedules = await prisma.schedule.findMany({
    where: {
      weekStartDate: { gte: now },
      status: "published",
    },
    orderBy: { weekStartDate: "asc" },
    take: 3,
    include: {
      _count: { select: { shifts: true } },
    },
  });

  const stats = [
    {
      label: "Expiring in 20 Days",
      value: expiringIn20Days,
      color: "yellow",
      icon: AlertTriangle,
      href: "/inventory/expiry",
    },
    {
      label: "Expiring Tomorrow",
      value: expiringTomorrow,
      color: "orange",
      icon: AlertTriangle,
      href: "/inventory/expiry",
    },
    {
      label: "Expired Items",
      value: expired,
      color: "red",
      icon: AlertTriangle,
      href: "/inventory/expiry",
    },
    {
      label: "Total Active Batches",
      value: totalBatches,
      color: "blue",
      icon: Package,
      href: "/inventory",
    },
  ];

  return (
    <>
      <PageTitle title="Dashboard" />
      <div className="p-4 md:p-6 flex-1 space-y-6 pb-20 md:pb-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const colorClasses = {
              yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
              orange: "bg-orange-50 text-orange-600 border-orange-100",
              red: "bg-red-50 text-red-600 border-red-100",
              blue: "bg-blue-50 text-blue-600 border-blue-100",
            };

            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="card p-6 space-y-3 hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {stat.label}
                  </h3>
                  <div className={`p-2 rounded-xl border ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <p className={`text-3xl font-black ${stat.color === 'blue' ? 'text-primary' : `text-${stat.color}-600`} group-hover:scale-110 transition-transform origin-left`}>
                  {stat.value}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Upcoming Schedules */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Upcoming Schedules</h2>
            </div>
            <Link href="/schedule" className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">
              View All
            </Link>
          </div>

          {upcomingSchedules.length > 0 ? (
            <div className="space-y-3">
              {upcomingSchedules.map((schedule) => (
                <Link
                  key={schedule.id}
                  href={`/schedule/${schedule.id}`}
                  className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-primary/5 rounded-xl border border-gray-100 hover:border-primary/20 transition-all group"
                >
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                      Week of {new Date(schedule.weekStartDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {schedule._count.shifts} shifts assigned
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-100">
                      Published
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No upcoming published schedules</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/inventory/intake"
            className="card p-6 hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Add Inventory</h3>
                <p className="text-xs text-gray-500 mt-0.5">Record new stock</p>
              </div>
            </div>
          </Link>

          <Link
            href="/schedule"
            className="card p-6 hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">View Schedules</h3>
                <p className="text-xs text-gray-500 mt-0.5">Manage staff shifts</p>
              </div>
            </div>
          </Link>

          <Link
            href="/inventory/analytics"
            className="card p-6 hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">View Analytics</h3>
                <p className="text-xs text-gray-500 mt-0.5">Track performance</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
