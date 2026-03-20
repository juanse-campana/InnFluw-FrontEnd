"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { discountCodesApi } from "@/lib/api";
import {
  Card,
  CardContent,
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
import { Plus, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useToastStore } from "@/lib/store";
import Link from "next/link";
import type { DiscountCode } from "@/types";

const typeLabels: Record<string, string> = {
  PERCENTAGE: "Porcentaje",
  FIXED_AMOUNT: "Monto fijo",
};

export default function DiscountCodesPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);

  const { data: codesData, isLoading } = useQuery({
    queryKey: ["discountCodes"],
    queryFn: () => discountCodesApi.getAll({}),
  });

  const deleteMutation = useMutation({
    mutationFn: discountCodesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discountCodes"] });
      addToast({ type: "success", title: "Código eliminado" });
    },
    onError: () => {
      addToast({ type: "error", title: "Error al eliminar" });
    },
  });

  const filteredCodes =
    codesData?.data?.codes?.filter((code: DiscountCode) => {
      if (activeFilter === null) return true;
      return code.isActive === activeFilter;
    }) || [];

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
          <h1 className="text-3xl font-bold tracking-tight">
            Códigos de Descuento
          </h1>
          <p className="text-muted-foreground">
            Crea y gestiona códigos de descuento
          </p>
        </div>
        <Button asChild>
          <Link href="/discount-codes/new">
            <Plus className="mr-2 h-4 w-4" />
            Crear Código
          </Link>
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant={activeFilter === null ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter(null)}
        >
          Todos
        </Button>
        <Button
          variant={activeFilter === true ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter(true)}
        >
          Activos
        </Button>
        <Button
          variant={activeFilter === false ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter(false)}
        >
          Inactivos
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredCodes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Expira</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCodes.map((code: DiscountCode) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-mono font-medium">
                      {code.code}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {typeLabels[code.type] || code.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {code.type === "PERCENTAGE"
                        ? `${code.value}%`
                        : formatCurrency(code.value)}
                    </TableCell>
                    <TableCell>
                      {code.uses}/{code.maxUses || "∞"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={code.isActive ? "success" : "destructive"}
                      >
                        {code.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {code.expiresAt ? formatDate(code.expiresAt) : "Nunca"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(code.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/discount-codes/${code.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (
                              confirm(
                                "¿Estás seguro de que deseas eliminar este código?",
                              )
                            ) {
                              deleteMutation.mutate(code.id);
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
              <p className="text-muted-foreground mb-4">
                No hay códigos de descuento
              </p>
              <Button asChild>
                <Link href="/discount-codes/new">Crear primer código</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
