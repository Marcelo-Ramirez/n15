"use client";

import { useState, useEffect } from "react";
import { Box, Input, Button, Flex, Text } from "@chakra-ui/react";

type Ingredient = { id: number; name: string; };

export default function AddProductForm() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<{ id: number; quantity: number }[]>([]);
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    costPerUnit: 0,
    tipo: "",
    sabor: "",
    imagePath: "",
    currentQuantity: 0
  });

  useEffect(() => {
    // Traer ingredientes desde tu API
    fetch("/api/ingredients")
      .then(res => res.json())
      .then(data => setIngredients(data));
  }, []);

  const handleIngredientChange = (ingredientId: number, quantity: number) => {
    setSelectedIngredients(prev => {
      const exists = prev.find(i => i.id === ingredientId);
      if (exists) {
        return prev.map(i => i.id === ingredientId ? { ...i, quantity } : i);
      }
      return [...prev, { id: ingredientId, quantity }];
    });
  };

  const handleSubmit = async () => {
    const payload = { ...productData, ingredients: selectedIngredients };

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      console.log("Producto creado:", data.product);
    }
  };

  return (
    <Box maxW="600px" mx="auto" p={4}>
      <Input placeholder="Nombre" mb={2} value={productData.name} onChange={e => setProductData({ ...productData, name: e.target.value })} />
      <Input placeholder="Descripción" mb={2} value={productData.description} onChange={e => setProductData({ ...productData, description: e.target.value })} />
      <Input placeholder="Tipo" mb={2} value={productData.tipo} onChange={e => setProductData({ ...productData, tipo: e.target.value })} />
      <Input placeholder="Sabor" mb={2} value={productData.sabor} onChange={e => setProductData({ ...productData, sabor: e.target.value })} />
      <Input placeholder="Costo por unidad" type="number" mb={2} value={productData.costPerUnit} onChange={e => setProductData({ ...productData, costPerUnit: parseFloat(e.target.value) })} />
      <Input placeholder="Cantidad inicial" type="number" mb={4} value={productData.currentQuantity} onChange={e => setProductData({ ...productData, currentQuantity: parseFloat(e.target.value) })} />

      <Text fontWeight="bold" mb={2}>Ingredientes:</Text>
      {ingredients.map(ing => (
        <Flex key={ing.id} mb={2} align="center">
          <Text flex="1">{ing.name}</Text>
          <Input placeholder="Cantidad" type="number" width="100px" onChange={e => handleIngredientChange(ing.id, parseFloat(e.target.value))} />
        </Flex>
      ))}

      <Button mt={4} colorScheme="blue" onClick={handleSubmit}>Crear Producto</Button>
    </Box>
  );
}
