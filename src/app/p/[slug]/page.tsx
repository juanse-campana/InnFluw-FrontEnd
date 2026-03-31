"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
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
  Input,
} from "@/components/ui";
import { dropsApi } from "@/lib/api";
import { useToastStore } from "@/lib/store";
import { useCartStore } from "@/lib/store/cart";
import type { Drop } from "@/types";
import { ShoppingCart, Package, Check, Instagram, Twitter } from "lucide-react";
import Link from "next/link";

function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export default function DropLandingPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { addToast } = useToastStore();
  const { addItem, items } = useCartStore();

  const [drop, setDrop] = useState<Drop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const fetchDrop = async () => {
      try {
        const response = await dropsApi.getBySlug(slug);
        if (response.success && response.data?.drop) {
          setDrop(response.data.drop);
          trackVisitor(response.data.drop.id);
        } else {
          setError("Drop no encontrado");
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar el producto");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrop();
  }, [slug]);

  const trackVisitor = async (dropId: string) => {
    try {
      const sessionId =
        sessionStorage.getItem("sessionId") || crypto.randomUUID();
      sessionStorage.setItem("sessionId", sessionId);
      await dropsApi.trackVisitor({ dropId, sessionId });
    } catch {
      // Silently fail tracking
    }
  };

  const handleAddToCart = async () => {
    if (!drop) return;

    setIsAddingToCart(true);
    try {
      addItem(drop);
      addToast({
        type: "success",
        title: "Producto agregado al carrito",
        message: `${drop.title} fue agregado al carrito`,
      });
      router.push("/cart");
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Error",
        message: err.message || "No se pudo agregar al carrito",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !drop) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Producto no disponible</CardTitle>
            <CardDescription>
              {error || "Este producto no existe o no está disponible"}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const config = drop.config || {};
  const theme = config.theme || {};
  const content = config.content || {};
  const social = config.social || {};
  const products = config.products || {};

  const colors = theme.colors || {};
  const primaryColor = colors.primary || "#6366f1";
  const secondaryColor = colors.secondary || "#8b5cf6";
  const backgroundColor = colors.background || "#ffffff";
  const textColor = colors.text || "#0f172a";

  const headline = content.headline || drop.title;
  const subheadline = content.subheadline || drop.description;
  const ctaText = content.ctaText || "Agregar al carrito";
  const footerText =
    content.footerText ||
    `© ${new Date().getFullYear()} ${drop.user?.name || "InnFluw"}`;

  const isSoldOut = drop.status === "SOLD_OUT" || drop.stock <= 0;
  const isComingSoon = drop.status === "COMING_SOON";
  const isEnded = drop.status === "ENDED";

  return (
    <div className="min-h-screen" style={{ backgroundColor, color: textColor }}>
      <header
        className="border-b"
        style={{
          backgroundColor: `${backgroundColor}e6`,
          borderColor: primaryColor,
        }}
      >
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {config.branding?.logo && (
              <img
                src={config.branding.logo}
                alt="Logo"
                className="h-8 w-auto"
              />
            )}
            <span className="font-bold">{drop.user?.name}</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="relative p-2 hover:bg-muted/50 rounded-md transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  {itemCount}
                </span>
              )}
            </Link>

            {social.instagram && (
              <a
                href={`https://instagram.com/${social.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <Instagram className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            {drop.productImage ? (
              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                <img
                  src={drop.productImage}
                  alt={drop.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square flex items-center justify-center rounded-lg bg-muted">
                <Package className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <div className="mb-2 flex items-center gap-2">
              <span
                className="rounded-full px-3 py-1 text-sm"
                style={{
                  backgroundColor: secondaryColor,
                  color: "#ffffff",
                }}
              >
                {drop.category}
              </span>
              {isSoldOut && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
                  Agotado
                </span>
              )}
              {isComingSoon && (
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
                  Próximamente
                </span>
              )}
              {isEnded && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                  Finalizado
                </span>
              )}
            </div>

            <h1 className="mb-4 text-3xl font-bold">{headline}</h1>

            {subheadline && (
              <p className="mb-6 text-lg text-muted-foreground">
                {subheadline}
              </p>
            )}

            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">
                  {formatCurrency(drop.price, products.currency)}
                </span>
                {products.showPrices === false && (
                  <span className="text-muted-foreground">Precio especial</span>
                )}
              </div>
              {products.showStock !== false && !isSoldOut && !isComingSoon && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {drop.stock} unidades disponibles
                </p>
              )}
            </div>

            {!isSoldOut && !isComingSoon && !isEnded && (
              <div className="space-y-4">
                <Card>
                  <CardFooter className="flex flex-col gap-4">
                    <div className="flex w-full justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>
                        {formatCurrency(drop.price, products.currency)}
                      </span>
                    </div>
                    <Button
                      onClick={handleAddToCart}
                      className="w-full font-semibold px-6 py-3 rounded-lg transition-colors hover:opacity-90"
                      style={{
                        backgroundColor: primaryColor,
                        color: "#ffffff",
                      }}
                      size="lg"
                      disabled={isAddingToCart}
                    >
                      {isAddingToCart ? (
                        <>
                          <Spinner className="mr-2 h-4 w-4" />
                          Agregando...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {ctaText}
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                <p className="text-sm text-muted-foreground text-center">
                  Completá tus datos al finalizar la compra
                </p>
              </div>
            )}

            {isSoldOut && (
              <Alert>
                <AlertDescription className="text-center">
                  Este producto está agotado
                </AlertDescription>
              </Alert>
            )}

            {isComingSoon && (
              <Alert>
                <AlertDescription className="text-center">
                  Este producto estará disponible pronto
                </AlertDescription>
              </Alert>
            )}

            {isEnded && (
              <Alert>
                <AlertDescription className="text-center">
                  Esta promoción ha finalizado
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {config.content?.description && (
          <div className="mt-12">
            <h2 className="mb-4 text-2xl font-bold">Descripción</h2>
            <div className="prose max-w-none">
              <p>{config.content.description}</p>
            </div>
          </div>
        )}
      </main>

      <footer
        className="border-t"
        style={{
          backgroundColor: `${backgroundColor}e6`,
          borderColor: primaryColor,
          color: textColor,
        }}
      >
        <div className="mx-auto max-w-4xl px-4 py-8 text-center text-sm">
          <p>{footerText}</p>
          {social.twitter && (
            <a
              href={`https://twitter.com/${social.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 hover:text-primary"
            >
              <Twitter className="h-4 w-4" />@{social.twitter}
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
