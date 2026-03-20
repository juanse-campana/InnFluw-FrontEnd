"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dropsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Spinner, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Alert, AlertDescription, Input } from "@/components/ui";
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToastStore } from "@/lib/store";

const statusColors = {
  DRAFT: "secondary",
  LIVE: "success",
  PAUSED: "warning",
  SOLD_OUT: "destructive",
} as const;

export default function DropsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  const [search, setSearch] = useState("");

  const { data: dropsData, isLoading } = useQuery({
    queryKey: ["drops"],
    queryFn: () => dropsApi.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: dropsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drops"] });
      addToast({ type: "success", title: "Drop deleted" });
    },
    onError: () => {
      addToast({ type: "error", title: "Failed to delete drop" });
    },
  });

  const filteredDrops = dropsData?.data?.filter((drop: any) =>
    drop.title.toLowerCase().includes(search.toLowerCase()) ||
    drop.slug.toLowerCase().includes(search.toLowerCase())
  ) || [];

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
          <h1 className="text-3xl font-bold tracking-tight">Drops</h1>
          <p className="text-muted-foreground">Manage your product drops</p>
        </div>
        <Button asChild>
          <Link href="/drops/new">
            <Plus className="mr-2 h-4 w-4" />
            New Drop
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Drops</CardTitle>
            <Input
              placeholder="Search drops..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredDrops.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrops.map((drop: any) => (
                  <TableRow key={drop.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{drop.title}</p>
                        <p className="text-sm text-muted-foreground">/{drop.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[drop.status as keyof typeof statusColors] || "secondary"}>
                        {drop.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(drop.price)}</TableCell>
                    <TableCell>{drop.stock}</TableCell>
                    <TableCell>{drop.orders}</TableCell>
                    <TableCell>{formatCurrency(drop.revenue)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(drop.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/drops/${drop.id}/view`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/drops/${drop.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this drop?")) {
                              deleteMutation.mutate(drop.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No drops found</p>
              <Button asChild>
                <Link href="/drops/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first drop
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
