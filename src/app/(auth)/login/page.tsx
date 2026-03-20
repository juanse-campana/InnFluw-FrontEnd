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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authApi } from "@/lib/api";
import { useToastStore } from "@/lib/store";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useToastStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(data);

      if (response.success) {
        addToast({
          type: "success",
          title: "Código enviado",
          message: response.message || "Revisa tu email para el código OTP",
        });
        router.push(`/register/verify?email=${encodeURIComponent(data.email)}`);
      } else {
        setError(response.message || "Error en el login");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Ocurrió un error durante el login";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Bienvenido</CardTitle>
          <CardDescription>Inicia sesión en tu cuenta</CardDescription>
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
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
            <div className="flex items-center justify-between w-full text-sm">
              <Link
                href="/resend-verification"
                className="text-primary hover:underline"
              >
                ¿No verificaste tu email?
              </Link>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Regístrate
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
