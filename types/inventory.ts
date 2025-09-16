export interface Ingredient {
  id: number;
  name: string;
  currentQuantity: number;
  unit: string;
  minStock: number;
  pricePerUnit: number;
  status: 'normal' | 'bajo' | 'critico';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIngredientData {
  name: string;
  currentQuantity: number;
  minStock: number;
  pricePerUnit: number;
  unit: string;
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
  unitPrice?: number;
  totalCost?: number;
  notes?: string;
  movementDate: Date;
  createdBy: number;
  createdAt: Date;
  
  // Relaciones
  ingredient?: Ingredient;
  user?: {
    id: number;
    name: string;
  };
  createdByUser?: {
    id: number;
    name: string;
  };
}

export interface ProductionBatch {
  id: number;
  batchCode: string;
  productName: string;
  quantityProduced: number;
  productionDate: Date;
  createdBy: number;
  createdAt: Date;
  
  // Relaciones
  createdByUser?: {
    id: number;
    name: string;
  };
  ingredients?: ProductionIngredient[];
}

export interface ProductionIngredient {
  id: number;
  batchId: number;
  ingredientId: number;
  quantityUsed: number;
  movementId: number;
  
  // Relaciones
  ingredient?: Ingredient;
  movement?: InventoryMovement;
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
  unitPrice?: number;
  notes?: string;
}

export interface CreateIngredientData {
  name: string;
  unit: string;
  minStock: number;
  pricePerUnit: number;
  initialQuantity?: number;
}
