"use client";

import React, { useState, useEffect } from "react";
import { Input, Image, VStack } from "@chakra-ui/react";

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

  return (
    <VStack align="start" gap={3}>
      {preview && (
        <Image 
          src={preview} 
          alt="Preview" 
          boxSize="150px" 
          objectFit="cover" 
          borderRadius="md"
          border="1px solid #e2e8f0"
        />
      )}
      <Input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange}
        bg="white"
        borderColor="#d1d5db"
        _focus={{ borderColor: "#3182ce", boxShadow: "0 0 0 1px #3182ce" }}
        size="sm"
      />
      {uploading && (
        <p style={{ color: "#3182ce", fontSize: "14px" }}>
          Subiendo imagen...
        </p>
      )}
    </VStack>
  );
};