"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Alert,
  AlertDescription,
} from "@/components/ui";
import Link from "next/link";
import { useState } from "react";
import { authApi } from "@/lib/api";
import { useToastStore } from "@/lib/store";

const resendSchema = z.object({
  email: z.string().email("Email inválido"),
});

type ResendForm = z.infer<typeof resendSchema>;

export default function ResendVerificationPage() {
  const { addToast } = useToastStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendForm>({
    resolver: zodResolver(resendSchema),
  });

  const onSubmit = async (data: ResendForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.resendVerification(data.email);
      if (response.success) {
        setSuccess(true);
        addToast({
          type: "success",
          title: "Email enviado",
          message: "Revisa tu bandeja de entrada",
        });
      } else {
        setError(response.message || "Error al reenviar email");
      }
    } catch (err: any) {
      const errorMessage =
        err.message || "No se pudo reenviar el email de verificación";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl">Email enviado</CardTitle>
            <CardDescription>
              Revisa tu bandeja de entrada y sigue las instrucciones para
              verificar tu email.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/login">Volver al login</Link>
            </Button>
            <Button
              onClick={() => setSuccess(false)}
              variant="ghost"
              className="w-full"
            >
              Enviar a otro email
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reenviar verificación</CardTitle>
          <CardDescription>
            Ingresa tu email para recibir un nuevo link de verificación
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Reenviar email"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              ¿Ya verificaste tu email?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
