"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Button, Input, Label, Textarea, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Spinner, Select } from "@/components/ui";
import { dropsApi } from "@/lib/api";
import { useToastStore } from "@/lib/store";
import { ArrowLeft, Save, Eye } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const categories = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing & Apparel" },
  { value: "digital", label: "Digital Products" },
  { value: "physical", label: "Physical Goods" },
  { value: "courses", label: "Courses & Education" },
  { value: "other", label: "Other" },
];

export default function EditDropPage() {
  const params = useParams();
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
    status: "DRAFT" as "DRAFT" | "LIVE" | "PAUSED" | "SOLD_OUT",
    config: {
      theme: { colors: { primary: "#6366f1", secondary: "#8b5cf6" } },
      content: { headline: "", subheadline: "", ctaText: "Buy Now" },
      settings: { showStockCount: true },
    },
  });

  const { data: drop, isLoading } = useQuery({
    queryKey: ["drop", dropId],
    queryFn: () => dropsApi.getById(dropId),
    enabled: !!dropId,
  });

  useEffect(() => {
    if (drop?.data) {
      setFormData({
        title: drop.data.title,
        slug: drop.data.slug,
        description: drop.data.description,
        category: drop.data.category,
        price: drop.data.price,
        stock: drop.data.stock,
        status: drop.data.status,
        config: drop.data.config || {
          theme: { colors: { primary: "#6366f1", secondary: "#8b5cf6" } },
          content: { headline: "", subheadline: "", ctaText: "Buy Now" },
          settings: { showStockCount: true },
        },
      });
    }
  }, [drop]);

  const handleChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const parts = field.split(".");
      setFormData((prev) => {
        const newData = { ...prev };
        let current: any = newData;
        for (let i = 0; i < parts.length - 1; i++) {
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
        return newData;
      });
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const updateMutation = useMutation({
    mutationFn: () => dropsApi.update(dropId, formData as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drop", dropId] });
      addToast({ type: "success", title: "Drop updated successfully" });
    },
    onError: (error: any) => {
      addToast({ type: "error", title: "Failed to update drop", message: error.response?.data?.message });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!drop?.data) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Drop not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/drops">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Edit Drop</h1>
          <p className="text-muted-foreground">Update your product drop</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/drops/${drop.data.id}/view`} target="_blank">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update the basic details of your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={formData.title} onChange={(e) => handleChange("title", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">/drops/</span>
                  <Input id="slug" value={formData.slug} onChange={(e) => handleChange("slug", e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={4} value={formData.description} onChange={(e) => handleChange("description", e.target.value)} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onChange={(e: any) => handleChange("category", e.target.value)}>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onChange={(e: any) => handleChange("status", e.target.value)}>
                    <option value="DRAFT">Draft</option>
                    <option value="LIVE">Live</option>
                    <option value="PAUSED">Paused</option>
                    <option value="SOLD_OUT">Sold Out</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input id="price" type="number" step="0.01" min="0" value={formData.price} onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input id="stock" type="number" min="0" value={formData.stock} onChange={(e) => handleChange("stock", parseInt(e.target.value) || 0)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content & Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input id="headline" value={formData.config.content.headline} onChange={(e) => handleChange("config.content.headline", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subheadline">Subheadline</Label>
                <Textarea id="subheadline" rows={2} value={formData.config.content.subheadline} onChange={(e) => handleChange("config.content.subheadline", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ctaText">Button Text</Label>
                <Input id="ctaText" value={formData.config.content.ctaText} onChange={(e) => handleChange("config.content.ctaText", e.target.value)} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <Input id="primaryColor" type="color" className="h-10" value={formData.config.theme.colors.primary} onChange={(e) => handleChange("config.theme.colors.primary", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <Input id="secondaryColor" type="color" className="h-10" value={formData.config.theme.colors.secondary} onChange={(e) => handleChange("config.theme.colors.secondary", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={formData.status === "LIVE" ? "success" : "secondary"}>
                {formData.status}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button type="submit" className="w-full" disabled={updateMutation.isPending} onClick={() => updateMutation.mutate()}>
                <Save className="mr-2 h-4 w-4" />
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
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
