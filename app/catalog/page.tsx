'use client';

import { useState, useEffect, useMemo } from "react";
import Image from 'next/image';
import { Search, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicFooter } from "@/components/layout/PublicFooter";
// --- Tipos de Datos (Mantenidos) ---
interface Product {
  id: number;
  name: string;
  type: string;
  flavor: string;
  pricePerUnit: number;
  currentQuantity: number;
  imageUrl?: string | null;
  description?: string | null;
}

// ✅ CORREGIDO: Interfaz extendida para incluir todas las propiedades de Producto
interface ProductCardProps extends Product {
    onAddToCart: (id: number) => void;
}

// --- COMPONENTE TARJETA DE PRODUCTO (Corregido) ---
// Ahora recibe el 'id' correctamente de las props extendidas.
const ProductCard = (props: ProductCardProps) => {
    const { id, name, description, flavor, pricePerUnit, currentQuantity, imageUrl, onAddToCart } = props;
    const isOutOfStock = currentQuantity === 0;

    return (
        <Card className="w-full max-w-xs sm:max-w-[320px] md:max-w-md shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between overflow-hidden">
          
          {/* Imagen y Metadatos (usando props.imageUrl, etc.) */}
          <div className="relative h-48 bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden flex items-center justify-center">
            {/* ... (renderizado de imagen sin cambios) ... */}
            {imageUrl ? (
              <Image 
                src={imageUrl} 
                alt={name} 
                fill={true} 
                style={{ objectFit: 'contain' }}
                sizes="(max-width: 768px) 90vw, 320px"
              />
            ) : (
              <p className="text-muted-foreground text-sm">Imagen no disponible</p>
            )}
          </div>
          
          <CardHeader className="pt-4 pb-2 space-y-1">
            <CardTitle className="text-xl font-bold">{name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {description || `Delicioso sabor ${flavor}`}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-grow pb-4">
             <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Tipo: <span className="font-semibold">{flavor}</span></p>
             </div>
          </CardContent>

          {/* Footer de Precio y Acción */}
          <div className="px-6 pb-6 pt-0 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-2xl font-extrabold text-primary">
                Bs {pricePerUnit.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                Stock: {currentQuantity}
              </p>
            </div>
            
            <Button 
              onClick={() => onAddToCart(id)} // ✅ USO DE 'id' CORREGIDO
              disabled={isOutOfStock}
              className="w-full"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isOutOfStock ? 'Agotado' : 'Añadir al Carrito'}
            </Button>
          </div>

        </Card>
    );
};
// --- FIN COMPONENTE TARJETA DE PRODUCTO ---


export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchError, setFetchError] = useState<string | null>(null); 
  
  // ... (useEffect para fetchProducts - lógica mantenida) ...

  useEffect(() => {
    const fetchProducts = async () => {
      // ... (fetch logic remains the same) ...
      try {
        setLoading(true);
        setFetchError(null);
        const res = await fetch("/api/inventory/products"); 
        if (!res.ok) {
           const errorData = await res.json().catch(() => ({}));
           throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        
        if (data.success && Array.isArray(data.products)) {
           setProducts(data.products); 
        } else {
            setProducts([]); 
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Error desconocido al cargar productos";
        setFetchError(errorMsg); 
        setProducts([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ✅ CORREGIDO: Lógica extraída de la operación ternaria anidada (Error SonarQube)
  const filteredProducts = useMemo(() => {
    // 1. Exclusión (mantener solo gomitas, eliminar pastelería/panadería)
    const excludedProducts = products.filter(
        (p) => !/galleta|pan|torta/i.test(p.name)
    );
    
    // 2. Filtrado por término de búsqueda
    if (!searchTerm) {
        return excludedProducts;
    }

    const term = searchTerm.toLowerCase();
    
    return excludedProducts.filter(
      (p) => 
        p.name.toLowerCase().includes(term) ||
        p.type.toLowerCase().includes(term) ||
        p.flavor.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);


  // --- TODO: Lógica de Carrito (Placeholder) ---
  const handleAddToCart = (productId: number) => {
      console.log(`Producto ${productId} añadido al carrito.`);
      // Implementar lógica de adición al carrito aquí.
  };


  return (
    // ... (El resto del JSX se mantiene igual, usando el componente ProductCard corregido) ...
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* <PublicHeader /> */}
      
      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado y Búsqueda */}
        <div className="text-center mb-10 space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Nuestro Catálogo de Gomitas
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre nuestra deliciosa colección de productos.
          </p>
          
          {/* Búsqueda */}
          <div className="flex max-w-md mx-auto relative">
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-16 h-11"
            />
            <Button className="absolute right-0 h-11 w-14" disabled={loading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* --- Renderizado Condicional --- */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Cargando productos...</p>
          </div>
        ) : fetchError ? ( 
          <div className="text-center py-12 p-4 border border-destructive bg-destructive/10 text-destructive rounded-md">
            <p className="font-bold">Error al cargar productos:</p>
            <p className="text-sm">{fetchError}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>Recargar Página</Button>
          </div>
        ) : filteredProducts.length === 0 ? ( 
          <p className="text-center text-muted-foreground py-12 text-lg">
            {searchTerm ? `No se encontraron productos para "${searchTerm}"` : "No hay productos disponibles"}
          </p>
        ) : (
          /* Grid para Productos */
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center max-w-6xl mx-auto"
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product} // Pasa todas las propiedades de 'product' (incluyendo id)
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>

      <PublicFooter />
    </div>
  );
}