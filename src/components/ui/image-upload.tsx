"use client";

import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui";
import { uploadApi } from "@/lib/api";
import { useToastStore } from "@/lib/store";

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const { addToast } = useToastStore();

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
      ];

      if (!validTypes.includes(file.type)) {
        addToast({
          type: "error",
          title: "Tipo de archivo no permitido",
          message: "Usa archivos: jpg, png, gif, webp, svg",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        addToast({
          type: "error",
          title: "Archivo muy grande",
          message: "El archivo excede el límite de 5MB",
        });
        return;
      }

      setIsUploading(true);
      try {
        const response = await uploadApi.upload(file);
        if (response.success && response.data?.url) {
          setPreview(response.data.url);
          onChange?.(response.data.url);
          addToast({
            type: "success",
            title: "Imagen subida",
            message: "La imagen se ha subido correctamente",
          });
        }
      } catch (error) {
        addToast({
          type: "error",
          title: "Error al subir",
          message: "No se pudo subir la imagen",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, addToast],
  );

  const handleRemove = () => {
    setPreview(null);
    onChange?.("");
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full object-cover"
          />
          {!disabled && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <label
          className={`flex flex-col items-center justify-center aspect-video w-full rounded-lg border-2 border-dashed bg-muted/50 cursor-pointer hover:bg-muted transition-colors ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-2 p-4">
            {isUploading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Subir imagen
                </span>
                <span className="text-xs text-muted-foreground">
                  JPG, PNG, GIF, WebP, SVG (máx 5MB)
                </span>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
          />
        </label>
      )}
    </div>
  );
}
