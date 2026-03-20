"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  Button,
  Input,
  Label,
  Textarea,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Spinner,
  Select,
} from "@/components/ui";
import { dropsApi } from "@/lib/api";
import { useToastStore } from "@/lib/store";
import { ArrowLeft, Save, Eye, ExternalLink, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { generateSlug } from "@/lib/api";
import type { Drop } from "@/types";

const categories = [
  { value: "electronics", label: "Electrónicos" },
  { value: "clothing", label: "Ropa y Accesorios" },
  { value: "digital", label: "Productos Digitales" },
  { value: "physical", label: "Productos Físicos" },
  { value: "courses", label: "Cursos y Educación" },
  { value: "other", label: "Otros" },
];

const statusOptions = [
  { value: "DRAFT", label: "Borrador" },
  { value: "COMING_SOON", label: "Próximamente" },
  { value: "LIVE", label: "En Vivo" },
  { value: "SOLD_OUT", label: "Agotado" },
  { value: "ENDED", label: "Finalizado" },
];

const statusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  COMING_SOON: "Próximamente",
  LIVE: "En vivo",
  SOLD_OUT: "Agotado",
  ENDED: "Finalizado",
};

export default function EditDropPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  const dropId = params.id as string;

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    category: "",
    price: 0,
    stock: 0,
    status: "DRAFT" as Drop["status"],
    productImage: "",
    config: {
      theme: { colors: { primary: "#6366f1" } },
      content: {
        headline: "",
        subheadline: "",
        ctaText: "Comprar ahora",
        footerText: "",
      },
      products: { showStock: true, showPrices: true, currency: "USD" },
      social: { instagram: "", twitter: "", tiktok: "" },
    },
  });

  const { data: drop, isLoading } = useQuery({
    queryKey: ["drop", dropId],
    queryFn: () => dropsApi.getById(dropId),
    enabled: !!dropId,
  });

  useEffect(() => {
    if (drop?.data?.drop) {
      const d = drop.data.drop;
      setFormData({
        title: d.title,
        slug: d.slug,
        description: d.description,
        category: d.category,
        price: d.price,
        stock: d.stock,
        status: d.status,
        productImage: d.productImage || "",
        config: d.config || {
          theme: { colors: { primary: "#6366f1" } },
          content: {
            headline: "",
            subheadline: "",
            ctaText: "Comprar ahora",
            footerText: "",
          },
          products: { showStock: true, showPrices: true, currency: "USD" },
          social: { instagram: "", twitter: "", tiktok: "" },
        },
      });
    }
  }, [drop]);

  const handleChange = (field: string, value: unknown) => {
    if (field.includes(".")) {
      const parts = field.split(".");
      setFormData((prev) => {
        const newData = { ...prev };
        let current: Record<string, unknown> = newData as Record<
          string,
          unknown
        >;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]] as Record<string, unknown>;
        }
        current[parts[parts.length - 1]] = value;
        return newData;
      });
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const updateMutation = useMutation({
    mutationFn: () =>
      dropsApi.update(dropId, formData as unknown as Partial<Drop>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drop", dropId] });
      queryClient.invalidateQueries({ queryKey: ["drops"] });
      addToast({ type: "success", title: "Drop actualizado correctamente" });
    },
    onError: (error: unknown) => {
      const err = error as { message?: string };
      addToast({
        type: "error",
        title: "Error al actualizar",
        message: err.message,
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!drop?.data?.drop) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Drop no encontrado</p>
      </div>
    );
  }

  const currentDrop = drop.data.drop;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/drops">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Editar Drop</h1>
          <p className="text-muted-foreground">
            Actualiza los detalles de tu producto
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/drops/${dropId}/analytics`}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <a
              href={`/p/${currentDrop.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Eye className="mr-2 h-4 w-4" />
              Vista previa
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
              <CardDescription>
                Actualiza los detalles básicos de tu producto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    handleChange("title", e.target.value);
                    if (
                      !formData.slug ||
                      formData.slug ===
                        generateSlug(drop?.data?.drop?.title || "")
                    ) {
                      handleChange("slug", generateSlug(e.target.value));
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">/drops/</span>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      handleChange(
                        "slug",
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-"),
                      )
                    }
                    pattern="[a-z0-9-]+"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Solo letras minúsculas, números y guiones
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={formData.category}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleChange("category", e.target.value)
                  }
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formData.status}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleChange("status", e.target.value)
                  }
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Precio e Inventario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productImage">URL de imagen del producto</Label>
                <Input
                  id="productImage"
                  value={formData.productImage}
                  onChange={(e) => handleChange("productImage", e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      handleChange("price", parseFloat(e.target.value) || 0)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      handleChange("stock", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contenido y Marca</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="headline">Titular</Label>
                <Input
                  id="headline"
                  value={formData.config.content?.headline || ""}
                  onChange={(e) =>
                    handleChange("config.content.headline", e.target.value)
                  }
                  placeholder="Título personalizado para la landing page"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subheadline">Subtitular</Label>
                <Input
                  id="subheadline"
                  value={formData.config.content?.subheadline || ""}
                  onChange={(e) =>
                    handleChange("config.content.subheadline", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ctaText">Texto del botón</Label>
                <Input
                  id="ctaText"
                  value={formData.config.content?.ctaText || ""}
                  onChange={(e) =>
                    handleChange("config.content.ctaText", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryColor">Color primario</Label>
                <Input
                  id="primaryColor"
                  type="color"
                  className="h-10"
                  value={formData.config.theme?.colors?.primary || "#6366f1"}
                  onChange={(e) =>
                    handleChange("config.theme.colors.primary", e.target.value)
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.config.social?.instagram || ""}
                    onChange={(e) =>
                      handleChange("config.social.instagram", e.target.value)
                    }
                    placeholder="usuario"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={formData.config.social?.twitter || ""}
                    onChange={(e) =>
                      handleChange("config.social.twitter", e.target.value)
                    }
                    placeholder="usuario"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    value={formData.config.social?.tiktok || ""}
                    onChange={(e) =>
                      handleChange("config.social.tiktok", e.target.value)
                    }
                    placeholder="usuario"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estado</span>
                <Badge
                  variant={
                    formData.status === "LIVE"
                      ? "success"
                      : formData.status === "DRAFT"
                        ? "secondary"
                        : "warning"
                  }
                >
                  {statusLabels[formData.status] || formData.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pedidos</span>
                <span className="font-medium">
                  {currentDrop._count?.orders || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Visitantes
                </span>
                <span className="font-medium">
                  {currentDrop._count?.visitors || 0}
                </span>
              </div>
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
                onClick={() => updateMutation.mutate()}
              >
                <Save className="mr-2 h-4 w-4" />
                {updateMutation.isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/drops">Cancelar</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
