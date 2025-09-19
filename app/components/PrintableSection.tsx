import { ReactNode, useRef, forwardRef } from 'react'
import { Box } from '@chakra-ui/react'
import Printer from './printer'

type PrintableSectionProps = {
  children: ReactNode
  printLabel?: string
  pdfLabel?: string
  colorScheme?: string
  showButtons?: boolean
  buttonSize?: 'sm' | 'md' | 'lg'
  printTitle?: string
  onBeforePrint?: () => Promise<void> | void
  onAfterPrint?: () => void
  onPrintError?: (error: Error) => void
  // Nuevo prop para controlar si los botones van inline o separados
  buttonsInline?: boolean
  // Prop para pasar un ref externo cuando buttonsInline es true
  externalPrintRef?: React.RefObject<HTMLDivElement | null>
}

// Componente para solo los botones
export const PrintButtons = ({
  printLabel = 'Imprimir',
  pdfLabel = 'Guardar PDF',
  colorScheme = 'teal',
  showButtons = true,
  buttonSize = 'md',
  onBeforePrint,
  onAfterPrint,
  onPrintError,
  targetRef 
}: {
  printLabel?: string
  pdfLabel?: string
  colorScheme?: string
  showButtons?: boolean
  buttonSize?: 'sm' | 'md' | 'lg'
  onBeforePrint?: () => Promise<void> | void
  onAfterPrint?: () => void
  onPrintError?: (error: Error) => void
  targetRef: React.RefObject<HTMLElement | null>
}) => {
  if (!showButtons) return null
  
  return (
    <Printer 
      targetRef={targetRef}
      printLabel={printLabel}
      pdfLabel={pdfLabel}
      colorScheme={colorScheme}
      showButtons={showButtons}
      buttonSize={buttonSize}
      onBeforePrint={onBeforePrint}
      onAfterPrint={onAfterPrint}
      onPrintError={onPrintError}
    />
  )
}

const PrintableSection = ({
  children,
  printLabel = 'Imprimir',
  pdfLabel = 'Guardar PDF',
  colorScheme = 'teal',
  showButtons = true,
  buttonSize = 'md',
  printTitle,
  onBeforePrint,
  onAfterPrint,
  onPrintError,
  buttonsInline = false,
  externalPrintRef
}: PrintableSectionProps) => {
  
  const internalPrintRef = useRef<HTMLDivElement>(null)
  const printRef = externalPrintRef || internalPrintRef

  // Si buttonsInline es true, solo retornamos los botones
  if (buttonsInline) {
    return (
      <PrintButtons 
        targetRef={printRef}
        printLabel={printLabel}
        pdfLabel={pdfLabel}
        colorScheme={colorScheme}
        showButtons={showButtons}
        buttonSize={buttonSize}
        onBeforePrint={onBeforePrint}
        onAfterPrint={onAfterPrint}
        onPrintError={onPrintError}
      />
    )
  }

  // Layout tradicional (por defecto)
  return (
    <Box>
      {/* Botones de impresión */}
      <Box mb={showButtons ? 4 : 0}>
        <PrintButtons 
          targetRef={printRef}
          printLabel={printLabel}
          pdfLabel={pdfLabel}
          colorScheme={colorScheme}
          showButtons={showButtons}
          buttonSize={buttonSize}
          onBeforePrint={onBeforePrint}
          onAfterPrint={onAfterPrint}
          onPrintError={onPrintError}
        />
      </Box>

      {/* Contenido imprimible */}
      <Box ref={printRef}>
        {printTitle && (
          <Box mb={6} textAlign="center">
            <style jsx>{`
              .print-title {
                display: none;
              }
              @media print {
                .print-title {
                  display: block !important;
                }
              }
            `}</style>
            <div className="print-title">
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#000', 
                marginBottom: '8px' 
              }}>
                {printTitle}
              </h1>
              <p style={{ 
                fontSize: '14px', 
                color: '#666' 
              }}>
                Fecha: {new Date().toLocaleDateString('es-BO')}
              </p>
            </div>
          </Box>
        )}

        {children}
      </Box>
    </Box>
  )
}

export default PrintableSection