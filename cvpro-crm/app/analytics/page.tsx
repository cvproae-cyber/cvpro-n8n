"use client";

import { useState } from "react";
import { useGetDashboardAnalytics } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30d");
  const { data } = useGetDashboardAnalytics();

  // بيانات تجريبية للرسم البياني
  const chartData = [
    { date: "Mon", leads: 12, conversions: 5, revenue: 2500 },
    { date: "Tue", leads: 18, conversions: 7, revenue: 3800 },
    { date: "Wed", leads: 15, conversions: 6, revenue: 3100 },
    { date: "Thu", leads: 22, conversions: 9, revenue: 5200 },
    { date: "Fri", leads: 20, conversions: 8, revenue: 4800 },
  ];

  return (
    <div className="p-8 space-y-6 flex-1 overflow-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <Select value={period} onValueChange={setPeriod}><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="7d">Last 7 days</SelectItem><SelectItem value="30d">Last 30 days</SelectItem><SelectItem value="90d">Last 90 days</SelectItem></SelectContent></Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Revenue</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-primary">AED {data?.totalRevenue || 9400}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Conversion Rate</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{((data?.conversionRate || 0.4) * 100).toFixed(0)}%</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">AI Automation Rate</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-secondary">78%</div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle>Leads vs Conversions</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><LineChart data={chartData}><XAxis dataKey="date" /><YAxis /><Tooltip /><Line type="monotone" dataKey="leads" stroke="#3b82f6" /><Line type="monotone" dataKey="conversions" stroke="#10b981" /></LineChart></ResponsiveContainer></CardContent></Card>
        <Card><CardHeader><CardTitle>Revenue (AED)</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={chartData}><XAxis dataKey="date" /><YAxis /><Tooltip /><Bar dataKey="revenue" fill="#f59e0b" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></CardContent></Card>
      </div>
    </div>
  );
}
