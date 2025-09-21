// components/ProductTable.tsx
"use client";

import React, { useState, useEffect, ChangeEvent, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Spinner,
  Badge,
  Input,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { NativeSelectRoot, NativeSelectField } from "@chakra-ui/react/native-select";
import { FiPlus, FiEdit, FiTrash2, FiClock, FiUpload } from 'react-icons/fi';

// Define los campos que el componente manejará
type Product = {
  id: number;
  name: string;
  flavor: string;
  type: string;
  imageUrl?: string | null;
  pricePerUnit: number;
  currentQuantity: number;
  createdAt?: string | null;
  updatedAt?: string | null;
};

// Define las props que el componente ProductTable aceptará
type ProductTableProps = {
  role: 'stockroom' | 'sale';
};

export default function ProductTable({ role }: ProductTableProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para formularios
  const [newProduct, setNewProduct] = useState({
    type: '',
    flavor: ''
  });
  
  const [editProduct, setEditProduct] = useState({
    type: '',
    flavor: '',
    name: '',
    pricePerUnit: 0,
    imageUrl: ''
  });

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
        setError('Error al cargar productos');
      }
    } catch (error) {
      console.error("Error:", error);
      setProducts([]);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.type || !newProduct.flavor) {
      alert("Por favor completa todos los campos");
      return;
    }

    const dataToSend = {
      name: `${newProduct.type} de ${newProduct.flavor}`,
      type: newProduct.type,
      flavor: newProduct.flavor,
      pricePerUnit: 0,
      imageUrl: '',
      currentQuantity: 0
    };

    try {
      setLoading(true);
      const res = await fetch('/api/inventory/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      const data = await res.json();
      
      if (data.success) {
        setShowAddModal(false);
        setNewProduct({ type: '', flavor: '' });
        await fetchProducts();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al agregar producto");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return null;

    setUploadLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/image', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      
      if (data.success) {
        return data.imageUrl;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al subir imagen");
      return null;
    } finally {
      setUploadLoading(false);
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct) return;

    let dataToUpdate: any = {};

    if (role === 'stockroom') {
      if (!editProduct.type || !editProduct.flavor) {
        alert("Por favor completa todos los campos");
        return;
      }
      dataToUpdate = {
        name: `${editProduct.type} de ${editProduct.flavor}`,
        type: editProduct.type,
        flavor: editProduct.flavor
      };
    } else if (role === 'sale') {
      if (!editProduct.name || editProduct.pricePerUnit <= 0) {
        alert("Por favor completa todos los campos correctamente");
        return;
      }
      dataToUpdate = {
        name: editProduct.name,
        pricePerUnit: editProduct.pricePerUnit,
        imageUrl: editProduct.imageUrl
      };
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/inventory/products?id=${editingProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToUpdate)
      });

      const data = await res.json();
      
      if (data.success) {
        setShowEditModal(false);
        setEditingProduct(null);
        await fetchProducts();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al actualizar producto");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/inventory/products?id=${productToDelete.id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      
      if (data.success) {
        setShowDeleteModal(false);
        setProductToDelete(null);
        await fetchProducts();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al eliminar producto");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    if (role === 'stockroom') {
      setEditProduct({
        type: product.type,
        flavor: product.flavor,
        name: '',
        pricePerUnit: 0,
        imageUrl: ''
      });
    } else if (role === 'sale') {
      setEditProduct({
        type: '',
        flavor: '',
        name: product.name,
        pricePerUnit: product.pricePerUnit,
        imageUrl: product.imageUrl || ''
      });
    }
    setShowEditModal(true);
  };

  const handleHistory = (productId: number) => {
    window.location.href = `/sys/stockroom/products/${productId}/history`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <VStack gap={4}>
          <Spinner size="lg" color="blue.500" />
          <Text>Cargando productos...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Box 
          bg="red.50" 
          border="1px" 
          borderColor="red.200" 
          borderRadius="md" 
          p={4}
          color="red.700"
        >
          {error}
        </Box>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Box>
            <Heading size="lg" mb={2}>
              {role === 'stockroom' ? 'Productos - Stockroom' : 'Productos - Venta'}
            </Heading>
            <Text color="gray.600">
              {role === 'stockroom' ? 'Gestiona el inventario de productos' : 'Consulta y edita productos para venta'}
            </Text>
          </Box>
          <HStack gap={3}>
            {role === 'stockroom' && (
              <Button
                colorScheme="green"
                onClick={() => setShowAddModal(true)}
              >
                <HStack gap={2}>
                  <FiPlus />
                  <Text>Agregar Producto</Text>
                </HStack>
              </Button>
            )}
          </HStack>
        </HStack>

        {/* Products Table Header */}
        <Box
          bg="gray.50"
          p={4}
          borderRadius="lg"
          border="1px"
          borderColor="gray.200"
        >
          <Grid 
            templateColumns={role === 'stockroom' ? "1fr 1fr auto" : "2fr 1fr 1fr 1fr 1fr auto"} 
            gap={4} 
            alignItems="center"
          >
            {role === 'stockroom' ? (
              <>
                <GridItem>
                  <Text fontWeight="bold" fontSize="sm" color="gray.700">Tipo</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold" fontSize="sm" color="gray.700">Sabor</Text>
                </GridItem>
              </>
            ) : (
              <>
                <GridItem>
                  <Text fontWeight="bold" fontSize="sm" color="gray.700">Nombre</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold" fontSize="sm" color="gray.700">Precio</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold" fontSize="sm" color="gray.700">Tipo</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold" fontSize="sm" color="gray.700">Sabor</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold" fontSize="sm" color="gray.700">Cantidad</Text>
                </GridItem>
              </>
            )}
            <GridItem>
              <Text fontWeight="bold" fontSize="sm" color="gray.700">Acciones</Text>
            </GridItem>
          </Grid>
        </Box>

        {/* Products List */}
        <VStack gap={2} align="stretch">
          {products.map((product) => (
            <Box
              key={product.id}
              bg="white"
              p={4}
              borderRadius="lg"
              boxShadow="sm"
              border="1px"
              borderColor="gray.200"
              _hover={{ boxShadow: "md" }}
              transition="all 0.2s"
            >
              <Grid 
                templateColumns={role === 'stockroom' ? "1fr 1fr auto" : "2fr 1fr 1fr 1fr 1fr auto"} 
                gap={4} 
                alignItems="center"
              >
                {role === 'stockroom' ? (
                  <>
                    <GridItem>
                      <Text fontWeight="medium">{product.type}</Text>
                    </GridItem>
                    <GridItem>
                      <Text color="gray.500">{product.flavor}</Text>
                    </GridItem>
                  </>
                ) : (
                  <>
                    <GridItem>
                      <Text fontWeight="medium">{product.name}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="medium">${product.pricePerUnit.toFixed(2)}</Text>
                    </GridItem>
                    <GridItem>
                      <Text>{product.type}</Text>
                    </GridItem>
                    <GridItem>
                      <Text color="gray.500">{product.flavor}</Text>
                    </GridItem>
                    <GridItem>
                      <Badge colorScheme={product.currentQuantity > 0 ? "green" : "red"}>
                        {product.currentQuantity}
                      </Badge>
                    </GridItem>
                  </>
                )}
                <GridItem>
                  <HStack gap={2}>
                    <Button
                      size="sm"
                      colorScheme="gray"
                      onClick={() => handleHistory(product.id)}
                    >
                      <HStack gap={1}>
                        <FiClock />
                        <Text>Historial</Text>
                      </HStack>
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => openEdit(product)}
                    >
                      <HStack gap={1}>
                        <FiEdit />
                        <Text>Editar</Text>
                      </HStack>
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDeleteProduct(product)}
                    >
                      <HStack gap={1}>
                        <FiTrash2 />
                        <Text>Eliminar</Text>
                      </HStack>
                    </Button>
                  </HStack>
                </GridItem>
              </Grid>
            </Box>
          ))}
        </VStack>

        {products.length === 0 && (
          <Box 
            bg="white"
            p={8} 
            textAlign="center"
            borderRadius="lg"
            boxShadow="md"
            border="1px"
            borderColor="gray.200"
          >
            <Text color="gray.500">No hay productos registrados</Text>
          </Box>
        )}

        {/* Add Product Modal - Solo para Stockroom */}
        {showAddModal && role === 'stockroom' && (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={1000}
          >
            <Box
              bg="white"
              p={6}
              borderRadius="lg"
              boxShadow="xl"
              maxW="400px"
              w="90%"
            >
              <VStack gap={4} align="stretch">
                <Heading size="md">Agregar Nuevo Producto</Heading>
                
                <VStack gap={4} align="stretch">
                  <Box>
                    <Text fontWeight="medium" mb={2}>Tipo</Text>
                    <NativeSelectRoot>
                      <NativeSelectField
                        value={newProduct.type}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewProduct({...newProduct, type: e.target.value})}
                      >
                        <option value="">Selecciona el tipo</option>
                        <option value="gelatina">Gelatina</option>
                        <option value="jugo">Jugo</option>
                        <option value="postre">Postre</option>
                        <option value="bebida">Bebida</option>
                      </NativeSelectField>
                    </NativeSelectRoot>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="medium" mb={2}>Sabor</Text>
                    <NativeSelectRoot>
                      <NativeSelectField
                        value={newProduct.flavor}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewProduct({...newProduct, flavor: e.target.value})}
                      >
                        <option value="">Selecciona el sabor</option>
                        <option value="fresa">Fresa</option>
                        <option value="limón">Limón</option>
                        <option value="naranja">Naranja</option>
                        <option value="uva">Uva</option>
                        <option value="mango">Mango</option>
                        <option value="piña">Piña</option>
                        <option value="mixta">Mixta</option>
                      </NativeSelectField>
                    </NativeSelectRoot>
                  </Box>
                </VStack>
                
                <HStack gap={3} justify="flex-end" mt={4}>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewProduct({ type: '', flavor: '' });
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    colorScheme="green"
                    onClick={handleAddProduct}
                  >
                    Agregar
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </Box>
        )}

        {/* Edit Product Modal */}
        {showEditModal && editingProduct && (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={1000}
          >
            <Box
              bg="white"
              p={6}
              borderRadius="lg"
              boxShadow="xl"
              maxW="500px"
              w="90%"
            >
              <VStack gap={4} align="stretch">
                <Heading size="md">Editar Producto</Heading>
                
                <VStack gap={4} align="stretch">
                  {role === 'stockroom' ? (
                    <>
                      <Box>
                        <Text fontWeight="medium" mb={2}>Tipo</Text>
                        <NativeSelectRoot>
                          <NativeSelectField
                            value={editProduct.type}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => setEditProduct({...editProduct, type: e.target.value})}
                          >
                            <option value="gelatina">Gelatina</option>
                            <option value="jugo">Jugo</option>
                            <option value="postre">Postre</option>
                            <option value="bebida">Bebida</option>
                          </NativeSelectField>
                        </NativeSelectRoot>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="medium" mb={2}>Sabor</Text>
                        <NativeSelectRoot>
                          <NativeSelectField
                            value={editProduct.flavor}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => setEditProduct({...editProduct, flavor: e.target.value})}
                          >
                            <option value="fresa">Fresa</option>
                            <option value="limón">Limón</option>
                            <option value="naranja">Naranja</option>
                            <option value="uva">Uva</option>
                            <option value="mango">Mango</option>
                            <option value="piña">Piña</option>
                            <option value="mixta">Mixta</option>
                          </NativeSelectField>
                        </NativeSelectRoot>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Box>
                        <Text fontWeight="medium" mb={2}>Nombre del Producto</Text>
                        <Input
                          value={editProduct.name}
                          onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                          placeholder="Nombre del producto"
                        />
                      </Box>

                      <Box>
                        <Text fontWeight="medium" mb={2}>Precio por Unidad</Text>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editProduct.pricePerUnit}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setEditProduct({...editProduct, pricePerUnit: parseFloat(e.target.value) || 0})}
                          placeholder="0.00"
                        />
                      </Box>

                      <Box>
                        <Text fontWeight="medium" mb={2}>Imagen del Producto</Text>
                        <VStack gap={3} align="stretch">
                          {editProduct.imageUrl && (
                            <Box
                              bg="gray.50"
                              p={3}
                              borderRadius="md"
                              border="1px"
                              borderColor="gray.200"
                            >
                              <Text fontSize="sm" color="gray.600">Imagen actual:</Text>
                              <Text fontSize="sm" fontWeight="medium">{editProduct.imageUrl}</Text>
                            </Box>
                          )}
                          <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            isLoading={uploadLoading}
                            loadingText="Subiendo..."
                          >
                            <HStack gap={2}>
                              <FiUpload />
                              <Text>{editProduct.imageUrl ? 'Cambiar Imagen' : 'Subir Imagen'}</Text>
                            </HStack>
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const imageUrl = await handleFileUpload(file);
                                if (imageUrl) {
                                  setEditProduct({...editProduct, imageUrl});
                                }
                              }
                            }}
                          />
                        </VStack>
                      </Box>
                    </>
                  )}
                </VStack>
                
                <HStack gap={3} justify="flex-end" mt={4}>
                  <Button
                    variant="ghost"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={handleEditProduct}
                  >
                    Guardar
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </Box>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && productToDelete && (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={1000}
          >
            <Box
              bg="white"
              p={6}
              borderRadius="lg"
              boxShadow="xl"
              maxW="500px"
              w="90%"
            >
              <VStack gap={4} align="stretch">
                <Heading size="md" color="red.600">Eliminar Producto</Heading>
                
                <VStack gap={3} align="stretch">
                  <Text>
                    ¿Estás seguro que deseas eliminar el producto <strong>"{productToDelete.name}"</strong>?
                  </Text>
                  
                  <Box
                    bg="red.50"
                    border="1px"
                    borderColor="red.200"
                    borderRadius="md"
                    p={4}
                  >
                    <VStack gap={2} align="stretch">
                      <Text fontWeight="bold" color="red.700" fontSize="sm">
                        ⚠️ Advertencia
                      </Text>
                      <Text color="red.600" fontSize="sm">
                        Esta acción es <strong>irreversible</strong> y eliminará todos los datos 
                        relacionados con este producto.
                      </Text>
                    </VStack>
                  </Box>
                  
                  <Text fontSize="sm" color="gray.600">
                    Tipo: {productToDelete.type} | Sabor: {productToDelete.flavor}
                  </Text>
                </VStack>
                
                <HStack gap={3} justify="flex-end" mt={4}>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setProductToDelete(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={handleDeleteConfirm}
                  >
                    Eliminar Definitivamente
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </Box>
        )}
      </VStack>
    </Box>
  );
}