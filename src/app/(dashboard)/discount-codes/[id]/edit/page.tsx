"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { discountCodesApi, dropsApi } from "@/lib/api";
import { toast } from "sonner";
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Spinner,
} from "@/components/ui";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import type { Drop } from "@/types";

const updateCodeSchema = z.object({
  code: z.string().min(1, "Código requerido").max(50, "Máximo 50 caracteres"),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  value: z.number().min(0, "Valor debe ser mayor a 0"),
  minAmount: z.union([z.number(), z.literal(""), z.nan()]).optional(),
  maxUses: z.union([z.number(), z.literal(""), z.nan()]).optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
  dropIds: z.array(z.string()).min(1, "Selecciona al menos un drop"),
});

type UpdateCodeForm = z.infer<typeof updateCodeSchema>;

export default function EditDiscountCodePage() {
  const router = useRouter();
  const params = useParams();
  const codeId = params.id as string;
  const [selectedDrops, setSelectedDrops] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateCodeForm>({
    resolver: zodResolver(updateCodeSchema),
    defaultValues: {
      type: "PERCENTAGE",
      value: 10,
      isActive: true,
      dropIds: [],
    },
  });

  const { data: codeData, isLoading: isLoadingCode } = useQuery({
    queryKey: ["discountCode", codeId],
    queryFn: () => discountCodesApi.getById(codeId),
    enabled: !!codeId,
  });

  const { data: dropsData } = useQuery({
    queryKey: ["drops"],
    queryFn: () => dropsApi.getAll(),
  });

  // Effect to sync form with code data
  useEffect(() => {
    if (codeData?.data?.code) {
      const code = codeData.data.code;
      reset({
        code: code.code,
        type: code.type,
        value: code.value,
        minAmount: code.minAmount ?? "",
        maxUses: code.maxUses ?? "",
        expiresAt: code.expiresAt
          ? new Date(code.expiresAt).toISOString().slice(0, 16)
          : "",
        isActive: code.isActive,
        dropIds: code.dropIds || [],
      });
    }
  }, [codeData, reset]);

  // Effect to sync selectedDrops - SEPARADO para evitar race conditions
  useEffect(() => {
    if (codeData?.data?.code) {
      // API returns drops as nested array: { drops: [{ dropId, drop: {...} }] }
      // Extract just the dropId strings for the UI
      const associatedDropIds =
        codeData.data.code.drops?.map((d: { dropId: string }) => d.dropId) ||
        [];
      setSelectedDrops(associatedDropIds);
      setValue("dropIds", associatedDropIds, { shouldValidate: true });
    }
  }, [codeData, setValue]);

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      discountCodesApi.update(codeId, data),
    onSuccess: () => {
      toast.success("Código actualizado exitosamente");
      router.push("/discount-codes");
    },
    onError: (error: unknown) => {
      if (error && typeof error === "object" && "message" in error) {
        const err = error as { message: string; code?: string };
        toast.error("Error al actualizar código", {
          description: err.message,
        });
      } else if (error instanceof Error) {
        toast.error("Error al actualizar código", {
          description: error.message,
        });
      } else {
        toast.error("Error al actualizar código", {
          description: "Error desconocido",
        });
      }
    },
  });

  const onSubmit = (data: UpdateCodeForm) => {
    const payload: Record<string, unknown> = {
      code: data.code.toUpperCase(),
      type: data.type,
      value: data.value,
      isActive: data.isActive,
      dropIds: selectedDrops,
    };

    const minAmountValue =
      data.minAmount === "" ||
      data.minAmount === null ||
      isNaN(data.minAmount as number)
        ? undefined
        : Number(data.minAmount);
    if (minAmountValue !== undefined) {
      payload.minAmount = minAmountValue;
    }

    const maxUsesValue =
      data.maxUses === "" ||
      data.maxUses === null ||
      isNaN(data.maxUses as number)
        ? undefined
        : Number(data.maxUses);
    if (maxUsesValue !== undefined) {
      payload.maxUses = maxUsesValue;
    }

    if (data.expiresAt && data.expiresAt.trim() !== "") {
      const isoDate = new Date(data.expiresAt);
      if (!isNaN(isoDate.getTime())) {
        payload.expiresAt = isoDate.toISOString();
      }
    }

    updateMutation.mutate(payload);
  };

  const toggleDrop = (dropId: string) => {
    const newSelectedDrops = selectedDrops.includes(dropId)
      ? selectedDrops.filter((id) => id !== dropId)
      : [...selectedDrops, dropId];
    setSelectedDrops(newSelectedDrops);
    setValue("dropIds", newSelectedDrops, { shouldValidate: true });
  };

  const drops = dropsData?.data?.drops || [];
  const type = watch("type");

  if (isLoadingCode) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!codeData?.data?.code) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Código no encontrado</p>
      </div>
    );
  }

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
            Editar Código de Descuento
          </h1>
          <p className="text-muted-foreground">
            Actualiza los detalles del código de descuento
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
                  disabled={updateMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateMutation.isPending
                    ? "Guardando..."
                    : "Guardar cambios"}
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
