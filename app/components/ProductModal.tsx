import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Button,
  Input,
} from "@chakra-ui/react";
import { ImageUpload } from '@/app/components/ImageUpload';

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

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'add' | 'edit';
  product?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode,
  product
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    costPerUnit: "",
    tipo: "",
    sabor: "",
    currentQuantity: "",
    imagePath: ""
  });

  // Función para limpiar el formulario
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      costPerUnit: "",
      tipo: "",
      sabor: "",
      currentQuantity: "",
      imagePath: ""
    });
  };

  // Función para cerrar y limpiar
  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (mode === 'edit' && product && isOpen) {
      // Cargar datos del producto para editar
      setFormData({
        name: product.name,
        description: product.description || "",
        costPerUnit: product.costPerUnit.toString(),
        tipo: product.tipo,
        sabor: product.sabor || "",
        currentQuantity: product.currentQuantity.toString(),
        imagePath: product.imagePath || ""
      });
    } else if (mode === 'add' && isOpen) {
      // Limpiar para agregar nuevo
      resetForm();
    }
  }, [mode, product, isOpen]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.tipo || !formData.costPerUnit) {
      alert("Complete los campos obligatorios: nombre, tipo y costo");
      return;
    }

    try {
      const url = "/api/inventory/products";
      const method = mode === 'add' ? 'POST' : 'PUT';
      const body = {
        ...(mode === 'edit' && { id: product?.id }),
        name: formData.name,
        description: formData.description,
        costPerUnit: formData.costPerUnit,
        tipo: formData.tipo,
        sabor: formData.sabor,
        currentQuantity: formData.currentQuantity || "0",
        imagePath: formData.imagePath
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (data.success) {
        alert(`Producto ${mode === 'add' ? 'agregado' : 'actualizado'} exitosamente`);
        resetForm();
        onSuccess();
        onClose();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    }
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="rgba(0,0,0,0.5)"
      display="flex"
      justifyContent="center"
      alignItems="center"
      zIndex={1000}
    >
      <Box 
        bg="white" 
        p={6} 
        borderRadius="md" 
        width="500px"
        maxHeight="90vh"
        overflowY="auto"
        boxShadow="xl"
        border="1px solid #e2e8f0"
      >
        <Heading size="md" mb={4} color="#2d3748">
          {mode === 'add' ? 'Agregar Producto' : 'Editar Producto'}
        </Heading>
        
        <VStack gap={4}>
          <Box width="100%">
            <label 
              htmlFor="product-image"
              style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                marginBottom: '8px', 
                color: '#2d3748',
                display: 'block'
              }}
            >
              Imagen del Producto
            </label>
            <Box id="product-image">
              <ImageUpload 
                onUpload={(url) => setFormData({ ...formData, imagePath: url })}
                initialUrl={formData.imagePath}
              />
            </Box>
          </Box>

          <Box width="100%">
            <label 
              htmlFor="product-name"
              style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                marginBottom: '8px', 
                color: '#2d3748',
                display: 'block'
              }}
            >
              Nombre *
            </label>
            <Input
              id="product-name"
              placeholder="Ej: Yogurt Natural"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              bg="white"
              borderColor="#d1d5db"
              _focus={{ borderColor: "#3182ce", boxShadow: "0 0 0 1px #3182ce" }}
              color="#1a202c"
            />
          </Box>

          <Box width="100%">
            <label 
              htmlFor="product-description"
              style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                marginBottom: '8px', 
                color: '#2d3748',
                display: 'block'
              }}
            >
              Descripción
            </label>
            <Input
              id="product-description"
              placeholder="Descripción del producto"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              bg="white"
              borderColor="#d1d5db"
              _focus={{ borderColor: "#3182ce", boxShadow: "0 0 0 1px #3182ce" }}
              color="#1a202c"
            />
          </Box>

          <Box width="100%">
            <label 
              htmlFor="product-tipo"
              style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                marginBottom: '8px', 
                color: '#2d3748',
                display: 'block'
              }}
            >
              Tipo *
            </label>
            <Input
              id="product-tipo"
              placeholder="Ej: Bebida, Postre, etc."
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              bg="white"
              borderColor="#d1d5db"
              _focus={{ borderColor: "#3182ce", boxShadow: "0 0 0 1px #3182ce" }}
              color="#1a202c"
            />
          </Box>

          <Box width="100%">
            <label 
              htmlFor="product-sabor"
              style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                marginBottom: '8px', 
                color: '#2d3748',
                display: 'block'
              }}
            >
              Sabor
            </label>
            <Input
              id="product-sabor"
              placeholder="Ej: Fresa, Vainilla, etc."
              value={formData.sabor}
              onChange={(e) => setFormData({ ...formData, sabor: e.target.value })}
              bg="white"
              borderColor="#d1d5db"
              _focus={{ borderColor: "#3182ce", boxShadow: "0 0 0 1px #3182ce" }}
              color="#1a202c"
            />
          </Box>

          <Box width="100%">
            <label 
              htmlFor="product-cost"
              style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                marginBottom: '8px', 
                color: '#2d3748',
                display: 'block'
              }}
            >
              Costo por Unidad *
            </label>
            <Input
              id="product-cost"
              placeholder="Ej: 15.50"
              type="number"
              step="0.01"
              min="0"
              value={formData.costPerUnit}
              onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
              bg="white"
              borderColor="#d1d5db"
              _focus={{ borderColor: "#3182ce", boxShadow: "0 0 0 1px #3182ce" }}
              color="#1a202c"
            />
          </Box>

          <Box width="100%">
            <label 
              htmlFor="product-quantity"
              style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                marginBottom: '8px', 
                color: '#2d3748',
                display: 'block'
              }}
            >
              Cantidad Inicial
            </label>
            <Input
              id="product-quantity"
              placeholder="0"
              type="number"
              min="0"
              value={formData.currentQuantity}
              onChange={(e) => setFormData({ ...formData, currentQuantity: e.target.value })}
              bg="white"
              borderColor="#d1d5db"
              _focus={{ borderColor: "#3182ce", boxShadow: "0 0 0 1px #3182ce" }}
              color="#1a202c"
            />
          </Box>
          
          <HStack pt={4} width="100%" justify="flex-end" gap={3}>
            <Button 
              variant="ghost" 
              onClick={handleClose}
              color="#4a5568"
              _hover={{ bg: "#f7fafc" }}
            >
              Cancelar
            </Button>
            <Button 
              colorScheme={mode === 'add' ? "green" : "blue"} 
              onClick={handleSubmit}
            >
              {mode === 'add' ? 'Agregar' : 'Guardar'}
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};