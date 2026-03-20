"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Input, Label, Card, CardContent, CardDescription, CardHeader, CardTitle, Alert, AlertDescription, Spinner } from "@/components/ui";
import { checkoutApi } from "@/lib/api";
import { useToastStore } from "@/lib/store";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToastStore();
  const token = params.token as string;

  const [formData, setFormData] = useState({
    buyerEmail: "",
    buyerName: "",
    buyerPhone: "",
    buyerAddress: "",
    buyerCity: "",
    buyerCountry: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const decodeToken = (token: string) => {
    try {
      return JSON.parse(atob(token));
    } catch {
      return null;
    }
  };

  const orderData = decodeToken(token);

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Invalid Checkout Link</CardTitle>
            <CardDescription>This checkout link is invalid or expired.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await checkoutApi.simulate({
        dropId: orderData.dropId,
        buyerEmail: formData.buyerEmail,
        buyerName: formData.buyerName,
        buyerPhone: formData.buyerPhone,
        buyerAddress: formData.buyerAddress,
        buyerCity: formData.buyerCity,
        buyerCountry: formData.buyerCountry,
      });

      if (response.success) {
        addToast({ type: "success", title: "Order placed!", message: "Check your email for confirmation." });
        router.push("/");
      } else {
        setError(response.message || "Failed to place order");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/50 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Checkout</CardTitle>
            <CardDescription>Complete your purchase</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="buyerEmail">Email *</Label>
                  <Input
                    id="buyerEmail"
                    type="email"
                    required
                    value={formData.buyerEmail}
                    onChange={(e) => handleChange("buyerEmail", e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buyerName">Full Name *</Label>
                  <Input
                    id="buyerName"
                    required
                    value={formData.buyerName}
                    onChange={(e) => handleChange("buyerName", e.target.value)}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buyerPhone">Phone</Label>
                  <Input
                    id="buyerPhone"
                    type="tel"
                    value={formData.buyerPhone}
                    onChange={(e) => handleChange("buyerPhone", e.target.value)}
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buyerAddress">Address</Label>
                  <Input
                    id="buyerAddress"
                    value={formData.buyerAddress}
                    onChange={(e) => handleChange("buyerAddress", e.target.value)}
                    placeholder="123 Main St"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="buyerCity">City</Label>
                    <Input
                      id="buyerCity"
                      value={formData.buyerCity}
                      onChange={(e) => handleChange("buyerCity", e.target.value)}
                      placeholder="New York"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buyerCountry">Country</Label>
                    <Input
                      id="buyerCountry"
                      value={formData.buyerCountry}
                      onChange={(e) => handleChange("buyerCountry", e.target.value)}
                      placeholder="United States"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Spinner className="h-4 w-4 mr-2" /> : null}
                {isLoading ? "Processing..." : "Complete Purchase"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                By completing this purchase you agree to our terms and conditions.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
