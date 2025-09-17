import { ProductInput } from '@/types/product'

type Thresholds = { A: number; B: number; C: number }

export function enrichProducts(
  products: ProductInput[],
  criterio: 'valor' | 'precio' | 'utilidad',
  thresholds: Thresholds = { A: 80, B: 95, C: 100 } // Ahora C también se puede definir
) {
  if (products.length === 0) return []

  // Validación de thresholds
  if (!(thresholds.A < thresholds.B && thresholds.B < thresholds.C && thresholds.C <= 100)) {
    throw new Error('Los thresholds deben cumplir: A < B < C ≤ 100')
  }

  const enriched = products.map((p, i) => {
    let baseValue = 0

    if (criterio === 'valor') {
      baseValue = p.unitPrice * p.annualConsumption
    } else if (criterio === 'precio') {
      baseValue = p.unitPrice
    } else if (criterio === 'utilidad') {
      const utilityPerUnit = p.unitPrice - p.costPerUnit
      baseValue = utilityPerUnit * p.annualConsumption
    }

    return {
      ...p,
      annualValue: baseValue,
      id: i + 1,
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
      accumulatedPercentage,
    }
  })
}
