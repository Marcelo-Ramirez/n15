'use client'

import { Box, Button, VStack, Badge } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { Select } from '@chakra-ui/select'
import { useState } from 'react'
import { enrichProducts } from '@/lib/abcUtils'
import { ProductInput } from '@/types/product'

const ProductForm = () => {
  const [products, setProducts] = useState<ProductInput[]>([])
  const [form, setForm] = useState<ProductInput>({
    name: '',
    unitPrice: 0,
    annualConsumption: 0,
    utilityPerUnit: 0,
  })
  const [mode, setMode] = useState<'anual' | 'mensual'>('anual')
  const [criterio, setCriterio] = useState<'valor' | 'precio' | 'utilidad'>('valor')

  const handleAdd = () => {
    const adjustedConsumption =
      mode === 'mensual' ? form.annualConsumption * 12 : form.annualConsumption

    setProducts(prev => [
      ...prev,
      {
        ...form,
        annualConsumption: adjustedConsumption,
      },
    ])
    setForm({
      name: '',
      unitPrice: 0,
      annualConsumption: 0,
      utilityPerUnit: 0,
    })
  }

  const enriched = enrichProducts(products, criterio)

  return (
    <Box>
      <VStack gap={4} align="start">
        <FormControl>
          <FormLabel>Criterio de clasificación ABC</FormLabel>
          <Select
            value={criterio}
            onChange={e => setCriterio(e.target.value as any)}
          >
            <option value="valor">Por valor total</option>
            <option value="precio">Por precio unitario</option>
            <option value="utilidad">Por aporte a utilidades</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Nombre del producto</FormLabel>
          <Input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Precio unitario</FormLabel>
          <Input
            type="number"
            value={form.unitPrice}
            onChange={e =>
              setForm({ ...form, unitPrice: parseFloat(e.target.value) })
            }
          />
        </FormControl>

        {criterio === 'utilidad' && (
          <FormControl>
            <FormLabel>Utilidad por unidad</FormLabel>
            <Input
              type="number"
              value={form.utilityPerUnit}
              onChange={e =>
                setForm({
                  ...form,
                  utilityPerUnit: parseFloat(e.target.value),
                })
              }
            />
          </FormControl>
        )}

        <FormControl>
          <FormLabel>Modo de ingreso</FormLabel>
          <Select
            value={mode}
            onChange={e => setMode(e.target.value as 'anual' | 'mensual')}
          >
            <option value="anual">Consumo anual</option>
            <option value="mensual">Consumo mensual</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>
            {mode === 'anual' ? 'Consumo anual' : 'Consumo mensual'}
          </FormLabel>
          <Input
            type="number"
            value={form.annualConsumption}
            onChange={e =>
              setForm({
                ...form,
                annualConsumption: parseInt(e.target.value),
              })
            }
          />
        </FormControl>

        <Button onClick={handleAdd} colorScheme="teal">
          Agregar producto
        </Button>
      </VStack>

      <Box mt={8} overflowX="auto">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px' }}>Producto</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Precio</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Consumo anual</th>
              {criterio === 'utilidad' && (
                <th style={{ textAlign: 'left', padding: '8px' }}>Utilidad anual</th>
              )}
              {criterio !== 'precio' && (
                <th style={{ textAlign: 'left', padding: '8px' }}>Valor anual</th>
              )}
              <th style={{ textAlign: 'left', padding: '8px' }}>Categoría ABC</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Acumulado %</th>
            </tr>
          </thead>
          <tbody>
            {enriched.map((p, i) => (
              <tr key={i}>
                <td style={{ padding: '8px' }}>{p.name}</td>
                <td style={{ padding: '8px' }}>${p.unitPrice.toFixed(2)}</td>
                <td style={{ padding: '8px' }}>{p.annualConsumption}</td>
                {criterio === 'utilidad' && (
                  <td style={{ padding: '8px' }}>
                    ${(p.utilityPerUnit * p.annualConsumption).toFixed(2)}
                  </td>
                )}
                {criterio !== 'precio' && (
                  <td style={{ padding: '8px' }}>
                    ${p.annualValue?.toFixed(2) ?? '—'}
                  </td>
                )}
                <td style={{ padding: '8px' }}>
                  <Badge
                    colorScheme={
                      p.abcCategory === 'A'
                        ? 'red'
                        : p.abcCategory === 'B'
                        ? 'orange'
                        : 'green'
                    }
                  >
                    {p.abcCategory}
                  </Badge>
                </td>
                <td style={{ padding: '8px' }}>
                  {p.percentageOfTotal?.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  )
}

export default ProductForm