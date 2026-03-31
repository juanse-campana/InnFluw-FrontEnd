"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { dropsApi } from "@/lib/api";
import type { Drop } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, ShoppingBag } from "lucide-react";

export default function AccountPage() {
  const params = useParams();
  const router = useRouter();
  const sellerName = params.name as string;

  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrops = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await dropsApi.getAll({ status: "LIVE" });
        if (response.success && response.data) {
          // Filter drops by seller name (case-insensitive)
          const sellerDrops = response.data.drops.filter(
            (drop) =>
              drop.user?.name?.toLowerCase() === sellerName.toLowerCase(),
          );
          setDrops(sellerDrops);
        }
      } catch (err) {
        setError("Error al cargar los productos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDrops();
  }, [sellerName]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              aria-label="Volver al carrito"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">{sellerName}</h1>
          </div>

          {/* Sobre mí section */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h2 className="text-sm font-medium text-muted-foreground mb-1">
              Sobre mí
            </h2>
            <p className="text-muted-foreground">
              Vendedor verificado en InnFluw. Encuentra los mejores productos en
              esta colección.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive">{error}</p>
          </div>
        ) : drops.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              No hay productos disponibles
            </h2>
            <p className="text-muted-foreground max-w-md">
              Este vendedor aún no tiene productos activos. Vuelve más tarde
              para ver nuevas incorporación.
            </p>
          </div>
        ) : (
          /* Products Grid */
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {drops.length} producto{drops.length !== 1 ? "s" : ""}{" "}
                disponible
                {drops.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {drops.map((drop) => (
                <Card key={drop.id} className="overflow-hidden flex flex-col">
                  <div className="aspect-square relative bg-muted">
                    {drop.productImage ? (
                      <img
                        src={drop.productImage}
                        alt={drop.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="flex flex-col flex-1 p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                      {drop.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2 flex-1">
                      {drop.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xl font-bold">
                        {formatCurrency(drop.price)}
                      </span>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => router.push(`/p/${drop.slug}`)}
                      >
                        Ver producto
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
