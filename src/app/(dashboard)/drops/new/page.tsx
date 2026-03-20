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
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing & Apparel" },
  { value: "digital", label: "Digital Products" },
  { value: "physical", label: "Physical Goods" },
  { value: "courses", label: "Courses & Education" },
  { value: "other", label: "Other" },
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
      addToast({ type: "success", title: "Drop created successfully" });
      router.push("/drops");
    },
    onError: (error: unknown) => {
      const err = error as { message?: string };
      addToast({
        type: "error",
        title: "Failed to create drop",
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
          <h1 className="text-3xl font-bold tracking-tight">Create New Drop</h1>
          <p className="text-muted-foreground">Set up your new product drop</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details of your product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    handleChange("title", e.target.value);
                    if (!formData.slug) {
                      handleChange("slug", generateSlug(e.target.value));
                    }
                  }}
                  placeholder="My Awesome Product"
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
                    placeholder="my-awesome-product"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Describe your product..."
                  rows={4}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="LIVE">Live</option>
                    <option value="PAUSED">Paused</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
              <CardDescription>
                Set your product price and stock
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD)</Label>
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
              <CardTitle>Content & Branding</CardTitle>
              <CardDescription>
                Customize your landing page content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  value={formData.config.content.headline}
                  onChange={(e) =>
                    handleChange("config.content.headline", e.target.value)
                  }
                  placeholder="Your main headline"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subheadline">Subheadline</Label>
                <Textarea
                  id="subheadline"
                  value={formData.config.content.subheadline}
                  onChange={(e) =>
                    handleChange("config.content.subheadline", e.target.value)
                  }
                  placeholder="Supporting text"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ctaText">Button Text</Label>
                <Input
                  id="ctaText"
                  value={formData.config.content.ctaText}
                  onChange={(e) =>
                    handleChange("config.content.ctaText", e.target.value)
                  }
                  placeholder="Buy Now"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
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
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
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
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <p className="font-medium">
                  {formData.title || "Product Title"}
                </p>
                <p className="text-sm text-muted-foreground">
                  /drops/{formData.slug || "slug"}
                </p>
                <Badge
                  variant={formData.status === "LIVE" ? "success" : "secondary"}
                  className="mt-2"
                >
                  {formData.status}
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
                {createMutation.isPending ? "Creating..." : "Create Drop"}
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/drops">Cancel</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
