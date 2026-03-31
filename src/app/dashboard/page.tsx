"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Spinner,
} from "@/components/ui";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order, Drop } from "@/types";

export default function DashboardPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => analyticsApi.getDashboard(),
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
      title: "Total Drops",
      value: analytics?.data?.summary?.totalDrops || 0,
      subtext: `${analytics?.data?.summary?.activeDrops || 0} live`,
      icon: Package,
      trend: null as "up" | "down" | null,
    },
    {
      title: "Total Orders",
      value: analytics?.data?.summary?.totalOrders || 0,
      subtext: "All time",
      icon: ShoppingCart,
      trend: null as "up" | "down" | null,
    },
    {
      title: "Revenue",
      value: formatCurrency(analytics?.data?.summary?.totalRevenue || 0),
      subtext: "All time",
      icon: DollarSign,
      trend: null as "up" | "down" | null,
    },
    {
      title: "Visitors",
      value: analytics?.data?.summary?.totalVisitors || 0,
      subtext: `${((analytics?.data?.summary?.conversionRate || 0) * 100).toFixed(1)}% conversion`,
      icon: Users,
      trend:
        (analytics?.data?.summary?.conversionRate || 0) > 0
          ? ("up" as const)
          : ("down" as const),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your store.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {stat.subtext}
                {stat.trend &&
                  (stat.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  ))}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Orders
              <Link
                href="/orders"
                className="text-sm font-normal text-primary hover:underline"
              >
                View all
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.data?.recentOrders &&
            analytics.data.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {analytics.data.recentOrders.slice(0, 5).map((order: Order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{order.buyerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(order.total)}
                      </p>
                      <Badge
                        variant={
                          order.status === "CONFIRMED" ? "success" : "warning"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No orders yet
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Top Drops
              <Link
                href="/drops"
                className="text-sm font-normal text-primary hover:underline"
              >
                View all
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.data?.topDrops && analytics.data.topDrops.length > 0 ? (
              <div className="space-y-4">
                {analytics.data.topDrops.slice(0, 5).map((drop) => (
                  <div
                    key={drop.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{drop.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {drop.orders} orders
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(drop.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No drops yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/20 p-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Conversion Rate</p>
                <p className="text-2xl font-bold">
                  {(
                    (analytics?.data?.summary?.conversionRate || 0) * 100
                  ).toFixed(1)}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Link href="/drops" className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-500/20 p-3">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Create New Drop</p>
                  <p className="text-sm text-muted-foreground">
                    Launch a new product
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/discount-codes" className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-purple-500/20 p-3">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Create Discount</p>
                  <p className="text-sm text-muted-foreground">
                    Offer special deals
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
