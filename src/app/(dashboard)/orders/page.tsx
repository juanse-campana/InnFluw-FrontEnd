"use client";

import { useQuery } from "@tanstack/react-query";
import { checkoutApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, Badge, Spinner, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Input, Button } from "@/components/ui";
import { Eye } from "lucide-react";
import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

const statusColors = {
  PENDING: "warning",
  CONFIRMED: "success",
  CANCELLED: "destructive",
  REFUNDED: "secondary",
} as const;

export default function OrdersPage() {
  const [search, setSearch] = useState("");

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => checkoutApi.getOrders(),
  });

  const filteredOrders = ordersData?.data?.filter((order: any) =>
    order.buyerEmail.toLowerCase().includes(search.toLowerCase()) ||
    order.buyerName.toLowerCase().includes(search.toLowerCase()) ||
    order.id.toLowerCase().includes(search.toLowerCase())
  ) || [];

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
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">View and manage your orders</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Orders</CardTitle>
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}...</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.buyerName}</p>
                        <p className="text-sm text-muted-foreground">{order.buyerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[order.status as keyof typeof statusColors] || "secondary"}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/orders/${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
