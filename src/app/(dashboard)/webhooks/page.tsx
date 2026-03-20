"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { webhooksApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Spinner, Alert, AlertDescription } from "@/components/ui";
import { Plus, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { useToastStore } from "@/lib/store";

export default function WebhooksPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>([]);

  const { data: webhooksData, isLoading } = useQuery({
    queryKey: ["webhooks"],
    queryFn: webhooksApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: () => webhooksApi.create({ url, events }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      addToast({ type: "success", title: "Webhook created" });
      setShowForm(false);
      setUrl("");
      setEvents([]);
    },
    onError: () => {
      addToast({ type: "error", title: "Failed to create webhook" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: webhooksApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      addToast({ type: "success", title: "Webhook deleted" });
    },
    onError: () => {
      addToast({ type: "error", title: "Failed to delete webhook" });
    },
  });

  const availableEvents = [
    "order.created",
    "order.confirmed",
    "order.cancelled",
    "drop.stock.low",
    "drop.created",
    "drop.updated",
  ];

  const toggleEvent = (event: string) => {
    setEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
          <p className="text-muted-foreground">Receive notifications when events occur</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Webhook
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Webhook</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">URL</label>
              <input
                type="url"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="https://your-server.com/webhook"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Events</label>
              <div className="flex flex-wrap gap-2">
                {availableEvents.map((event) => (
                  <button
                    key={event}
                    onClick={() => toggleEvent(event)}
                    className={`px-3 py-1 rounded-full text-sm border ${
                      events.includes(event)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-input hover:border-primary"
                    }`}
                  >
                    {event}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate()} disabled={!url || events.length === 0}>
                Create
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Webhooks</CardTitle>
        </CardHeader>
        <CardContent>
          {webhooksData?.data?.length > 0 ? (
            <div className="space-y-4">
              {webhooksData.data.map((webhook: any) => (
                <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate max-w-md">{webhook.url}</p>
                      <Badge variant={webhook.isActive ? "success" : "destructive"}>
                        {webhook.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {webhook.events.map((event: string) => (
                        <Badge key={event} variant="secondary">
                          {event}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Created {formatDate(webhook.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Delete this webhook?")) {
                        deleteMutation.mutate(webhook.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No webhooks configured</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create your first webhook
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
