"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { analyticsApi, dropsApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Spinner,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import {
  Eye,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Tag,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import type { Period } from "@/types";

export default function DropAnalyticsPage() {
  const params = useParams();
  const dropId = params.id as string;
  const [period, setPeriod] = useState<Period>("30d");

  const { data: dropData, isLoading: isLoadingDrop } = useQuery({
    queryKey: ["drop", dropId],
    queryFn: () => dropsApi.getById(dropId),
  });

  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ["drop-analytics", dropId, period],
    queryFn: () => analyticsApi.getDropAnalytics(dropId, period),
    enabled: !!dropId,
  });

  const isLoading = isLoadingDrop || isLoadingAnalytics;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const drop = dropData?.data?.drop;
  const analytics = analyticsData?.data;

  if (!drop) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Drop no encontrado</p>
      </div>
    );
  }

  const summary = analytics?.summary || {
    visitors: 0,
    orders: 0,
    revenue: 0,
    totalDiscount: 0,
    conversionRate: 0,
  };

  const stats = [
    {
      title: "Visitantes",
      value: summary.visitors,
      icon: Eye,
      color: "text-blue-600",
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Pedidos",
      value: summary.orders,
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-500/20",
    },
    {
      title: "Ingresos",
      value: formatCurrency(summary.revenue),
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-500/20",
    },
    {
      title: "Tasa conversión",
      value: `${summary.conversionRate.toFixed(2)}%`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/drops/${dropId}/edit`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Analytics: {drop.title}
            </h1>
            <p className="text-muted-foreground">
              Estadísticas detalladas de tu drop
            </p>
          </div>
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
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Códigos de descuento más usados</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.topCodes && analytics.topCodes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead className="text-right">Usos</TableHead>
                    <TableHead className="text-right">
                      Descuento total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.topCodes.map((code) => (
                    <TableRow key={code.code}>
                      <TableCell className="font-mono">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          {code.code}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{code.uses}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(code.discount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No hay códigos usados en este período
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen de descuento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Descuento total aplicado
                </span>
                <span className="text-xl font-bold text-red-600">
                  -{formatCurrency(summary.totalDiscount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Pedidos con descuento
                </span>
                <span className="font-medium">
                  {analytics?.topCodes?.reduce((acc, c) => acc + c.uses, 0) ||
                    0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Ingresos brutos (sin descuento)
                </span>
                <span className="font-medium">
                  {formatCurrency(summary.revenue + summary.totalDiscount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estadísticas diarias</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics?.dailyStats ? (
            <div className="space-y-6">
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                  Visitantes por día
                </h4>
                <div className="flex items-end gap-1 h-32">
                  {analytics.dailyStats.visitors.map((day, i) => {
                    const maxVisitors = Math.max(
                      ...analytics.dailyStats.visitors.map((v) => v.count),
                      1,
                    );
                    const height = (day.count / maxVisitors) * 100;
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-blue-500/20 rounded-t"
                        style={{ height: `${Math.max(height, 4)}%` }}
                        title={`${day.date}: ${day.count} visitantes`}
                      />
                    );
                  })}
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                  Pedidos por día
                </h4>
                <div className="flex items-end gap-1 h-32">
                  {analytics.dailyStats.orders.map((day, i) => {
                    const maxOrders = Math.max(
                      ...analytics.dailyStats.orders.map((v) => v.count),
                      1,
                    );
                    const height = (day.count / maxOrders) * 100;
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-green-500/20 rounded-t"
                        style={{ height: `${Math.max(height, 4)}%` }}
                        title={`${day.date}: ${day.count} pedidos`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No hay datos suficientes para mostrar gráficos
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Estadísticas generales</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/drops/${dropId}/edit`}>Editar drop</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Visitas totales</p>
              <p className="text-2xl font-bold">{drop._count?.visitors || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Pedidos totales</p>
              <p className="text-2xl font-bold">{drop._count?.orders || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Stock disponible</p>
              <p className="text-2xl font-bold">{drop.stock}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Estado</p>
              <Badge
                variant={
                  drop.status === "LIVE"
                    ? "success"
                    : drop.status === "DRAFT"
                      ? "secondary"
                      : "warning"
                }
              >
                {drop.status === "LIVE"
                  ? "En vivo"
                  : drop.status === "DRAFT"
                    ? "Borrador"
                    : drop.status === "COMING_SOON"
                      ? "Próximamente"
                      : drop.status === "SOLD_OUT"
                        ? "Agotado"
                        : "Finalizado"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
