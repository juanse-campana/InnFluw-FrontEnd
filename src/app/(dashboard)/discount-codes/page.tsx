"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { discountCodesApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Spinner, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Input, Alert, AlertDescription } from "@/components/ui";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { useToastStore } from "@/lib/store";

const typeColors = {
  PERCENTAGE: "default",
  FIXED: "secondary",
} as const;

export default function DiscountCodesPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  const [newCode, setNewCode] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: codesData, isLoading } = useQuery({
    queryKey: ["discountCodes"],
    queryFn: discountCodesApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: discountCodesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discountCodes"] });
      addToast({ type: "success", title: "Discount code deleted" });
    },
    onError: () => {
      addToast({ type: "error", title: "Failed to delete code" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discount Codes</h1>
          <p className="text-muted-foreground">Create and manage discount codes</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Code
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Discount Code</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Use the API or Postman to create discount codes. Endpoint: POST /api/v1/discount-codes
            </p>
            <Button variant="outline" onClick={() => setShowForm(false)}>Close</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Codes</CardTitle>
        </CardHeader>
        <CardContent>
          {codesData?.data?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codesData.data.map((code: any) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-medium">{code.code}</TableCell>
                    <TableCell>
                      <Badge variant={typeColors[code.type as keyof typeof typeColors] || "secondary"}>
                        {code.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {code.type === "PERCENTAGE" ? `${code.value}%` : `$${code.value}`}
                    </TableCell>
                    <TableCell>{code.usedCount}/{code.maxUses || "∞"}</TableCell>
                    <TableCell>
                      <Badge variant={code.isActive ? "success" : "destructive"}>
                        {code.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {code.expiresAt ? formatDate(code.expiresAt) : "Never"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(code.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Delete this code?")) {
                            deleteMutation.mutate(code.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No discount codes yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
