"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { discountCodesApi, dropsApi } from "@/lib/api";
import { useToastStore } from "@/lib/store";
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
} from "@/components/ui";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import type { Drop } from "@/types";

const createCodeSchema = z.object({
  code: z.string().min(1, "Código requerido").max(50, "Máximo 50 caracteres"),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  value: z.number().min(0, "Valor debe ser mayor a 0"),
  minAmount: z.number().optional(),
  maxUses: z.number().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
  dropIds: z.array(z.string()).min(1, "Selecciona al menos un drop"),
});

type CreateCodeForm = z.infer<typeof createCodeSchema>;

export default function NewDiscountCodePage() {
  const router = useRouter();
  const { addToast } = useToastStore();
  const [selectedDrops, setSelectedDrops] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateCodeForm>({
    resolver: zodResolver(createCodeSchema),
    defaultValues: {
      type: "PERCENTAGE",
      value: 10,
      isActive: true,
      dropIds: [],
    },
  });

  const { data: dropsData } = useQuery({
    queryKey: ["drops"],
    queryFn: () => dropsApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: discountCodesApi.create,
    onSuccess: () => {
      addToast({ type: "success", title: "Código creado exitosamente" });
      router.push("/discount-codes");
    },
    onError: (error: unknown) => {
      const err = error as { message?: string };
      addToast({
        type: "error",
        title: "Error al crear código",
        message: err.message,
      });
    },
  });

  const onSubmit = (data: CreateCodeForm) => {
    createMutation.mutate({
      ...data,
      code: data.code.toUpperCase(),
      dropIds: selectedDrops,
    });
  };

  const toggleDrop = (dropId: string) => {
    setSelectedDrops((prev) =>
      prev.includes(dropId)
        ? prev.filter((id) => id !== dropId)
        : [...prev, dropId],
    );
  };

  const drops = dropsData?.data?.drops || [];
  const type = watch("type");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/discount-codes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Crear Código de Descuento
          </h1>
          <p className="text-muted-foreground">
            Crea un nuevo código de descuento
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Información del código</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  placeholder="DESCUENTO10"
                  {...register("code")}
                  className="uppercase"
                />
                {errors.code && (
                  <p className="text-sm text-destructive">
                    {errors.code.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  El código se convertirá a mayúsculas automáticamente
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <select
                    id="type"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    {...register("type")}
                  >
                    <option value="PERCENTAGE">Porcentaje (%)</option>
                    <option value="FIXED_AMOUNT">Monto fijo ($)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">
                    Valor ({type === "PERCENTAGE" ? "%" : "$"})
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    step={type === "PERCENTAGE" ? "1" : "0.01"}
                    min="0"
                    max={type === "PERCENTAGE" ? "100" : undefined}
                    {...register("value", { valueAsNumber: true })}
                  />
                  {errors.value && (
                    <p className="text-sm text-destructive">
                      {errors.value.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minAmount">Monto mínimo (opcional)</Label>
                  <Input
                    id="minAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...register("minAmount", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxUses">Usos máximos (opcional)</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    placeholder="Ilimitado"
                    {...register("maxUses", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">
                  Fecha de expiración (opcional)
                </Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  {...register("expiresAt")}
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Drops asociados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecciona los drops donde se puede usar este código
                </p>
                {errors.dropIds && (
                  <p className="text-sm text-destructive mb-2">
                    {errors.dropIds.message}
                  </p>
                )}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {drops.length > 0 ? (
                    drops.map((drop: Drop) => (
                      <label
                        key={drop.id}
                        className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDrops.includes(drop.id)}
                          onChange={() => toggleDrop(drop.id)}
                          className="rounded"
                        />
                        <div>
                          <p className="font-medium">{drop.title}</p>
                          <p className="text-sm text-muted-foreground">
                            /{drop.slug}
                          </p>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No hay drops disponibles
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedDrops.length} drop(s) seleccionado(s)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {createMutation.isPending ? "Creando..." : "Crear código"}
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/discount-codes">Cancelar</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
