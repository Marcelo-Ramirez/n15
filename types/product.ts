
export interface ProductInput {
  name: string
  unitPrice: number         // Precio de venta por unidad
  costPerUnit: number       // Costo por unidad
  annualConsumption: number // Unidades consumidas/vendidas en el año
  utilityPerUnit?: number
}
