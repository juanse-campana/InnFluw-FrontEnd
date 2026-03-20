"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Alert,
  AlertDescription,
  Spinner,
} from "@/components/ui";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { useToastStore } from "@/lib/store";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { addToast } = useToastStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError("Token de verificación faltante");
        setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.verifyEmail(token);
        if (response.success) {
          setIsVerified(true);
          addToast({
            type: "success",
            title: "Email verificado",
            message: "Tu email ha sido verificado exitosamente",
          });
        } else {
          setError(response.message || "Error al verificar email");
        }
      } catch (err: any) {
        const errorMessage = err.message || "No se pudo verificar el email";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token, addToast]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner className="h-8 w-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando tu email...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <svg
                className="h-8 w-8 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl">Error de verificación</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/resend-verification">
                Reenviar email de verificación
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Volver al login</Link>
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
          <CardTitle className="text-2xl">Email verificado</CardTitle>
          <CardDescription>
            Tu email ha sido verificado exitosamente. Ahora puedes iniciar
            sesión.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Te hemos enviado un código de verificación (OTP) la próxima vez
              que inicies sesión.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            ¿No recibiste el código OTP?{" "}
            <Link
              href="/resend-verification"
              className="text-primary hover:underline"
            >
              Reenviar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
