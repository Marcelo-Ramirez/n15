'use client';

import React, { useState, useEffect, ChangeEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { Plus, Edit, Trash2, Clock, Upload, Loader2, BarChart } from 'lucide-react';

// Importa componentes Shadcn UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, // <-- SOLUCIONA ERROR DE IMPORTACIÓN
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { toast } from "sonner";

// --- Tipos de Datos (Mantenidos) ---
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

type ProductTableProps = {
  readonly role: 'stockroom' | 'sales';
};

// --- Opciones de Select (Constantes) ---
const productTypes = ["gelatina", "jugo", "postre", "bebida"];
const productFlavors = ["fresa", "limón", "naranja", "uva", "mango", "piña", "mixta"];

// --- Componente ---
export default function ProductTable({ role }: ProductTableProps) {
  // --- Estados (Mantenidos) ---
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de Modals (Centralizados)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'delete' | null>(null);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para formularios
  const [newProduct, setNewProduct] = useState({ type: '', flavor: '' });
  const [editProduct, setEditProduct] = useState({
    type: '', flavor: '', name: '', pricePerUnit: 0, imageUrl: ''
  });

  // --- Lógica de Fetch (Mantenida) ---
  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/system/inventory/products");
      const data = await res.json();
      
      if (data.success && data.products) {
        setProducts(data.products);
      } else {
        throw new Error(data.error || 'Error al cargar productos');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error de conexión');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Lógica de CRUD/Modals (Mantenida) ---
  const handleAddProduct = async () => {
    if (!newProduct.type || !newProduct.flavor) {
      toast.error('Validación fallida', { description: "Por favor completa todos los campos." });
      return;
    }
    const dataToSend = {
      name: `${newProduct.type} de ${newProduct.flavor}`, type: newProduct.type, flavor: newProduct.flavor,
      pricePerUnit: 0, imageUrl: '', currentQuantity: 0
    };
    setLoading(true);
    try {
      const res = await fetch('/api/system/inventory/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataToSend) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      toast.success("Producto Agregado", { description: dataToSend.name });
      closeAllModals();
      await fetchProducts();
    } catch (error) {
      toast.error("Error al agregar", { description: (error as Error).message });
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
      const res = await fetch('/api/image', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        toast.success("Imagen subida");
        return data.imageUrl;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error("Error al subir imagen", { description: (error as Error).message });
      return null;
    } finally {
      setUploadLoading(false);
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct) return;
    let dataToUpdate: Partial<Product> = {};

    if (role === 'stockroom') {
      if (!editProduct.type || !editProduct.flavor) {
        toast.error("Validación fallida", { description: "Por favor completa tipo y sabor." });
        return;
      }
      dataToUpdate = { name: `${editProduct.type} de ${editProduct.flavor}`, type: editProduct.type, flavor: editProduct.flavor };
    } else if (role === 'sales') {
      if (!editProduct.name || editProduct.pricePerUnit <= 0) {
        toast.error("Validación fallida", { description: "Nombre y precio (mayor a 0) son requeridos." });
        return;
      }
      dataToUpdate = { name: editProduct.name, pricePerUnit: editProduct.pricePerUnit, imageUrl: editProduct.imageUrl };
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/system/inventory/products/${editingProduct.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataToUpdate) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      toast.success("Producto Actualizado", { description: dataToUpdate.name });
      closeAllModals();
      await fetchProducts();
    } catch (error) {
      toast.error("Error al actualizar", { description: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/inventory/products?id=${productToDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      toast.success("Producto Eliminado", { description: productToDelete.name });
      closeAllModals();
      await fetchProducts();
    } catch (error) {
      toast.error("Error al eliminar", { description: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    if (role === 'stockroom') {
      setEditProduct({ type: product.type, flavor: product.flavor, name: '', pricePerUnit: 0, imageUrl: '' });
    } else if (role === 'sales') {
      setEditProduct({ type: '', flavor: '', name: product.name, pricePerUnit: product.pricePerUnit, imageUrl: product.imageUrl || '' });
    }
    setModalType('edit');
    setIsModalOpen(true);
  };
  
  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setModalType('delete');
    setIsModalOpen(true);
  };

  const handleHistory = (productId: number) => {
    window.location.href = `/sys/${role}/products/${productId}`;
  };
  
  const closeAllModals = () => {
    setIsModalOpen(false);
    setModalType(null);
    setEditingProduct(null);
    setProductToDelete(null);
  };

  // --- VISTA DE CARGA Y ERROR ---
  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4 border-destructive bg-destructive/10 text-destructive border-2 m-6">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  // --- JSX PRINCIPAL (MIGRADO) ---
  return (
    <div className="p-4 md:p-6 space-y-6">
      
      {/* Header y Botón Añadir */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {role === 'stockroom' ? 'Productos - Stockroom' : 'Productos - Venta'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {role === 'stockroom' ? 'Gestiona el inventario de productos' : 'Consulta y edita productos para venta'}
          </p>
        </div>
        
        {role === 'stockroom' && (
          <Button onClick={() => { setModalType('add'); setIsModalOpen(true); }} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> Agregar Producto
          </Button>
        )}
      </div>

      {/* 1. Products Table Header (Solo en Desktop) */}
      <div className="hidden md:block bg-muted dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700">
        <div 
          className={cn(
            "grid gap-4 items-center text-xs font-semibold text-muted-foreground uppercase",
            role === 'stockroom' ? "grid-cols-[2fr_2fr_1fr_auto]" : "grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]"
          )}
        >
          {role === 'stockroom' ? (
            <>
              <div>Tipo</div>
              <div>Sabor</div>
              <div className="text-center">Cantidad</div>
            </>
          ) : (
            <>
              <div>Nombre</div>
              <div className="text-right">Precio</div>
              <div>Tipo</div>
              <div>Sabor</div>
              <div className="text-center">Cantidad</div>
            </>
          )}
          <div className="text-right">Acciones</div>
        </div>
      </div>

      {/* 2. Products List (Responsivo) */}
      <div className="space-y-3">
        {products.length > 0 ? (
          products.map((product) => (
            <Card key={product.id} className="p-4 shadow-sm hover:shadow-md transition-shadow">
              <div 
                className={cn(
                  "grid gap-y-4 gap-x-2 items-center text-sm",
                  "grid-cols-2", 
                  role === 'stockroom' 
                    ? "md:grid-cols-[2fr_2fr_1fr_auto]" 
                    : "md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]"
                )}
              >
                {/* Datos según el Rol */}
                {role === 'stockroom' ? (
                  <>
                    <div><span className="md:hidden text-muted-foreground text-xs">Tipo: </span><span className="font-medium text-foreground">{product.type}</span></div>
                    <div><span className="md:hidden text-muted-foreground text-xs">Sabor: </span><span className="text-muted-foreground">{product.flavor}</span></div>
                    <div className="text-center">
                      <span className="md:hidden text-muted-foreground text-xs">Cant: </span>
                      <Badge variant={product.currentQuantity > 0 ? "default" : "destructive"} className="w-fit">
                        {product.currentQuantity}
                      </Badge>
                    </div>
                  </>
                ) : (
                  // Rol 'sales'
                  <>
                    <div className="col-span-2 md:col-span-1"><span className="md:hidden text-muted-foreground text-xs">Nombre: </span><span className="font-medium text-foreground">{product.name}</span></div>
                    <div className="text-left md:text-right"><span className="md:hidden text-muted-foreground text-xs">Precio: </span><span className="font-medium text-foreground">${product.pricePerUnit.toFixed(2)}</span></div>
                    <div><span className="md:hidden text-muted-foreground text-xs">Tipo: </span><span className="text-muted-foreground">{product.type}</span></div>
                    <div><span className="md:hidden text-muted-foreground text-xs">Sabor: </span><span className="text-muted-foreground">{product.flavor}</span></div>
                    <div className="text-center">
                      <span className="md:hidden text-muted-foreground text-xs">Cant: </span>
                      <Badge variant={product.currentQuantity > 0 ? "default" : "destructive"} className="w-fit">
                        {product.currentQuantity}
                      </Badge>
                    </div>
                  </>
                )}
                
                {/* Acciones */}
                <div className="col-span-2 md:col-span-1 flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleHistory(product.id)} aria-label="Historial">
                    <Clock className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(product)} aria-label="Editar">
                    <Edit className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product)} aria-label="Eliminar">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center border-dashed border-2">
            <p className="text-muted-foreground">No hay productos registrados</p>
          </Card>
        )}
      </div>

      {/* --- MODALES (ADD, EDIT, DELETE) --- */}
      <Dialog open={isModalOpen} onOpenChange={closeAllModals}>
        <DialogContent className="sm:max-w-[480px]">
          
          {/* ADD Product Modal */}
          {modalType === 'add' && (
            <>
              <DialogHeader>
                <DialogTitle>Añadir Nuevo Producto</DialogTitle>
                <DialogDescription>Completa todos los campos para registrar el nuevo producto.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Tipo */}
                <div className="space-y-2">
                  <Label htmlFor="newType">Tipo</Label>
                  <Select onValueChange={(value: string) => setNewProduct(prev => ({ ...prev, type: value }))} value={newProduct.type}>
                    <SelectTrigger id="newType"><SelectValue placeholder="Selecciona el tipo" /></SelectTrigger>
                    <SelectContent>
                      {productTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {/* Sabor */}
                <div className="space-y-2">
                  <Label htmlFor="newFlavor">Sabor</Label>
                  <Select onValueChange={(value: string) => setNewProduct(prev => ({ ...prev, flavor: value }))} value={newProduct.flavor}>
                    <SelectTrigger id="newFlavor"><SelectValue placeholder="Selecciona el sabor" /></SelectTrigger>
                    <SelectContent>
                      {productFlavors.map(flavor => <SelectItem key={flavor} value={flavor}>{flavor}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeAllModals}>Cancelar</Button>
                <Button onClick={handleAddProduct} disabled={loading} className="bg-green-600 hover:bg-green-700">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Agregar'}
                </Button>
              </DialogFooter>
            </>
          )}

          {/* EDIT Product Modal */}
          {modalType === 'edit' && editingProduct && (
            <>
              <DialogHeader>
                <DialogTitle>Editar Producto</DialogTitle>
                <DialogDescription>{editingProduct.name}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {role === 'stockroom' ? (
                  // Edición para Stockroom (Tipo y Sabor)
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="editType">Tipo</Label>
                      <Select onValueChange={(value: string) => setEditProduct(prev => ({ ...prev, type: value }))} value={editProduct.type}>
                        <SelectTrigger id="editType"><SelectValue placeholder="Selecciona el tipo" /></SelectTrigger>
                        <SelectContent>
                          {productTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editFlavor">Sabor</Label>
                      <Select onValueChange={(value: string) => setEditProduct(prev => ({ ...prev, flavor: value }))} value={editProduct.flavor}>
                        <SelectTrigger id="editFlavor"><SelectValue placeholder="Selecciona el sabor" /></SelectTrigger>
                        <SelectContent>
                          {productFlavors.map(flavor => <SelectItem key={flavor} value={flavor}>{flavor}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  // Campos para Sales (Nombre, Precio, Imagen)
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="editName">Nombre del Producto</Label>
                      <Input id="editName" value={editProduct.name} onChange={(e) => setEditProduct({...editProduct, name: e.target.value})} placeholder="Nombre del producto" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editPrice">Precio por Unidad</Label>
                      <Input id="editPrice" type="number" step="0.01" min="0" value={editProduct.pricePerUnit} onChange={(e) => setEditProduct({...editProduct, pricePerUnit: parseFloat(e.target.value) || 0})} placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Imagen del Producto</Label>
                      <Button onClick={() => fileInputRef.current?.click()} size="sm" className="w-full" variant="outline" disabled={uploadLoading}>
                        {uploadLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        {editProduct.imageUrl ? 'Cambiar Imagen' : 'Subir Imagen'}
                      </Button>
                      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                         const file = e.target.files?.[0];
                         if (file) {
                             const imageUrl = await handleFileUpload(file);
                             if (imageUrl) setEditProduct({...editProduct, imageUrl});
                         }
                      }} />
                      {editProduct.imageUrl && <p className="text-xs text-muted-foreground break-all mt-1">URL: {editProduct.imageUrl}</p>}
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeAllModals}>Cancelar</Button>
                <Button onClick={handleEditProduct} disabled={loading || uploadLoading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Guardar'}
                </Button>
              </DialogFooter>
            </>
          )}

          {/* DELETE Confirmation Modal */}
          {modalType === 'delete' && productToDelete && (
            <>
              <DialogHeader>
                <DialogTitle className="text-destructive">Eliminar Producto</DialogTitle>
                <DialogDescription>
                  {/* ✅ CORREGIDO: Uso de entidad HTML para silenciar ESLint */}
                  ¿Estás seguro que deseas eliminar el producto **&quot;{productToDelete.name}&quot;**?
                </DialogDescription>
              </DialogHeader>
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-md space-y-2">
                 <p className="text-sm font-semibold text-destructive">⚠️ Advertencia</p>
                 <p className="text-xs text-destructive/90">
                   Esta acción es irreversible y eliminará todos los datos relacionados con este producto.
                 </p>
                 <p className="text-sm text-muted-foreground pt-1">
                   Tipo: {productToDelete.type} | Sabor: {productToDelete.flavor}
                 </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeAllModals} disabled={loading}>Cancelar</Button>
                <Button variant="destructive" onClick={handleDeleteConfirm} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Eliminar Definitivamente'}
                </Button>
              </DialogFooter>
            </>
          )}

        </DialogContent>
      </Dialog>
    </div>
  );
}