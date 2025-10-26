'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, BarChart, Clock, Loader2 } from 'lucide-react';

// Importa componentes Shadcn UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner'; // Notificaciones

// --- Tipos de Datos (Mantenidos) ---
interface Ingredient {
  id: number;
  name: string;
  unit: string;
  currentQuantity: number;
  pricePerUnit: number;
  provider: string;
  createdAt: string;
}

type ModalType = 'add' | 'edit' | 'delete' | null;

// --- Componente ---
export default function IngredientsPage() {
  // Estados de Fetch y Lista
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de Modals y CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  
  const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(null);
  const [ingredientToEdit, setIngredientToEdit] = useState<Ingredient | null>(null);
  
  const [newIngredient, setNewIngredient] = useState({ name: '', unit: '', pricePerUnit: '', provider: '' });
  const [editIngredient, setEditIngredient] = useState({ name: '', unit: '', pricePerUnit: '', provider: '' });
  
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // --- FETCH DE INGREDIENTES (Mantenida) ---
  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await fetch('/api/system/inventory/ingredients');
      if (!response.ok) throw new Error('Error al obtener ingredientes');
      const data = await response.json();
      setIngredients(data.ingredients || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLERS DE NAVEGACIÓN Y MODAL (Mantenidos) ---
  const handleCalculateABC = () => {
    globalThis.location.href = `/sys/stockroom/ingredients/abc`;
  };

  const handleEditOpen = (ingredient: Ingredient) => {
    setIngredientToEdit(ingredient);
    setEditIngredient({
        name: ingredient.name,
        unit: ingredient.unit,
        pricePerUnit: ingredient.pricePerUnit.toString(),
        provider: ingredient.provider
    });
    setEditError(null);
    setModalType('edit');
    setIsModalOpen(true);
  };

  const handleDeleteOpen = (ingredient: Ingredient) => {
    setIngredientToDelete(ingredient);
    setModalType('delete');
    setIsModalOpen(true);
  };
  
  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalType(null);
    setIngredientToDelete(null);
    setIngredientToEdit(null);
    setNewIngredient({ name: '', unit: '', pricePerUnit: '', provider: '' });
    setEditError(null);
  };


  // --- HANDLERS DE ACEPTAR/CONFIRMAR (Corregido el flujo try/catch) ---
  const handleAddAccept = async () => {
    if (!newIngredient.name || !newIngredient.unit || !newIngredient.pricePerUnit || !newIngredient.provider) {
      toast.error('Validación', { description: 'Por favor completa todos los campos' });
      return;
    }
    setIsLoading(true);
    try {
        const response = await fetch('/api/system/inventory/ingredients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: newIngredient.name,
                unit: newIngredient.unit,
                pricePerUnit: newIngredient.pricePerUnit,
                provider: newIngredient.provider
            }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al crear ingrediente');
        
        toast.success('Ingrediente creado', { description: `${newIngredient.name} fue agregado exitosamente.` });
        handleModalClose();
        await fetchIngredients(); // Recarga la lista
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        toast.error('Error al agregar', { description: errorMessage });
    } finally {
        setIsLoading(false); // ✅ finally siempre se ejecuta
    }
  };

  const handleDeleteConfirm = async () => {
    if (!ingredientToDelete) return;
    setIsLoading(true);
    try {
        const response = await fetch(`/api/system/inventory/ingredients?id=${ingredientToDelete.id}`, { method: 'DELETE' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al eliminar ingrediente');
        
        toast.success('Ingrediente eliminado', { description: `${ingredientToDelete.name} fue eliminado permanentemente.` });
        handleModalClose();
        await fetchIngredients();
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        toast.error('Error al eliminar', { description: errorMessage });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleEditConfirm = async () => {
    if (!ingredientToEdit) return;
    if (!editIngredient.name || !editIngredient.unit || !editIngredient.pricePerUnit || !editIngredient.provider) {
        setEditError('Completa todos los campos');
        return;
    }
    setEditLoading(true);
    setEditError(null);
    try {
        const res = await fetch(`/api/system/inventory/ingredients?id=${ingredientToEdit.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editIngredient)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al editar ingrediente');
        
        toast.success('Ingrediente editado', { description: `${editIngredient.name} actualizado.` });
        handleModalClose();
        await fetchIngredients();
    } catch (err) {
        setEditError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
        setEditLoading(false);
    }
  };


  // --- VISTA DE CARGA Y ERROR (Shadcn) ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Cargando ingredientes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4 border-destructive bg-destructive/10 text-destructive border-2 m-6">
        <p className="font-medium">{error}</p>
      </Card>
    );
  }

  // --- VISTA PRINCIPAL (JSX) ---
  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* Header y Botones de Acción */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Ingredientes</h1>
          <p className="text-sm text-muted-foreground">Gestiona el inventario de ingredientes</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {/* Botón Añadir */}
          <Button onClick={() => setModalType('add') || setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> Añadir Ingrediente
          </Button>
          {/* Botón ABC */}
          <Button variant="outline" onClick={handleCalculateABC}>
            <BarChart className="mr-2 h-4 w-4" /> Calcular ABC
          </Button>
        </div>
      </div>

      {/* Ingredients List Header (Encabezado de la tabla para Desktop) */}
      <div className="hidden md:block bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-5 gap-4 text-sm font-bold text-muted-foreground">
          <div>Nombre / Proveedor</div>
          <div>Unidad</div>
          <div>Stock</div>
          <div>Precio Unitario</div>
          <div className="text-right">Acciones</div>
        </div>
      </div>

      {/* Ingredients List */}
      <div className="space-y-3">
        {ingredients.length > 0 ? (
          ingredients.map((ingredient) => (
            <Card key={ingredient.id} className="p-4 shadow-sm hover:shadow-md transition-shadow">
              {/* Layout responsivo: 2 columnas en móvil, 5 columnas en desktop */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-4 items-center">
                
                {/* Nombre y Proveedor */}
                <div className="col-span-2 md:col-span-1">
                  <p className="font-medium">{ingredient.name}</p>
                  <p className="text-xs text-muted-foreground">Proveedor: {ingredient.provider}</p>
                </div>
                
                {/* Unidad */}
                <div className="col-span-1 md:col-span-1 text-sm">
                  <span className="md:hidden font-semibold text-muted-foreground">Unidad: </span>{ingredient.unit}
                </div>
                
                {/* Stock */}
                <div className="col-span-1 md:col-span-1 text-sm font-bold text-primary">
                  <span className="md:hidden font-semibold text-muted-foreground">Stock: </span>{ingredient.currentQuantity}
                </div>
                
                {/* Precio */}
                <div className="col-span-1 md:col-span-1 text-sm font-bold">
                  <span className="md:hidden font-semibold text-muted-foreground">Precio: </span>Bs {ingredient.pricePerUnit.toFixed(2)}
                </div>
                
                {/* Acciones */}
                <div className="col-span-2 md:col-span-1 flex justify-end gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => { 
                       const encodedName = encodeURIComponent(ingredient.name);
                       globalThis.location.href = `/sys/stockroom/ingredients/${encodedName}`;
                  }}>
                    <Clock className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEditOpen(ingredient)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { 
                       globalThis.location.href = `/sys/stockroom/ingredients/eoq-model?ingredientId=${ingredient.id}`;
                  }}>
                    <BarChart className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteOpen(ingredient)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center border-dashed border-2">
            <p className="text-muted-foreground">No hay ingredientes registrados</p>
          </Card>
        )}
      </div>

      {/* --- MODALES (Dialogs de Shadcn) --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          
          {/* ADD INGREDIENT */}
          {modalType === 'add' && (
            <>
              <DialogHeader>
                <DialogTitle>Añadir Nuevo Ingrediente</DialogTitle>
                <DialogDescription>Completa todos los campos para registrar el nuevo ingrediente.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {['name', 'unit', 'pricePerUnit', 'provider'].map(key => (
                    <div key={key} className="space-y-2">
                        <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                        <Input 
                            id={key}
                            type={key === 'pricePerUnit' ? 'number' : 'text'}
                            step={key === 'pricePerUnit' ? "0.01" : undefined}
                            placeholder={key === 'pricePerUnit' ? "0.00" : `Nombre del ${key}`}
                            value={newIngredient[key as keyof typeof newIngredient]}
                            onChange={(e) => setNewIngredient(prev => ({ ...prev, [key]: e.target.value }))}
                        />
                    </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleModalClose}>Cancelar</Button>
                <Button onClick={handleAddAccept} className="bg-green-600 hover:bg-green-700">Aceptar</Button>
              </DialogFooter>
            </>
          )}
          
          {/* EDIT INGREDIENT */}
          {modalType === 'edit' && ingredientToEdit && (
            <>
              <DialogHeader>
                <DialogTitle>Editar {ingredientToEdit.name}</DialogTitle>
                <DialogDescription>Modifica los detalles del ingrediente.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {['name', 'unit', 'pricePerUnit', 'provider'].map(key => (
                    <div key={key} className="space-y-2">
                        <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                        <Input 
                            id={key}
                            type={key === 'pricePerUnit' ? 'number' : 'text'}
                            step={key === 'pricePerUnit' ? "0.01" : undefined}
                            value={editIngredient[key as keyof typeof editIngredient]}
                            onChange={(e) => setEditIngredient(prev => ({ ...prev, [key]: e.target.value }))}
                        />
                    </div>
                ))}
              </div>
              {editError && <p className="text-sm text-destructive">{editError}</p>}
              <DialogFooter>
                <Button variant="outline" onClick={handleModalClose} disabled={editLoading}>Cancelar</Button>
                <Button onClick={handleEditConfirm} disabled={editLoading}>
                  {editLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Cambios
                </Button>
              </DialogFooter>
            </>
          )}

          {/* DELETE INGREDIENT */}
          {modalType === 'delete' && ingredientToDelete && (
            <>
              <DialogHeader>
                <DialogTitle className="text-destructive">Eliminar Ingrediente</DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de eliminar el ingrediente <strong>"{ingredientToDelete.name}"</strong>?
                </DialogDescription>
              </DialogHeader>
              <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 rounded-md space-y-2">
                 <p className="text-sm font-semibold text-red-600 dark:text-red-300">
                    ⚠️ Advertencia
                 </p>
                 <p className="text-xs text-red-600 dark:text-red-300">
                    Esta acción también eliminará todo el historial de movimientos asociado a este ingrediente. Esta acción es **irreversible**.
                 </p>
                 <p className="text-sm text-muted-foreground">
                    Proveedor: {ingredientToDelete.provider}
                 </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleModalClose} disabled={isLoading}>Cancelar</Button>
                <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Eliminar Definitivamente
                </Button>
              </DialogFooter>
            </>
          )}

        </DialogContent>
      </Dialog>
    </div>
  );
}