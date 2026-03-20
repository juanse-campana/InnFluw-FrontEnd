"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { dropsApi } from "@/lib/api";
import { Spinner } from "@/components/ui";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DropViewPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = params.id as string;
  const [quantity, setQuantity] = useState(1);

  const { data: dropData, isLoading, error } = useQuery({
    queryKey: ["drop", idOrSlug],
    queryFn: async () => {
      try {
        return await dropsApi.getById(idOrSlug);
      } catch {
        return await dropsApi.getBySlug(idOrSlug);
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !dropData?.data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Drop not found</h1>
          <p className="text-muted-foreground mt-2">This product doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const drop = dropData.data;
  const primaryColor = drop.config?.theme?.colors?.primary || "#6366f1";
  const secondaryColor = drop.config?.theme?.colors?.secondary || "#8b5cf6";
  const headline = drop.config?.content?.headline || "Exclusive Product Launch";
  const subheadline = drop.config?.content?.subheadline || "Don't miss out on this limited offer!";
  const ctaText = drop.config?.content?.ctaText || "Buy Now";

  const handleBuy = () => {
    const token = Buffer.from(JSON.stringify({ dropId: drop.id, quantity })).toString("base64");
    router.push(`/checkout/${token}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <div
              className="aspect-square rounded-2xl bg-cover bg-center flex items-center justify-center"
              style={{
                backgroundColor: secondaryColor,
              }}
            >
              <div className="text-white text-6xl font-bold opacity-30">DROP</div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <span
              className="inline-block w-fit px-3 py-1 rounded-full text-sm font-medium text-white mb-4"
              style={{ backgroundColor: primaryColor }}
            >
              {drop.category}
            </span>

            <h1
              className="text-4xl font-bold tracking-tight sm:text-5xl"
              style={{ color: primaryColor }}
            >
              {drop.title}
            </h1>

            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              {drop.description}
            </p>

            <div className="mt-8">
              <p className="text-4xl font-bold" style={{ color: primaryColor }}>
                ${drop.price.toFixed(2)}
              </p>
              {drop.config?.settings?.showStockCount && (
                <p className="mt-2 text-sm text-gray-500">
                  {drop.stock > 0 ? `${drop.stock} in stock` : "Out of stock"}
                </p>
              )}
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Quantity:</label>
                <select
                  className="rounded-lg border border-gray-300 px-3 py-2"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                >
                  {[...Array(Math.min(drop.stock, 10))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleBuy}
                disabled={drop.stock === 0}
                className="w-full rounded-lg py-4 text-lg font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: primaryColor }}
              >
                {ctaText} - ${(drop.price * quantity).toFixed(2)}
              </button>

              <p className="text-center text-sm text-gray-500">
                Secure checkout powered by InnFluw
              </p>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{drop.visitors}</p>
                <p className="text-sm text-gray-500">Visitors</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{drop.orders}</p>
                <p className="text-sm text-gray-500">Orders</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{drop.views}</p>
                <p className="text-sm text-gray-500">Views</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
