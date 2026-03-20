"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dropsApi } from "@/lib/api";
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
  Input,
} from "@/components/ui";
import { Plus, Pencil, Trash2, BarChart3, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToastStore } from "@/lib/store";
import type { Drop } from "@/types";

const statusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  COMING_SOON: "Próximamente",
  LIVE: "En vivo",
  SOLD_OUT: "Agotado",
  ENDED: "Finalizado",
};

const statusColors: Record<
  string,
  "secondary" | "success" | "warning" | "destructive"
> = {
  DRAFT: "secondary",
  COMING_SOON: "warning",
  LIVE: "success",
  SOLD_OUT: "destructive",
  ENDED: "secondary",
};

export default function DropsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: dropsData, isLoading } = useQuery({
    queryKey: ["drops", page],
    queryFn: () => dropsApi.getAll({ page, limit: 10 }),
  });

  const deleteMutation = useMutation({
    mutationFn: dropsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drops"] });
      addToast({ type: "success", title: "Drop eliminado" });
    },
    onError: () => {
      addToast({ type: "error", title: "Error al eliminar" });
    },
  });

  const filteredDrops =
    dropsData?.data?.drops?.filter(
      (drop: Drop) =>
        drop.title.toLowerCase().includes(search.toLowerCase()) ||
        drop.slug.toLowerCase().includes(search.toLowerCase()),
    ) || [];

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const pagination = dropsData?.data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drops</h1>
          <p className="text-muted-foreground">Gestiona tus productos</p>
        </div>
        <Button asChild>
          <Link href="/drops/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Drop
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Todos los Drops</CardTitle>
            <Input
              placeholder="Buscar drops..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredDrops.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Pedidos</TableHead>
                    <TableHead>Visitantes</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrops.map((drop: Drop) => (
                    <TableRow key={drop.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{drop.title}</p>
                          <p className="text-sm text-muted-foreground">
                            /{drop.slug}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusColors[drop.status] || "secondary"}
                        >
                          {statusLabels[drop.status] || drop.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(drop.price)}</TableCell>
                      <TableCell>{drop.stock}</TableCell>
                      <TableCell>{drop._count?.orders || 0}</TableCell>
                      <TableCell>{drop._count?.visitors || 0}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(drop.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Ver página pública"
                            asChild
                          >
                            <a
                              href={`/p/${drop.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Ver analytics"
                            asChild
                          >
                            <Link href={`/drops/${drop.id}/analytics`}>
                              <BarChart3 className="h-4 w-4" />
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
                              if (
                                confirm(
                                  "¿Estás seguro de que deseas eliminar este drop?",
                                )
                              ) {
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
              <p className="text-muted-foreground mb-4">
                No se encontraron drops
              </p>
              <Button asChild>
                <Link href="/drops/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Crea tu primer drop
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
