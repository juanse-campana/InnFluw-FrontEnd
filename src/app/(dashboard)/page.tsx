"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Spinner,
  Button,
} from "@/components/ui";
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Package,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import type { Period } from "@/types";

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("30d");

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["dashboard", period],
    queryFn: () => analyticsApi.getDashboard(period),
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const summary = analytics?.data?.summary || {
    totalDrops: 0,
    activeDrops: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalVisitors: 0,
  };

  const stats = [
    {
      title: "Total Drops",
      value: summary.totalDrops,
      subtext: `${summary.activeDrops} activos`,
      icon: Package,
      trend: null,
    },
    {
      title: "Pedidos",
      value: summary.totalOrders,
      subtext: `en ${period}`,
      icon: ShoppingCart,
      trend: null,
    },
    {
      title: "Ingresos",
      value: formatCurrency(summary.totalRevenue),
      subtext: `en ${period}`,
      icon: DollarSign,
      trend: null,
    },
    {
      title: "Visitantes",
      value: summary.totalVisitors,
      subtext: `en ${period}`,
      icon: Eye,
      trend: null,
    },
  ];

  const conversionRate =
    summary.totalVisitors > 0
      ? (summary.totalOrders / summary.totalVisitors) * 100
      : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido de vuelta. Aquí tienes un resumen de tu tienda.
          </p>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d", "90d"] as Period[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p === "7d" ? "7 días" : p === "30d" ? "30 días" : "90 días"}
            </Button>
          ))}
        </div>
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
              Pedidos recientes
              <Link
                href="/orders"
                className="text-sm font-normal text-primary hover:underline"
              >
                Ver todos
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(analytics?.data?.recentOrders?.length ?? 0) > 0 ? (
              <div className="space-y-4">
                {analytics?.data?.recentOrders?.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{order.buyerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.drop?.title || "Producto"}
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
                        {order.status === "CONFIRMED"
                          ? "Confirmado"
                          : order.status === "PENDING"
                            ? "Pendiente"
                            : order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No hay pedidos aún
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Tasa de conversión
              <Link
                href="/analytics"
                className="text-sm font-normal text-primary hover:underline"
              >
                Ver analytics
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-500/20 p-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-4xl font-bold">
                  {conversionRate.toFixed(2)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  {summary.totalOrders} pedidos de {summary.totalVisitors}{" "}
                  visitas
                </p>
              </div>
            </div>
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
                <p className="font-medium">Tasa de conversión</p>
                <p className="text-2xl font-bold">
                  {conversionRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Link href="/drops/new" className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-500/20 p-3">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Crear nuevo Drop</p>
                  <p className="text-sm text-muted-foreground">
                    Lanzar un nuevo producto
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/discount-codes/new" className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-purple-500/20 p-3">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Crear descuento</p>
                  <p className="text-sm text-muted-foreground">
                    Ofrecer ofertas especiales
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
