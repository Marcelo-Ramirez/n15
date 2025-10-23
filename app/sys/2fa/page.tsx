// Carpeta: /sys/2fa
// Nombre del archivo: page.tsx (NO TIENE 'use client')

import { Suspense } from 'react';
import { Spinner, Box, Text } from '@chakra-ui/react';
import TwoFaContent from './TwoFaContent'; // Importamos el componente cliente

// Componente de carga para la suspensión
const LoadingFallback = (
  <Box 
      minH="100vh" 
      display="flex" 
      flexDirection="column"
      alignItems="center" 
      justifyContent="center" 
      bg="gray.900"
  >
      <Spinner size="xl" color="blue.500" mb={4} />
      <Text color="white">Cargando formulario 2FA...</Text>
  </Box>
);

export default function TwoFAPageWrapper() {
  // 💡 ESTO SOLUCIONA EL ERROR:
  // El Server Component renderiza el límite de Suspense.
  // Luego, el componente TwoFaContent (que usa useSearchParams)
  // solo se renderiza en el cliente, cumpliendo con la regla de Next.js.
  return (
    <Suspense fallback={LoadingFallback}>
      <TwoFaContent />
    </Suspense>
  );
}