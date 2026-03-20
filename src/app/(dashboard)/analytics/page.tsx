"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, Spinner } from "@/components/ui";
import { TrendingUp, TrendingDown, Package, ShoppingCart, DollarSign, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: analyticsApi.getDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(analytics?.data?.totalRevenue || 0),
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Total Orders",
      value: analytics?.data?.totalOrders || 0,
      icon: ShoppingCart,
      color: "text-blue-500",
    },
    {
      title: "Total Drops",
      value: analytics?.data?.totalDrops || 0,
      icon: Package,
      color: "text-purple-500",
    },
    {
      title: "Conversion Rate",
      value: `${((analytics?.data?.conversionRate || 0) * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Track your store performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Drops</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.data?.topDrops?.length > 0 ? (
              <div className="space-y-4">
                {analytics.data.topDrops.map((drop: any, index: number) => (
                  <div key={drop.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{drop.title}</p>
                        <p className="text-sm text-muted-foreground">{drop.orders} orders</p>
                      </div>
                    </div>
                    <p className="font-medium">{formatCurrency(drop.revenue)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.data?.recentOrders?.length > 0 ? (
              <div className="space-y-4">
                {analytics.data.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{order.buyerName}</p>
                      <p className="text-sm text-muted-foreground">New order</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.total)}</p>
                      <p className="text-sm text-muted-foreground">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
