'use client'
import { Box, HStack, Button } from '@chakra-ui/react'
import { usePathname, useRouter } from 'next/navigation'

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const getCurrentView = () => {
    if (pathname?.includes('/inventory/ingredient')) return 'inventory'
    if (pathname?.includes('/inventory/abc')) return 'abc'
    if (pathname?.includes('/inventory/products')) return 'products'
    return 'inventory'
  }

  const view = getCurrentView()

  const handleChangeView = (newView: 'inventory' | 'abc' | 'products') => {
    switch (newView) {
      case 'inventory': router.push('/inventory/ingredient'); break
      case 'abc': router.push('/inventory/abc'); break
      case 'products': router.push('/inventory/products'); break
    }
  }

  return (
    <Box p={6}>
      {/* Botones siempre visibles */}
      <HStack gap={2} mb={4}>
        <Button colorScheme={view === 'inventory' ? 'blue' : 'gray'} onClick={() => handleChangeView('inventory')}>
          Ingredientes
        </Button>
        <Button colorScheme={view === 'abc' ? 'blue' : 'gray'} onClick={() => handleChangeView('abc')}>
          ABC
        </Button>
        <Button colorScheme={view === 'products' ? 'blue' : 'gray'} onClick={() => handleChangeView('products')}>
          Productos
        </Button>
      </HStack>

      {/* Render del contenido de la subpágina */}
      <Box mt={4}>{children}</Box>
    </Box>
  )
}
