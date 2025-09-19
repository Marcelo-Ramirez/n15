import { useReactToPrint } from 'react-to-print'
import { RefObject, useState } from 'react'
import { 
  Button, 
  ButtonGroup, 
  VStack, 
  Text, 
  Box,
  HStack
} from '@chakra-ui/react'
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@chakra-ui/react'

type PrintButtonProps = {
  targetRef: RefObject<HTMLElement>
  printLabel?: string
  pdfLabel?: string
  colorScheme?: string
  onBeforePrint?: () => Promise<void> | void
  onAfterPrint?: () => void
  onPrintError?: (error: Error) => void
}

const Printer = ({ 
  targetRef, 
  printLabel = 'Imprimir',
  pdfLabel = 'Guardar PDF',
  colorScheme = 'teal',
  onBeforePrint,
  onAfterPrint,
  onPrintError
}: PrintButtonProps) => {
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Configuración de react-to-print
  const handlePrint = useReactToPrint({
    contentRef: targetRef,
    onBeforePrint: async () => {
      console.log('Iniciando proceso...')
      if (onBeforePrint) {
        await Promise.resolve(onBeforePrint())
      }
    },
    onAfterPrint: () => {
      console.log('Proceso completado')
      onAfterPrint?.()
    },
    onPrintError: (error: unknown) => {
  const err: Error = error instanceof Error ? error : new Error(String(error))
  console.error('Error:', err)
  onPrintError?.(err)
}
,
    pageStyle: `
      @page {
        margin: 15mm;
        size: A4;
      }
      
      @media print {
        body { 
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          font-family: 'Arial', sans-serif;
        }
        
        table {
          page-break-inside: avoid;
          border-collapse: collapse !important;
          width: 100% !important;
        }
        
        thead {
          display: table-header-group;
        }
        
        tr {
          page-break-inside: avoid;
        }
        
        th, td {
          border: 1px solid #ddd !important;
          padding: 8px !important;
          font-size: 12px !important;
        }
        
        /* Ocultar elementos innecesarios */
        button, .no-print, nav, aside {
          display: none !important;
        }
        
        /* Mejorar legibilidad */
        h1, h2, h3 {
          color: #000 !important;
          page-break-after: avoid;
        }
        
        /* Estilos para gráficos */
        canvas {
          page-break-inside: avoid;
          max-width: 100% !important;
          height: auto !important;
        }
      }
    `
  })

  // Función para impresión normal
  const handleDirectPrint = () => {
    handlePrint()
  }

  // Continuar con el proceso de PDF
  const proceedWithPDF = () => {
    setIsModalOpen(false)
    setTimeout(() => {
      handlePrint()
    }, 200)
  }

  return (
    <ButtonGroup gap={3}>
      {/* Botón de Imprimir */}
      <Button 
        colorScheme={colorScheme} 
        onClick={handleDirectPrint}
        disabled={!targetRef.current}
        size="md"
      >
        🖨️ {printLabel}
      </Button>
      
      {/* Botón de PDF con Dialog */}
      <DialogRoot 
        open={isModalOpen} 
        onOpenChange={({ open }) => setIsModalOpen(open)}
        size="md"
        placement="center"
      >
        <DialogTrigger asChild>
          <Button 
            colorScheme="blue" 
            disabled={!targetRef.current}
            size="md"
          >
            📄 {pdfLabel}
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>📄 Guardar como PDF</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          
          <DialogBody>
            <VStack gap={4} align="stretch">
              
              <Box 
                bg="blue.50" 
                p={4} 
                borderRadius="md" 
                borderLeft="4px solid" 
                borderLeftColor="blue.400"
              >
                <Text fontWeight="semibold" color="blue.700" fontSize="sm" mb={2}>
                  ℹ️ Se abrirá la ventana de impresión
                </Text>
                
                <VStack align="start" gap={2} fontSize="sm" color="blue.600">
                  <Text>
                    <strong>1.</strong> En &quot;Destino&quot;  selecciona <strong>&quot;Guardar como PDF&quot;</strong>
                  </Text>
                  <Text>
                    <strong>2.</strong> Revisa la configuración (orientación, márgenes)
                  </Text>
                  <Text>
                    <strong>3.</strong> Haz clic en <strong>&quot;guardar&quot;</strong>
                  </Text>
                  <Text>
                    <strong>4.</strong> Elige dónde guardar tu archivo PDF
                  </Text>
                </VStack>
              </Box>

              <Text fontSize="sm" color="gray.600" textAlign="center">
                💡 El archivo se guardará con el formato y estilos optimizados para PDF
              </Text>

              {/* Botones del modal */}
              <HStack justify="flex-end" gap={3} pt={2}>
                <DialogActionTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Cancelar
                  </Button>
                </DialogActionTrigger>
                
                <Button 
                  colorScheme="blue" 
                  onClick={proceedWithPDF}
                  size="sm"
                >
                  📄 Continuar
                </Button>
              </HStack>
              
            </VStack>
          </DialogBody>
        </DialogContent>
      </DialogRoot>
    </ButtonGroup>
  )
}

export default Printer