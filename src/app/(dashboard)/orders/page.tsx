"use client";

import { useQuery } from "@tanstack/react-query";
import { checkoutApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Button,
} from "@/components/ui";
import { Eye } from "lucide-react";
import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import type { Order } from "@/types";

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  REFUNDED: "Reembolsado",
};

const statusColors: Record<
  string,
  "warning" | "success" | "destructive" | "secondary"
> = {
  PENDING: "warning",
  CONFIRMED: "success",
  REFUNDED: "secondary",
};

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders", page, statusFilter],
    queryFn: () =>
      checkoutApi.getOrders({
        page,
        limit: 10,
        status: statusFilter || undefined,
      }),
  });

  const filteredOrders =
    ordersData?.data?.orders?.filter(
      (order: Order) =>
        order.buyerEmail.toLowerCase().includes(search.toLowerCase()) ||
        order.buyerName.toLowerCase().includes(search.toLowerCase()) ||
        order.id.toLowerCase().includes(search.toLowerCase()),
    ) || [];

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const pagination = ordersData?.data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">Ver y gestionar tus pedidos</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Todos los Pedidos</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Todos los estados</option>
                <option value="PENDING">Pendiente</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="REFUNDED">Reembolsado</option>
              </select>
              <Input
                placeholder="Buscar pedidos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order: Order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.buyerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.buyerEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {order.drop?.title || "Producto"}
                          </p>
                          {order.discountCode && (
                            <p className="text-xs text-muted-foreground">
                              Código: {order.discountCode.code}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {formatCurrency(order.total)}
                          </p>
                          {order.discount > 0 && (
                            <p className="text-xs text-green-600">
                              -{formatCurrency(order.discount)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusColors[order.status] || "secondary"}
                        >
                          {statusLabels[order.status] || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {pagination && pagination.pages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Página {pagination.page} de {pagination.pages} (
                    {pagination.total} resultados)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= pagination.pages}
                      onClick={() => setPage(page + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron pedidos</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
