"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { checkoutApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Spinner,
  Button,
} from "@/components/ui";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  REFUNDED: "Reembolsado",
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const { data: orderData, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => checkoutApi.getOrderById(orderId),
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!orderData?.data?.order) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Pedido no encontrado</p>
      </div>
    );
  }

  const order = orderData.data.order;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Detalle del Pedido
          </h1>
          <p className="text-muted-foreground font-mono text-sm">{order.id}</p>
        </div>
        <Badge
          variant={
            order.status === "CONFIRMED"
              ? "success"
              : order.status === "PENDING"
                ? "warning"
                : "secondary"
          }
        >
          {statusLabels[order.status] || order.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información del cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nombre</span>
              <span className="font-medium">{order.buyerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{order.buyerEmail}</span>
            </div>
            {order.buyerPhone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Teléfono</span>
                <span className="font-medium">{order.buyerPhone}</span>
              </div>
            )}
            {order.buyerAddress && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dirección</span>
                <span className="font-medium text-right">
                  {order.buyerAddress}
                  {order.buyerCity && `, ${order.buyerCity}`}
                  {order.buyerCountry && `, ${order.buyerCountry}`}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información del pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Producto</span>
              <span className="font-medium">
                {order.drop?.title || "Producto"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha de creación</span>
              <span className="font-medium">{formatDate(order.createdAt)}</span>
            </div>
            {order.confirmedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Fecha confirmación
                </span>
                <span className="font-medium">
                  {formatDate(order.confirmedAt)}
                </span>
              </div>
            )}
            {order.discountCode && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Código descuento</span>
                <span className="font-mono font-medium">
                  {order.discountCode.code}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Resumen de pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">
                {formatCurrency(order.subtotal)}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento</span>
                <span className="font-medium">
                  -{formatCurrency(order.discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t pt-3 text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
