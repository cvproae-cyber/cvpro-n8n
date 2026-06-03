"use client";
import { useGetDashboardAnalytics } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data, isLoading } = useGetDashboardAnalytics();

  if (isLoading) return <div className="p-8 space-y-6"><Skeleton className="h-32 w-full" /></div>;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mission Control</h1>
        <p className="text-muted-foreground">CVPro.ae live operational metrics.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader><CardTitle>Total Contacts</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data?.totalContacts}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Open Conversations</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data?.totalConversations}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Revenue (AED)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data?.totalRevenue.toLocaleString()}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Conversion Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{((data?.conversionRate || 0) * 100).toFixed(1)}%</div></CardContent></Card>
      </div>
    </div>
  );
}
