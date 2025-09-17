export interface Ingredient {
  id: number;
  name: string;
  currentQuantity: number;
  unit: string;
  reorderPoint: number | null; // Punto de reorden (null si no se ha calculado EOQ)
  pricePerUnit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryMovement {
  id: number;
  ingredientId: number;
  userId: number;
  movementType: 'entrada' | 'salida';
  reason: 'compra' | 'produccion' | 'ajuste' | 'vencimiento' | 'daño';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  createdAt: Date;
  
  // Relaciones
  ingredient?: Ingredient;
  user?: {
    id: number;
    name: string;
  };
}



export interface InventoryStats {
  totalIngredients: number;
  totalValue: number;
  lowStockCount: number;
  criticalStockCount: number;
}

export interface MovementFormData {
  movementType: 'entrada' | 'salida';
  reason: 'compra' | 'produccion' | 'ajuste' | 'vencimiento' | 'daño';
  quantity: number;
}

export interface CreateIngredientData {
  name: string;
  unit: string;
  pricePerUnit: number;
  // reorderPoint se establece automáticamente como null al crear
}
