"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Spinner,
} from "@/components/ui";
import { checkoutApi } from "@/lib/api";
import { useToastStore } from "@/lib/store";
import { Check, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { OrderResponse } from "@/types";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default function OrderConfirmPage() {
  const params = useParams();
  const token = params.token as string;
  const { addToast } = useToastStore();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const confirmOrder = async () => {
      if (!token) {
        setError("Token de confirmación faltante");
        setIsLoading(false);
        return;
      }

      try {
        const response = await checkoutApi.confirm(token);
        if (response.success && response.data?.order) {
          setOrder(response.data.order);
          addToast({
            type: "success",
            title: "¡Orden confirmada!",
            message: "Tu compra ha sido confirmada exitosamente",
          });
        } else {
          setError(response.message || "Error al confirmar la orden");
        }
      } catch (err: any) {
        setError(err.message || "No se pudo confirmar la orden");
      } finally {
        setIsLoading(false);
      }
    };

    confirmOrder();
  }, [token, addToast]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner className="h-8 w-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Confirmando tu orden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Error de confirmación</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/">Volver al inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">¡Compra confirmada!</CardTitle>
          <CardDescription>
            Tu orden ha sido confirmada exitosamente. Recibirás un email con los
            detalles de tu compra.
          </CardDescription>
        </CardHeader>
        {order && (
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ID de orden</span>
                <span className="font-mono">{order.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estado</span>
                <span className="font-medium text-green-600">
                  {order.status === "CONFIRMED" ? "Confirmada" : order.status}
                </span>
              </div>
              {order.total && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        )}
        <CardContent className="flex flex-col gap-3">
          {order?.confirmationUrl && (
            <Button
              onClick={() => window.open(order.confirmationUrl, "_blank")}
              variant="outline"
              className="w-full"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver detalles de la orden
            </Button>
          )}
          <Button asChild className="w-full">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
