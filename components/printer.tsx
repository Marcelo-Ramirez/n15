import { useReactToPrint } from 'react-to-print'
import { useState } from 'react'
import { 
  Button, 
  ButtonGroup, 
  VStack, 
  Text, 
  Box,
  HStack,DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger
} from '@chakra-ui/react'

type PrintButtonProps = {
  targetRef: React.RefObject<HTMLElement | null>
  printLabel?: string
  pdfLabel?: string
  colorScheme?: string
  // Nuevas props para PrintableSection
  showButtons?: boolean
  buttonSize?: 'sm' | 'md' | 'lg'
  onBeforePrint?: () => Promise<void> | void
  onAfterPrint?: () => void
  onPrintError?: (error: Error) => void
}

const Printer = ({ 
  targetRef, 
  printLabel = 'Imprimir',
  pdfLabel = 'Guardar PDF',
  colorScheme = 'teal',
  showButtons = true, // Nueva prop
  buttonSize = 'md', // Nueva prop
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
    },
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
        
        /* === CONTROL DE SALTOS DE PÁGINA PARA TABLAS === */
        table {
          page-break-inside: auto !important;
          border-collapse: collapse !important;
          width: 100% !important;
          /* Evita que se corte al final de página */
          break-inside: auto !important;
        }
        
        thead {
          display: table-header-group !important;
          /* Repetir encabezados en cada página */
          break-inside: avoid !important;
        }
        
        tbody {
          display: table-row-group !important;
        }
        
        tr {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        
        th, td {
          border: 1px solid #ddd !important;
          padding: 8px !important;
          font-size: 12px !important;
          page-break-inside: avoid !important;
        }
        
        /* === CONTROL DE SALTOS DE PÁGINA PARA GRÁFICOS === */
        /* Contenedores de gráficos de Recharts */
        .recharts-wrapper,
        .recharts-responsive-container {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          /* Si es muy alto, permitir salto antes */
          page-break-before: auto !important;
          margin-bottom: 20px !important;
          /* Asegurar que se muestren todos los elementos */
          overflow: visible !important;
        }
        
        /* Canvas y SVG de gráficos */
        canvas, svg {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          max-width: 100% !important;
          height: auto !important;
          /* Ajustar altura máxima para que quepa en página */
          max-height: 250mm !important;
          /* CRÍTICO: Forzar visibilidad de todos los elementos SVG */
          overflow: visible !important;
        }
        
        /* === ESTILOS ESPECÍFICOS PARA RECHARTS === */
        /* Asegurar que se impriman todos los elementos del gráfico */
        .recharts-cartesian-axis,
        .recharts-cartesian-axis-tick,
        .recharts-cartesian-axis-tick-line,
        .recharts-cartesian-axis-tick-value {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        /* Eje Y derecho específicamente */
        .recharts-yAxis.recharts-yAxis-right,
        .recharts-yAxis.recharts-yAxis-right .recharts-cartesian-axis-tick-value {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          fill: #f56500 !important;
        }
        
        /* Labels y texto en general */
        .recharts-text,
        .recharts-label {
          fill: #000 !important;
          font-size: 11px !important;
          font-family: 'Arial', sans-serif !important;
        }
        
        /* Líneas y barras */
        .recharts-bar,
        .recharts-line,
        .recharts-area {
          opacity: 1 !important;
        }
        
        /* Grid y ejes */
        .recharts-cartesian-grid line {
          stroke: #e2e8f0 !important;
          stroke-dasharray: 3 3 !important;
        }
        
        /* Leyenda */
        .recharts-legend-wrapper {
          display: block !important;
          visibility: visible !important;
        }
        
        /* Tooltip debe estar oculto en impresión */
        .recharts-tooltip-wrapper {
          display: none !important;
        }
        
        /* === ELEMENTOS GENERALES === */
        /* Contenedores de componentes */
        .chart-container,
        .table-container,
        .print-section {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          margin-bottom: 15px !important;
        }
        
        /* Títulos y encabezados */
        h1, h2, h3, h4, h5, h6 {
          color: #000 !important;
          page-break-after: avoid !important;
          break-after: avoid !important;
          /* Mantener con el contenido siguiente */
          orphans: 3 !important;
          widows: 3 !important;
        }
        
        /* Párrafos y contenido de texto */
        p, div {
          orphans: 2 !important;
          widows: 2 !important;
        }
        
        /* === FORZAR SALTO DE PÁGINA === */
        /* Clase utilitaria para forzar salto antes */
        .page-break-before {
          page-break-before: always !important;
          break-before: page !important;
        }
        
        /* Clase utilitaria para forzar salto después */
        .page-break-after {
          page-break-after: always !important;
          break-after: page !important;
        }
        
        /* Clase para evitar saltos dentro del elemento */
        .keep-together {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        
        /* Ocultar elementos innecesarios */
        button, .no-print, nav, aside, .print-hide {
          display: none !important;
        }
        
        /* === ESPACIADO Y MÁRGENES === */
        /* Espaciado entre secciones */
        .print-section + .print-section {
          margin-top: 25px !important;
        }
        
        /* Ajuste de márgenes para mejor uso del espacio */
        * {
          margin-top: 0 !important;
        }
        
        *:first-child {
          margin-top: 0 !important;
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

  // Si showButtons es false, no renderizar nada (para PrintableSection)
  if (!showButtons) {
    return null
  }

  return (
    <ButtonGroup gap={3}>
      {/* Botón de Imprimir */}
      <Button 
        colorScheme={colorScheme} 
        onClick={handleDirectPrint}
        disabled={!targetRef.current}
        size={buttonSize}
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
            size={buttonSize}
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