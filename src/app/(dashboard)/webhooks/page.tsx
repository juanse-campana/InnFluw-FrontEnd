"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { webhooksApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import {
  Plus,
  Trash2,
  Eye,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToastStore } from "@/lib/store";
import type { Webhook, WebhookDelivery } from "@/types";

const AVAILABLE_EVENTS = [
  { value: "order.created", label: "Orden creada" },
  { value: "order.confirmed", label: "Orden confirmada" },
  { value: "drop.stock.low", label: "Stock bajo" },
];

const eventLabels: Record<string, string> = {
  "order.created": "Orden creada",
  "order.confirmed": "Orden confirmada",
  "drop.stock.low": "Stock bajo",
};

export default function WebhooksPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  const [showForm, setShowForm] = useState(false);
  const [showLogs, setShowLogs] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>([]);

  const { data: webhooksData, isLoading } = useQuery({
    queryKey: ["webhooks"],
    queryFn: webhooksApi.getAll,
  });

  const { data: logsData, isLoading: isLoadingLogs } = useQuery({
    queryKey: ["webhook-logs", showLogs],
    queryFn: () => webhooksApi.getLogs(showLogs!),
    enabled: !!showLogs,
  });

  const createMutation = useMutation({
    mutationFn: () => webhooksApi.create({ url, events }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      addToast({ type: "success", title: "Webhook creado" });
      setShowForm(false);
      setUrl("");
      setEvents([]);
    },
    onError: (error: unknown) => {
      const err = error as { message?: string };
      addToast({
        type: "error",
        title: "Error al crear webhook",
        message: err.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: webhooksApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      addToast({ type: "success", title: "Webhook eliminado" });
    },
    onError: (error: unknown) => {
      const err = error as { message?: string };
      addToast({
        type: "error",
        title: "Error al eliminar",
        message: err.message,
      });
    },
  });

  const toggleEvent = (event: string) => {
    setEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const webhooks = webhooksData?.data?.webhooks || [];
  const deliveries = logsData?.data?.deliveries || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
          <p className="text-muted-foreground">
            Recibe notificaciones cuando ocurran eventos
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Webhook
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Webhook</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">URL</label>
              <input
                type="url"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="https://tu-servidor.com/webhook"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Eventos</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_EVENTS.map((event) => (
                  <button
                    key={event.value}
                    onClick={() => toggleEvent(event.value)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      events.includes(event.value)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-input hover:border-primary"
                    }`}
                  >
                    {event.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => createMutation.mutate()}
                disabled={
                  !url || events.length === 0 || createMutation.isPending
                }
              >
                {createMutation.isPending ? "Creando..." : "Crear"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showLogs && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Logs de Entrega</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLogs(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingLogs ? (
              <Spinner className="h-6 w-6" />
            ) : deliveries.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estado</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Respuesta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((delivery: WebhookDelivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell>
                        {delivery.status === "success" ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : delivery.status === "failed" ? (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-600" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            delivery.statusCode === 200
                              ? "success"
                              : "destructive"
                          }
                        >
                          {delivery.statusCode || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(delivery.createdAt)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {delivery.response || delivery.error || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No hay logs de entrega
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Todos los Webhooks</CardTitle>
        </CardHeader>
        <CardContent>
          {webhooks.length > 0 ? (
            <div className="space-y-4">
              {webhooks.map((webhook: Webhook) => (
                <div
                  key={webhook.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate max-w-md">
                        {webhook.url}
                      </p>
                      <Badge
                        variant={webhook.isActive ? "success" : "destructive"}
                      >
                        {webhook.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {webhook.events.map((event: string) => (
                        <Badge key={event} variant="secondary">
                          {eventLabels[event] || event}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Creado {formatDate(webhook.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowLogs(webhook.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (
                          confirm(
                            "¿Estás seguro de que deseas eliminar este webhook?",
                          )
                        ) {
                          deleteMutation.mutate(webhook.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No hay webhooks configurados
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Crea tu primer webhook
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
