// lib/abcUtils.ts
import { Ingredient, InventoryMovement } from '@/types/inventory'

export type Thresholds = { A: number; B: number; C: number }

// Interfaz temporal para enriquecer el inventario como "producto"
export interface InventoryProduct {
  id: number
  name: string
  unitPrice: number        // de Ingredient.pricePerUnit
  annualConsumption: number // suma de salidas de InventoryMovement
  annualValue?: number
  abcCategory?: 'A' | 'B' | 'C'
  individualPercentage?: number
  accumulatedPercentage?: number
}

/**
 * Convierte ingredientes + movimientos en InventoryProduct
 */
export function mapInventoryToProduct(
  ingredients: Ingredient[],
  movements: InventoryMovement[]
): InventoryProduct[] {
  return ingredients.map((ing) => {
    // calcular consumo anual como suma de salidas
    const annualConsumption = movements
      .filter(m => m.ingredientId === ing.id && m.movementType === 'salida')
      .reduce((sum, m) => sum + m.quantity, 0)

    return {
      id: ing.id,
      name: ing.name,
      unitPrice: ing.pricePerUnit,
      annualConsumption
    }
  })
}

/**
 * Enriquecer productos/inventario con ABC
 */
export function enrichProducts(
  products: InventoryProduct[],
  criterio: 'valor' | 'precio' | 'utilidad',
  thresholds: Thresholds = { A: 80, B: 95, C: 100 }
) {
  if (products.length === 0) return []

  // Validación de thresholds
  if (!(thresholds.A < thresholds.B && thresholds.B < thresholds.C && thresholds.C <= 100)) {
    throw new Error('Los thresholds deben cumplir: A < B < C ≤ 100')
  }

  // Calcular valor base
  const enriched = products.map((p, i) => {
    let baseValue = 0
    if (criterio === 'valor') {
      baseValue = p.unitPrice * p.annualConsumption
    } else if (criterio === 'precio') {
      baseValue = p.unitPrice
    } else if (criterio === 'utilidad') {
      // Si quieres usar utilidad, debes agregar costPerUnit en InventoryProduct
      baseValue = (p.unitPrice /* - p.costPerUnit */) * p.annualConsumption
    }
    return {
      ...p,
      annualValue: baseValue,
      id: i + 1
    }
  })

  const total = enriched.reduce((sum, p) => sum + p.annualValue, 0)
  const sorted = [...enriched].sort((a, b) => b.annualValue - a.annualValue)

  let accumulated = 0

  return sorted.map((p, index) => {
    accumulated += p.annualValue
    const individualPercentage = (p.annualValue / total) * 100
    const accumulatedPercentage = (accumulated / total) * 100

    let abcCategory: 'A' | 'B' | 'C'
    if (sorted.length === 1) {
      abcCategory = 'A'
    } else if (sorted.length <= 3) {
      if (index === 0) abcCategory = 'A'
      else if (index === 1) abcCategory = 'B'
      else abcCategory = 'C'
    } else {
      if (accumulatedPercentage <= thresholds.A) abcCategory = 'A'
      else if (accumulatedPercentage <= thresholds.B) abcCategory = 'B'
      else abcCategory = 'C'
    }

    return {
      ...p,
      abcCategory,
      individualPercentage,
      accumulatedPercentage
    }
  })
}
