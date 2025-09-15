import { ProductInput } from '@/types/product'

export function enrichProducts(
  products: ProductInput[],
  criterio: 'valor' | 'precio' | 'utilidad'
) {
  const enriched = products.map(p => {
    let baseValue = 0

    if (criterio === 'valor') {
      baseValue = p.unitPrice * p.annualConsumption
    } else if (criterio === 'precio') {
      baseValue = p.unitPrice
    } else if (criterio === 'utilidad') {
      baseValue = (p.utilityPerUnit ?? 0) * p.annualConsumption
    }

    return {
      ...p,
      annualValue: baseValue,
    }
  })

  const total = enriched.reduce((sum, p) => sum + p.annualValue, 0)
  const sorted = [...enriched].sort((a, b) => b.annualValue - a.annualValue)

  let accumulated = 0
  return sorted.map(p => {
    accumulated += p.annualValue
    const percentage = (accumulated / total) * 100

    let abcCategory: 'A' | 'B' | 'C' = 'C'
    if (percentage <= 85) abcCategory = 'A'
    else if (percentage <= 95) abcCategory = 'B'
    else abcCategory = 'C'

    return {
      ...p,
      abcCategory,
      percentageOfTotal: percentage,
    }
  })
}