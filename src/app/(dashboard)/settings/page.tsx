"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Spinner,
  Alert,
  AlertDescription,
} from "@/components/ui";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useToastStore } from "@/lib/store";
import { useState } from "react";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { addToast } = useToastStore();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { name: string }) => authApi.updateProfile(data),
    onSuccess: (response) => {
      if (response.data?.user) {
        setUser(response.data.user);
      }
      addToast({ type: "success", title: "Perfil actualizado exitosamente" });
      setIsEditing(false);
    },
    onError: () => {
      addToast({ type: "error", title: "Error al actualizar el perfil" });
    },
  });

  const onSubmit = (data: { name: string }) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Gestioná la configuración de tu cuenta</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>Actualizá tu información personal</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  disabled={!isEditing}
                  {...register("name", { required: "El nombre es requerido" })}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ""} disabled />
                <p className="text-xs text-muted-foreground">
                  El email no se puede cambiar
                </p>
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${user?.emailVerified ? "bg-green-500" : "bg-yellow-500"}`}
                  />
                  <span className="text-sm">
                    {user?.emailVerified ? "Verificado" : "Verificación pendiente"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button type="submit" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? (
                        <Spinner className="h-4 w-4 mr-2" />
                      ) : null}
                      Guardar cambios
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    Editar perfil
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cuenta</CardTitle>
            <CardDescription>Información de la cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Miembro desde</p>
              <p className="font-medium">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("es-AR")
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ID de cuenta</p>
              <p className="font-medium font-mono text-sm">
                {user?.id || "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
