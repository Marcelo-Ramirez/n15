'use client'
import { Box, Heading } from '@chakra-ui/react'
import ProductForm from '@/app/components/inventory/ProductForm'

export default function ABCAnalysisPage() {
  return (
    <Box p={8}>
      <Heading mb={6}>Clasificación ABC de Inventario</Heading>
      <ProductForm />
    </Box>
  )
}
