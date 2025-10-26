"use client";

import React, { useState, useEffect } from "react";
import Image from 'next/image'; // Usar Image de Next.js para optimización
import { Upload, Loader2, X } from 'lucide-react'; // Iconos

// Importa componentes Shadcn UI
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"; // Para el botón de subida

type ImageUploadProps = {
  onUpload: (url: string) => void;
  initialUrl?: string;
};

export const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, initialUrl }) => {
  const [preview, setPreview] = useState(initialUrl || "");
  const [uploading, setUploading] = useState(false);

  // Actualizar preview cuando cambie initialUrl (para editar)
  useEffect(() => {
    setPreview(initialUrl || "");
  }, [initialUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setPreview(data.imageUrl);
        onUpload(data.imageUrl);
      } else {
        console.error("Error subida:", data.error);
        alert("Error al subir imagen: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al subir imagen");
    } finally {
      setUploading(false);
    }
  };
  
  const handleRemovePreview = () => {
    setPreview("");
    onUpload(""); // Notifica al componente padre que la URL ha sido eliminada
  };

  return (
    // Reemplaza VStack con div flex-col y gap
    <div className="flex flex-col space-y-3 items-start"> 
      
      {/* Visualización de Imagen */}
      {preview && (
        <div className="relative h-40 w-40 overflow-hidden rounded-md border border-input shadow-md group">
          <Image 
            src={preview} 
            alt="Preview" 
            fill={true} 
            sizes="(max-width: 640px) 150px, 150px"
            className="object-cover transition-opacity duration-300 group-hover:opacity-80"
          />
          {/* Botón de Remover Imagen (Overlay) */}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemovePreview}
            aria-label="Remove Image"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Campo de Archivo */}
      <div className="w-full max-w-sm">
        {/* Usamos Label para envolver el Input File y darle estilo de botón/área */}
        <Label 
          htmlFor="file-upload" 
          className={cn(
            "w-full flex items-center justify-center p-3 text-sm font-medium border border-input rounded-md cursor-pointer transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            uploading && "opacity-70 pointer-events-none"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {preview ? "Cambiar Imagen" : "Subir Imagen"}
            </>
          )}
          
          <Input 
            id="file-upload"
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            className="sr-only" // Ocultar el input real pero mantener la funcionalidad
            disabled={uploading}
          />
        </Label>
        
      </div>
      
    </div>
  );
};