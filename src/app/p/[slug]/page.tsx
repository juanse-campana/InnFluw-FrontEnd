"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Spinner,
} from "@/components/ui";
import { dropsApi, discountCodesApi, checkoutApi } from "@/lib/api";
import { useToastStore } from "@/lib/store";
import type { Drop, DiscountCodeValidation } from "@/types";
import {
  ShoppingCart,
  Package,
  Tag,
  Check,
  X,
  Instagram,
  Twitter,
} from "lucide-react";

const checkoutSchema = z.object({
  buyerEmail: z.string().email("Email inválido"),
  buyerName: z.string().min(2, "Nombre requerido"),
  buyerPhone: z.string().optional(),
  buyerAddress: z.string().optional(),
  buyerCity: z.string().optional(),
  buyerCountry: z.string().optional(),
  discountCode: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

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

  const [drop, setDrop] = useState<Drop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountValidation, setDiscountValidation] =
    useState<DiscountCodeValidation | null>(null);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [orderCreated, setOrderCreated] = useState<{
    id: string;
    confirmationUrl?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  });

  const discountCodeValue = watch("discountCode");

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

  const validateDiscount = useCallback(async () => {
    if (!discountCodeValue || !drop) return;

    setIsValidatingDiscount(true);
    try {
      const response = await discountCodesApi.validate(
        discountCodeValue,
        drop.id,
        drop.price,
      );
      setDiscountValidation(response.data || null);
    } catch {
      setDiscountValidation(null);
    } finally {
      setIsValidatingDiscount(false);
    }
  }, [discountCodeValue, drop]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (discountCodeValue) {
        validateDiscount();
      } else {
        setDiscountValidation(null);
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [discountCodeValue, validateDiscount]);

  const calculateTotal = () => {
    if (!drop) return 0;
    let total = drop.price;

    if (discountValidation?.valid && discountValidation.code) {
      const code = discountValidation.code;
      if (code.type === "PERCENTAGE") {
        total = total * (1 - code.value / 100);
      } else if (code.type === "FIXED_AMOUNT") {
        total = Math.max(0, total - code.value);
      }
    }

    return total;
  };

  const onSubmit = async (data: CheckoutForm) => {
    if (!drop) return;

    if (discountValidation?.valid === false) {
      addToast({
        type: "error",
        title: "Código inválido",
        message:
          discountValidation.reason || "El código de descuento no es válido",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await checkoutApi.simulate({
        dropId: drop.id,
        discountCode: data.discountCode || undefined,
        buyerEmail: data.buyerEmail,
        buyerName: data.buyerName,
        buyerPhone: data.buyerPhone,
        buyerAddress: data.buyerAddress,
        buyerCity: data.buyerCity,
        buyerCountry: data.buyerCountry,
      });

      if (response.success && response.data?.order) {
        setOrderCreated({
          id: response.data.order.id,
          confirmationUrl: response.data.order.confirmationUrl,
        });
        addToast({
          type: "success",
          title: "¡Orden creada!",
          message: "Revisa tu email para confirmar tu compra",
        });

        if (response.data.order.confirmationUrl) {
          window.location.href = response.data.order.confirmationUrl;
        }
      } else {
        addToast({
          type: "error",
          title: "Error",
          message: response.message || "No se pudo crear la orden",
        });
      }
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Error",
        message: err.message || "No se pudo procesar tu compra",
      });
    } finally {
      setIsSubmitting(false);
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

  const bgColor = theme.colors?.background || "bg-white";
  const textColor = theme.colors?.text || "text-gray-900";
  const primaryColor = theme.colors?.primary || "bg-black";
  const primaryTextColor = theme.colors?.primary ? "text-white" : "text-white";

  const headline = content.headline || drop.title;
  const subheadline = content.subheadline || drop.description;
  const ctaText = content.ctaText || "Comprar ahora";
  const footerText =
    content.footerText ||
    `© ${new Date().getFullYear()} ${drop.user?.name || "InnFluw"}`;

  const isSoldOut = drop.status === "SOLD_OUT" || drop.stock <= 0;
  const isComingSoon = drop.status === "COMING_SOON";
  const isEnded = drop.status === "ENDED";

  if (orderCreated) {
    return (
      <div className={`min-h-screen ${bgColor} ${textColor} py-12 px-4`}>
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">¡Orden creada!</CardTitle>
              <CardDescription>
                Hemos recibido tu solicitud. Revisa tu email para confirmar tu
                compra.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  if (config.checkout?.successRedirect) {
                    window.location.href = `${config.checkout.successRedirect}?orderId=${orderCreated.id}`;
                  }
                }}
                className="w-full"
              >
                Continuar
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} ${textColor}`}>
      <header className="border-b bg-white/50">
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
              <span className="rounded-full bg-muted px-3 py-1 text-sm">
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Completar compra</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="buyerName">Nombre completo *</Label>
                      <Input
                        id="buyerName"
                        placeholder="Juan Pérez"
                        {...register("buyerName")}
                      />
                      {errors.buyerName && (
                        <p className="text-sm text-destructive">
                          {errors.buyerName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="buyerEmail">Email *</Label>
                      <Input
                        id="buyerEmail"
                        type="email"
                        placeholder="tu@email.com"
                        {...register("buyerEmail")}
                      />
                      {errors.buyerEmail && (
                        <p className="text-sm text-destructive">
                          {errors.buyerEmail.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="buyerPhone">Teléfono</Label>
                      <Input
                        id="buyerPhone"
                        type="tel"
                        placeholder="+54 11 1234-5678"
                        {...register("buyerPhone")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="buyerAddress">Dirección</Label>
                      <Input
                        id="buyerAddress"
                        placeholder="Calle 123"
                        {...register("buyerAddress")}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="buyerCity">Ciudad</Label>
                        <Input
                          id="buyerCity"
                          placeholder="Buenos Aires"
                          {...register("buyerCity")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="buyerCountry">País</Label>
                        <Input
                          id="buyerCountry"
                          placeholder="Argentina"
                          {...register("buyerCountry")}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discountCode">Código de descuento</Label>
                      <div className="flex gap-2">
                        <Input
                          id="discountCode"
                          placeholder="DESCUENTO10"
                          {...register("discountCode")}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={validateDiscount}
                          disabled={!discountCodeValue || isValidatingDiscount}
                        >
                          {isValidatingDiscount ? (
                            <Spinner className="h-4 w-4" />
                          ) : (
                            <Tag className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {discountValidation && (
                        <div
                          className={`flex items-center gap-2 text-sm ${
                            discountValidation.valid
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {discountValidation.valid ? (
                            <>
                              <Check className="h-4 w-4" />
                              <span>
                                {discountValidation.code?.type === "PERCENTAGE"
                                  ? `-${discountValidation.code.value}%`
                                  : `-${formatCurrency(
                                      discountValidation.code?.value || 0,
                                      products.currency,
                                    )}`}
                              </span>
                            </>
                          ) : (
                            <>
                              <X className="h-4 w-4" />
                              <span>{discountValidation.reason}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <div className="flex w-full justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>
                        {formatCurrency(calculateTotal(), products.currency)}
                      </span>
                    </div>
                    <Button
                      type="submit"
                      className={`w-full ${primaryColor} ${primaryTextColor}`}
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner className="mr-2 h-4 w-4" />
                          Procesando...
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
              </form>
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

      <footer className="border-t bg-muted/50">
        <div className="mx-auto max-w-4xl px-4 py-8 text-center text-sm text-muted-foreground">
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
