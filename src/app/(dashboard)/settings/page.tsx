"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label, Spinner, Alert, AlertDescription } from "@/components/ui";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useToastStore } from "@/lib/store";
import { useState } from "react";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { addToast } = useToastStore();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { name: string }) => authApi.updateProfile(data),
    onSuccess: (response) => {
      if (response.data?.user) {
        setUser(response.data.user);
      }
      addToast({ type: "success", title: "Profile updated successfully" });
      setIsEditing(false);
    },
    onError: () => {
      addToast({ type: "error", title: "Failed to update profile" });
    },
  });

  const onSubmit = (data: { name: string }) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  disabled={!isEditing}
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ""} disabled />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${user?.isVerified ? "bg-green-500" : "bg-yellow-500"}`} />
                  <span className="text-sm">{user?.isVerified ? "Verified" : "Pending verification"}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button type="submit" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? <Spinner className="h-4 w-4 mr-2" /> : null}
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Member since</p>
              <p className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account ID</p>
              <p className="font-medium font-mono text-sm">{user?.id || "N/A"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
