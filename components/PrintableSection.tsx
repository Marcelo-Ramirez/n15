import { ReactNode, useRef } from 'react';
// No necesitamos Box
import { cn } from '@/lib/utils'; // Para la clase de estilo

// Asume que Printer es el componente que envuelve react-to-print
import Printer from './printer'; 

// --- Tipos ---
type PrintableSectionProps = {
  children: ReactNode;
  printLabel?: string;
  pdfLabel?: string;
  // Propiedad de color estándar de Chakra (asumida por Printer)
  colorScheme?: string; 
  showButtons?: boolean;
  buttonSize?: 'sm' | 'md' | 'lg';
  printTitle?: string;
  onBeforePrint?: () => Promise<void> | void;
  onAfterPrint?: () => void;
  onPrintError?: (error: Error) => void;
  buttonsInline?: boolean;
  externalPrintRef?: React.RefObject<HTMLDivElement | null>;
};

// --- Subcomponente PrintButtons (Corregido) ---
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
  printLabel?: string;
  pdfLabel?: string;
  colorScheme?: string; // Corregido el tipo
  showButtons?: boolean;
  buttonSize?: 'sm' | 'md' | 'lg';
  onBeforePrint?: () => Promise<void> | void;
  onAfterPrint?: () => void;
  onPrintError?: (error: Error) => void;
  targetRef: React.RefObject<HTMLElement | null>;
}) => {
  if (!showButtons) return null;
  
  return (
    // Printer (componente de terceros)
    <Printer 
      targetRef={targetRef}
      printLabel={printLabel}
      pdfLabel={pdfLabel}
      colorScheme={colorScheme} // Propiedad que el componente espera
      showButtons={showButtons}
      buttonSize={buttonSize}
      onBeforePrint={onBeforePrint}
      onAfterPrint={onAfterPrint}
      onPrintError={onPrintError}
    />
  );
};

// --- Componente Principal PrintableSection ---
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
  
  const internalPrintRef = useRef<HTMLDivElement>(null);
  const printRef = externalPrintRef || internalPrintRef;

  // 1. Caso de botones en línea
  if (buttonsInline) {
    return (
      <PrintButtons 
        targetRef={printRef as React.RefObject<HTMLElement | null>}
        printLabel={printLabel}
        pdfLabel={pdfLabel}
        colorScheme={colorScheme}
        showButtons={showButtons}
        buttonSize={buttonSize}
        onBeforePrint={onBeforePrint}
        onAfterPrint={onAfterPrint}
        onPrintError={onPrintError}
      />
    );
  }

  // 2. Caso de botones sobre el contenido
  return (
    <div>
      {/* Margen condicional (reemplaza Box) */}
      <div className={cn({ "mb-4": showButtons })}>
        <PrintButtons 
          targetRef={printRef as React.RefObject<HTMLElement | null>}
          printLabel={printLabel}
          pdfLabel={pdfLabel}
          colorScheme={colorScheme}
          showButtons={showButtons}
          buttonSize={buttonSize}
          onBeforePrint={onBeforePrint}
          onAfterPrint={onAfterPrint}
          onPrintError={onPrintError}
        />
      </div>

      <div ref={printRef}>
        {printTitle && (
          <div className="mb-6 text-center"> 
            
            {/* Estilos CSS para impresión */}
            <style dangerouslySetInnerHTML={{
              __html: `
                .print-title {
                  display: none;
                }
                @media print {
                  .print-title {
                    display: block !important;
                  }
                }
              `
            }} />
            
            <div className="print-title">
              {/* Estilos Tailwind */}
              <h1 className="text-2xl font-bold text-foreground mb-2 print:text-black">
                {printTitle}
              </h1>
              <p className="text-sm text-muted-foreground print:text-gray-600">
                Fecha: {new Date().toLocaleDateString('es-BO')}
              </p>
            </div>
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

export default PrintableSection;