"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Input,
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
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense, useEffect, useRef } from "react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useToastStore } from "@/lib/store";

const verifySchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().length(6, "Code must be 6 digits"),
});

type VerifyForm = z.infer<typeof verifySchema>;

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const { setAuth } = useAuthStore();
  const { addToast } = useToastStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    codeInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      email: emailParam,
    },
  });

  const onSubmit = async (data: VerifyForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.verifyOtp(data);

      if (response.success && response.data?.user && response.data?.token) {
        setAuth(response.data.user, response.data.token);
        addToast({
          type: "success",
          title: "Email verified!",
          message: "Welcome to InnFluw!",
        });
        router.push("/dashboard");
      } else {
        setError(response.message || "Verification failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !emailParam) return;

    setIsResending(true);
    try {
      await authApi.register({
        email: emailParam,
        password: "",
        name: "",
      });
      addToast({
        type: "success",
        title: "Code sent!",
        message: "Check your email for a new code.",
      });
      setResendCooldown(60);
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Failed to resend",
        message: err.response?.data?.message,
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!emailParam) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Missing email</CardTitle>
            <CardDescription>
              Please register first to verify your email.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild>
              <a href="/register">Go to Register</a>
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
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to <strong>{emailParam}</strong>
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
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="123456"
                maxLength={6}
                className="text-center text-2xl tracking-[0.5em] font-mono"
                {...register("code")}
                ref={(e) => {
                  register("code").ref(e);
                  (codeInputRef as any).current = e;
                }}
              />
              {errors.code && (
                <p className="text-sm text-destructive text-center">
                  {errors.code.message}
                </p>
              )}
            </div>
            <input type="hidden" {...register("email")} />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" /> Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Didn&apos;t receive a code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isResending}
                className="text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
              >
                {isResending
                  ? "Sending..."
                  : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend code"}
              </button>
            </p>
            <p className="text-xs text-muted-foreground text-center">
              <a href="/register" className="hover:underline">
                Use a different email
              </a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
