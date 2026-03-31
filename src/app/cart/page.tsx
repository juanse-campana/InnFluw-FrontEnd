"use client";

import { useCartStore } from "@/lib/store/cart";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { dropsApi, discountCodesApi } from "@/lib/api";
import {
  ShoppingCart,
  Trash2,
  ArrowLeft,
  CheckCircle,
  Plus,
  Minus,
  ExternalLink,
  Tag,
  Check,
  X,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import type { DiscountCodeValidation } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const buyerSchema = z.object({
  buyerName: z.string().min(2, "El nombre es requerido"),
  buyerEmail: z.string().email("Email inválido"),
  buyerPhone: z.string().optional(),
});

type BuyerFormData = z.infer<typeof buyerSchema>;

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    addItem,
    removeItem,
    clearCart,
    updateQuantity,
    discountCode,
    discountValue,
    setDiscount,
    clearDiscount,
  } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [discountInput, setDiscountInput] = useState(discountCode || "");
  const [discountValidation, setDiscountValidation] =
    useState<DiscountCodeValidation | null>(null);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BuyerFormData>({
    resolver: zodResolver(buyerSchema),
    defaultValues: {
      buyerName: user?.name || "",
      buyerEmail: user?.email || "",
      buyerPhone: "",
    },
  });

  const subtotal = items.reduce(
    (sum, item) => sum + item.drop.price * item.quantity,
    0,
  );
  const total = Math.max(0, subtotal - discountValue);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Get seller info from first cart item
  const sellerId = items[0]?.drop.userId;
  const sellerName = items[0]?.drop.user?.name;

  // Fetch other drops from the same seller
  const { data: sellerDropsData } = useQuery({
    queryKey: ["drops", "seller", sellerId],
    queryFn: () => dropsApi.getAll({ limit: 50 }),
    enabled: !!sellerId,
  });

  // Filter by seller and exclude items already in cart, limit to 4 suggestions
  const suggestions =
    sellerDropsData?.data?.drops
      ?.filter(
        (drop) =>
          drop.userId === sellerId &&
          !items.some((item) => item.drop.id === drop.id),
      )
      .slice(0, 4) || [];

  const handleValidateDiscount = async () => {
    if (!discountInput.trim()) return;

    setIsValidatingDiscount(true);
    try {
      // Use the first item's drop ID if available
      const dropId = items[0]?.drop.id;
      // Backend stores codes in uppercase, so we need to send uppercase
      const codeToValidate = discountInput.trim().toUpperCase();
      const response = await discountCodesApi.validate(
        codeToValidate,
        dropId,
        subtotal,
      );
      setDiscountValidation(response.data || null);

      if (response.data?.valid && response.data.code) {
        const code = response.data.code;
        let discountAmount = 0;
        if (code.type === "PERCENTAGE") {
          discountAmount = subtotal * (code.value / 100);
        } else if (code.type === "FIXED_AMOUNT") {
          discountAmount = Math.min(code.value, subtotal);
        }
        setDiscount(codeToValidate, discountAmount);
        toast.success("Código de descuento aplicado");
      } else {
        clearDiscount();
        toast.error(response.data?.reason || "Código inválido");
      }
    } catch {
      setDiscountValidation(null);
      clearDiscount();
      toast.error("Error al validar el código");
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setDiscountInput("");
    setDiscountValidation(null);
    clearDiscount();
  };

  const handleCheckout = async (data: BuyerFormData) => {
    setIsProcessing(true);
    setConfirmedEmail(data.buyerEmail);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsProcessing(false);
    setShowConfirmation(true);
    clearCart();

    toast.success("¡Pago procesado con éxito!");
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container max-w-2xl mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">¡Gracias por tu compra!</h1>
            <p className="text-muted-foreground">
              Tu pedido ha sido confirmado. Recibirás un email en{" "}
              <span className="font-medium text-foreground">
                {confirmedEmail}
              </span>{" "}
              con los detalles de tu compra.
            </p>
            <div className="pt-4">
              <Button onClick={() => router.push("/")} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navbar */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                InnFluw
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                    {itemCount}
                  </span>
                )}
              </div>

              {isAuthenticated && user && (
                <Link href={`/account/${user.name}`}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden sm:inline">{user.name}</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Tu Carrito</h1>
          {itemCount > 0 && (
            <span className="text-muted-foreground">
              ({itemCount} {itemCount === 1 ? "artículo" : "artículos"})
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-lg font-semibold">Tu carrito está vacío</h2>
                <p className="text-muted-foreground text-sm">
                  Explora nuestros productos y añade artículos a tu carrito.
                </p>
              </div>
              <Button onClick={() => router.push("/")} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Artículos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.drop.id}
                      className="flex gap-4 pb-4 border-b last:border-0 last:pb-0"
                    >
                      <div className="h-20 w-20 rounded-lg bg-muted overflow-hidden shrink-0">
                        {item.drop.productImage ? (
                          <img
                            src={item.drop.productImage}
                            alt={item.drop.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">
                          {item.drop.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatCurrency(item.drop.price)}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                updateQuantity(item.drop.id, item.quantity - 1)
                              }
                              className="h-8 w-8"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                updateQuantity(item.drop.id, item.quantity + 1)
                              }
                              className="h-8 w-8"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.drop.id)}
                            className="text-destructive hover:text-destructive gap-1 h-8 px-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </Button>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-semibold">
                          {formatCurrency(item.drop.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Seller Suggestions */}
              {suggestions.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      Sugerencias de {sellerName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {suggestions.map((drop) => (
                        <div
                          key={drop.id}
                          className="group rounded-lg border bg-card overflow-hidden"
                        >
                          <div className="aspect-square bg-muted overflow-hidden">
                            {drop.productImage ? (
                              <img
                                src={drop.productImage}
                                alt={drop.title}
                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="p-3 space-y-1">
                            <h4 className="font-medium text-sm truncate">
                              {drop.title}
                            </h4>
                            <p className="text-sm font-semibold">
                              {formatCurrency(drop.price)}
                            </p>
                            <Button
                              onClick={() => {
                                addItem(drop);
                                toast.success("Producto agregado al carrito");
                              }}
                              variant="outline"
                              size="sm"
                              className="w-full gap-1 mt-2"
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Agregar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Checkout Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {discountValue > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        Descuento ({discountCode})
                      </span>
                      <span>-{formatCurrency(discountValue)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span className="text-green-600">Gratis</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>

                  {/* Discount Code Input */}
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="discountCode">Código de descuento</Label>
                    <div className="flex gap-2">
                      <Input
                        id="discountCode"
                        placeholder="DESCUENTO10"
                        value={discountInput}
                        onChange={(e) => setDiscountInput(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleValidateDiscount}
                        disabled={!discountInput.trim() || isValidatingDiscount}
                      >
                        {isValidatingDiscount ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          "Aplicar"
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
                    {discountValue > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveDiscount}
                        className="text-muted-foreground hover:text-destructive h-auto p-0 text-xs"
                      >
                        Quitar descuento
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    Información de contacto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handleSubmit(handleCheckout)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="buyerName">Nombre completo *</Label>
                      <Input
                        id="buyerName"
                        placeholder="Tu nombre"
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

                    <Button
                      type="submit"
                      className="w-full gap-2"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          Proceder al pago
                          <span className="ml-1">
                            — {formatCurrency(total)}
                          </span>
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
