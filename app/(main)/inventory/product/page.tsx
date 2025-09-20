"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Spinner,
  Badge,
  Image
} from "@chakra-ui/react";
import { ProductModal } from '@/app/components/ProductModal';

type Product = {
  id: number;
  name: string;
  description?: string;
  costPerUnit: number;
  tipo: string;
  sabor?: string;
  imagePath?: string;
  currentQuantity: number;
};

// Componente simplificado usando el patrón de tu código anterior
const ProductImage: React.FC<{ src?: string; alt: string }> = ({ src, alt }) => {
  const [imageError, setImageError] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(src);

  // Manejar error como en tu código anterior que funcionaba
  const handleImageError = () => {
    console.log('Error cargando imagen:', src);
    setImageError(true);
    setCurrentImageUrl('/uploads/default.png'); 
  };

  useEffect(() => {
    setCurrentImageUrl(src);
    setImageError(false);
  }, [src]);

  if (!currentImageUrl || imageError) {
    return (
      <Box
        boxSize="50px"
        bg="gray.100"
        borderRadius="md"
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize="12px"
        color="gray.500"
        border="1px solid #e2e8f0"
      >
        Sin img
      </Box>
    );
  }

  return (
    <Image
      src={currentImageUrl}
      alt={alt}
      boxSize="50px"
      objectFit="cover"
      borderRadius="md"
      border="1px solid #e2e8f0"
      onError={handleImageError}
      onLoad={() => console.log('Imagen cargada correctamente:', currentImageUrl)}
    />
  );
};

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/inventory/products");
      const data = await res.json();
      
      if (data.success && data.products) {
        setProducts(data.products);
      } else {
        console.error('Error en API:', data.error);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este producto?")) return;

    try {
      const res = await fetch(`/api/inventory/products?id=${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setShowEditForm(true);
  };

  if (loading) {
    return (
      <Box p={6}>
        <VStack>
          <Spinner size="xl" />
          <Text>Cargando productos...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between" align="center">
          <Heading size="lg" color="#1a202c">Lista de Productos</Heading>
          <Button 
            colorScheme="green" 
            onClick={() => setShowAddForm(true)}
            fontWeight="600"
          >
            Agregar Producto
          </Button>
        </HStack>

        <Box overflowX="auto">
          <table style={{ 
            width: "100%", 
            borderCollapse: "collapse",
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "8px"
          }}>
            <thead>
              <tr style={{ backgroundColor: "#f7fafc" }}>
                <th style={{ 
                  padding: "12px", 
                  textAlign: "center", 
                  borderBottom: "2px solid #cbd5e0",
                  color: "#2d3748",
                  fontWeight: "600",
                  fontSize: "14px",
                  width: "80px"
                }}>Imagen</th>
                <th style={{ 
                  padding: "12px", 
                  textAlign: "left", 
                  borderBottom: "2px solid #cbd5e0",
                  color: "#2d3748",
                  fontWeight: "600",
                  fontSize: "14px"
                }}>Nombre</th>
                <th style={{ 
                  padding: "12px", 
                  textAlign: "left", 
                  borderBottom: "2px solid #cbd5e0",
                  color: "#2d3748",
                  fontWeight: "600",
                  fontSize: "14px"
                }}>Tipo</th>
                <th style={{ 
                  padding: "12px", 
                  textAlign: "left", 
                  borderBottom: "2px solid #cbd5e0",
                  color: "#2d3748",
                  fontWeight: "600",
                  fontSize: "14px"
                }}>Sabor</th>
                <th style={{ 
                  padding: "12px", 
                  textAlign: "right", 
                  borderBottom: "2px solid #cbd5e0",
                  color: "#2d3748",
                  fontWeight: "600",
                  fontSize: "14px"
                }}>Costo</th>
                <th style={{ 
                  padding: "12px", 
                  textAlign: "center", 
                  borderBottom: "2px solid #cbd5e0",
                  color: "#2d3748",
                  fontWeight: "600",
                  fontSize: "14px"
                }}>Cantidad</th>
                <th style={{ 
                  padding: "12px", 
                  textAlign: "center", 
                  borderBottom: "2px solid #cbd5e0",
                  color: "#2d3748",
                  fontWeight: "600",
                  fontSize: "14px"
                }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, index) => (
                <tr key={p.id} style={{ 
                  borderBottom: "1px solid #e2e8f0",
                  backgroundColor: index % 2 === 0 ? "white" : "#f8fafc"
                }}>
                  <td style={{ 
                    padding: "8px", 
                    textAlign: "center"
                  }}>
                    <ProductImage 
                      src={p.imagePath} 
                      alt={p.name} 
                    />
                  </td>
                  <td style={{ 
                    padding: "12px", 
                    color: "#1a202c",
                    fontWeight: "500"
                  }}>
                    <VStack align="start" gap={1}>
                      <Text fontWeight="600">{p.name}</Text>
                      {p.description && (
                        <Text fontSize="12px" color="#718096">
                          {p.description.length > 50 
                            ? `${p.description.substring(0, 50)}...` 
                            : p.description
                          }
                        </Text>
                      )}
                    </VStack>
                  </td>
                  <td style={{ 
                    padding: "12px", 
                    color: "#4a5568"
                  }}>{p.tipo}</td>
                  <td style={{ 
                    padding: "12px", 
                    color: "#4a5568"
                  }}>{p.sabor || "-"}</td>
                  <td style={{ 
                    padding: "12px", 
                    textAlign: "right",
                    color: "#2d3748",
                    fontWeight: "500"
                  }}>
                    Bs {p.costPerUnit.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <Badge colorScheme={p.currentQuantity > 0 ? "green" : "red"}>
                      {p.currentQuantity}
                    </Badge>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <HStack gap={2} justify="center">
                      <Button size="sm" colorScheme="blue" onClick={() => openEdit(p)}>
                        Editar
                      </Button>
                      <Button size="sm" colorScheme="red" onClick={() => handleDelete(p.id)}>
                        Eliminar
                      </Button>
                    </HStack>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        {products.length === 0 && (
          <Text textAlign="center" color="gray.500">
            No hay productos registrados
          </Text>
        )}
      </VStack>

      <ProductModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={fetchProducts}
        mode="add"
        product={null}
      />

      <ProductModal
        isOpen={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          setEditingProduct(null);
        }}
        onSuccess={fetchProducts}
        mode="edit"
        product={editingProduct}
      />
    </Box>
  );
}