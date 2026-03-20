"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { authApi } from "@/lib/api";
import { Spinner } from "@/components/ui";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setAuth, setUser, logout, isLoading, setLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.getProfile();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
        } else {
          logout();
        }
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [setAuth, setUser, logout, setLoading]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return <>{children}</>;
}
