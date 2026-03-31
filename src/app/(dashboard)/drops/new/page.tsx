"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
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
  Select,
} from "@/components/ui";
import { dropsApi } from "@/lib/api";
import { useToastStore } from "@/lib/store";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const categories = [
  { value: "electronics", label: "Electrónicos" },
  { value: "clothing", label: "Ropa y Accesorios" },
  { value: "digital", label: "Productos Digitales" },
  { value: "physical", label: "Productos Físicos" },
  { value: "courses", label: "Cursos y Educación" },
  { value: "other", label: "Otros" },
];

export default function NewDropPage() {
  const router = useRouter();
  const { addToast } = useToastStore();
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    category: "",
    price: 0,
    stock: 100,
    status: "DRAFT",
    productImage: "",
    config: {
      theme: { colors: { primary: "#6366f1", secondary: "#8b5cf6" } },
      content: {
        headline: "",
        subheadline: "",
        ctaText: "Buy Now",
        footerText: "",
      },
      products: { showStock: true, showPrices: true, currency: "USD" },
      social: { instagram: "", twitter: "", tiktok: "" },
    },
  });

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

  const createMutation = useMutation({
    mutationFn: () =>
      dropsApi.create(
        formData as unknown as Parameters<typeof dropsApi.create>[0],
      ),
    onSuccess: () => {
      addToast({ type: "success", title: "Drop creado exitosamente" });
      router.push("/drops");
    },
    onError: (error: unknown) => {
      const err = error as { message?: string };
      addToast({
        type: "error",
        title: "Error al crear drop",
        message: err.message,
      });
    },
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/drops">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Drop</h1>
          <p className="text-muted-foreground">Configurá tu nuevo product drop</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>
                Ingresá los detalles básicos de tu producto
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
                    if (!formData.slug) {
                      handleChange("slug", generateSlug(e.target.value));
                    }
                  }}
                  placeholder="Mi Producto Increíble"
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
                      handleChange("slug", generateSlug(e.target.value))
                    }
                    placeholder="mi-producto-increible"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Describí tu producto..."
                  rows={4}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
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
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    <option value="DRAFT">Borrador</option>
                    <option value="LIVE">En vivo</option>
                    <option value="PAUSED">Pausado</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Precio e Inventario</CardTitle>
              <CardDescription>
                Configurá el precio y stock de tu producto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productImage">URL de Foto del Producto</Label>
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
              <CardDescription>
                Personalizá el contenido de tu landing page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="headline">Titular</Label>
                <Input
                  id="headline"
                  value={formData.config.content.headline}
                  onChange={(e) =>
                    handleChange("config.content.headline", e.target.value)
                  }
                  placeholder="Tu titular principal"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subheadline">Subtitular</Label>
                <Textarea
                  id="subheadline"
                  value={formData.config.content.subheadline}
                  onChange={(e) =>
                    handleChange("config.content.subheadline", e.target.value)
                  }
                  placeholder="Texto de apoyo"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ctaText">Texto del Botón</Label>
                <Input
                  id="ctaText"
                  value={formData.config.content.ctaText}
                  onChange={(e) =>
                    handleChange("config.content.ctaText", e.target.value)
                  }
                  placeholder="Comprar ahora"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Color Primario</Label>
                  <Input
                    id="primaryColor"
                    type="color"
                    className="h-10"
                    value={formData.config.theme.colors.primary}
                    onChange={(e) =>
                      handleChange(
                        "config.theme.colors.primary",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Color Secundario</Label>
                  <Input
                    id="secondaryColor"
                    type="color"
                    className="h-10"
                    value={formData.config.theme.colors.secondary}
                    onChange={(e) =>
                      handleChange(
                        "config.theme.colors.secondary",
                        e.target.value,
                      )
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <p className="font-medium">
                  {formData.title || "Título del Producto"}
                </p>
                <p className="text-sm text-muted-foreground">
                  /drops/{formData.slug || "slug"}
                </p>
                <Badge
                  variant={formData.status === "LIVE" ? "success" : "secondary"}
                  className="mt-2"
                >
                  {formData.status === "LIVE" ? "En vivo" : formData.status === "DRAFT" ? "Borrador" : formData.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
                onClick={() => createMutation.mutate()}
              >
                <Save className="mr-2 h-4 w-4" />
                {createMutation.isPending ? "Creando..." : "Crear Drop"}
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
