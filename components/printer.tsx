import { useReactToPrint } from 'react-to-print';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Button,
} from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Loader2, Printer as PrinterIcon, FileText } from 'lucide-react';

// --- Tipos ---
type UsePrintOptions = Record<string, unknown>; // Tipo flexible para react-to-print

type PrintButtonProps = {
  targetRef: React.RefObject<HTMLElement | null>;
  printLabel?: string;
  pdfLabel?: string;
  colorScheme?: string; 
  showButtons?: boolean;
  buttonSize?: 'sm' | 'md' | 'lg';
  onBeforePrint?: () => Promise<void> | void;
  onAfterPrint?: () => void;
  onPrintError?: (error: Error) => void;
};

const Printer = ({ 
  targetRef, 
  printLabel = 'Imprimir',
  pdfLabel = 'Guardar PDF',
  colorScheme = 'teal',
  showButtons = true,
  buttonSize = 'md',
  onBeforePrint,
  onAfterPrint,
  onPrintError
}: PrintButtonProps) => {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  
  // Mapeo de colorScheme a clases de Tailwind
  const printButtonClass = cn(
    "text-white",
    colorScheme === 'teal' && "bg-teal-600 hover:bg-teal-700",
    colorScheme === 'blue' && "bg-blue-600 hover:bg-blue-700",
    colorScheme === 'red' && "bg-red-600 hover:bg-red-700",
    colorScheme === 'green' && "bg-green-600 hover:bg-green-700",
    (!colorScheme || colorScheme === 'default') && "bg-primary hover:bg-primary/90" 
  );

  const getButtonSize = (size: 'sm' | 'md' | 'lg'): 'sm' | 'default' | 'lg' => {
      if (size === 'sm') return 'sm';
      if (size === 'lg') return 'lg';
      return 'default';
  };


  // ==========================================================
  // ===== BLOQUE CORREGIDO =====
  // ==========================================================
  const handlePrint = useReactToPrint({
 
    // CORRECCIÓN 1: Usar contentRef, que es lo que tu librería espera
    contentRef: targetRef,

    // CORRECCIÓN 2: Arreglar la sintaxis del CSS
 
    onBeforeGetContent: async () => {
        setIsPrinting(true);
        if (onBeforePrint) await Promise.resolve(onBeforePrint());
        // 'return' ya no es necesario aquí si usamos contentRef
    },
    onAfterPrint: () => {
        setIsPrinting(false);
        onAfterPrint?.();
    },
    onPrintError: (errorLocation: "onBeforePrint" | "print", error: Error) => {
        setIsPrinting(false);
        onPrintError?.(error); 
    },
    
    // ✅ Estilos de página CORREGIDOS (sin &quot; ni &apos;)
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
          .recharts-wrapper text {
          fill: #000000 !important;
        }
        table {
          page-break-inside: auto !important;
          border-collapse: collapse !important;
          width: 100% !important;
        }
        thead {
          display: table-header-group !important;
          break-inside: avoid !important;
        }
        th, td {
          border: 1px solid #ddd !important;
          padding: 8px !important;
          font-size: 12px !important;
          page-break-inside: avoid !important;
        }
          
        .recharts-tooltip-wrapper { display: none !important; }
        button, .no-print, nav, aside, .print-hide { display: none !important; }
        .keep-together { page-break-inside: avoid !important; break-inside: avoid !important; }
      }
    `
  } as UsePrintOptions);


  // Función para impresión directa
  const handleDirectPrint = () => {
    handlePrint();
  }

  // Función para continuar con el proceso de PDF
  const proceedWithPDF = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      handlePrint();
    }, 200);
  };

  if (!showButtons) return null;

  return (
    <div className="flex gap-3 items-center">
      
      {/* Botón de Imprimir Directo */}
      <Button 
        className={printButtonClass}
        onClick={handleDirectPrint}
        disabled={!targetRef.current || isPrinting}
        size={getButtonSize(buttonSize)}
      >
        {isPrinting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PrinterIcon className="h-4 w-4 mr-2" />}
        {printLabel}
      </Button>
      
      {/* Botón de PDF con Dialog (Modal) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="secondary"
            disabled={!targetRef.current || isPrinting}
            size={getButtonSize(buttonSize)}
          >
            <FileText className="h-4 w-4 mr-2" /> {pdfLabel}
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>📄 Guardar como PDF</DialogTitle>
            <DialogDescription>
                Sigue estos pasos en la ventana de impresión para guardar el documento.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-2">
            
            <div className="p-4 rounded-md border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
              <p className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                ℹ️ Se abrirá la ventana de impresión
              </p>
              
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-600 dark:text-blue-400">
                <li>En "Destino" selecciona **"Guardar como PDF"**.</li>
                <li>Revisa la configuración (orientación, márgenes, etc.).</li>
                <li>Haz clic en **"Guardar"**.</li>
                <li>Elige dónde guardar tu archivo PDF.</li>
              </ol>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              💡 El archivo se guardará con el formato y estilos optimizados para impresión.
            </p>
          </div>
          
          <DialogFooter className="mt-4 flex flex-col sm:flex-row justify-end gap-3">
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setIsModalOpen(false)} size="sm">
                Cancelar
              </Button>
            </DialogClose>
            
            <Button 
              onClick={proceedWithPDF}
              size="sm"
            >
              📄 Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Printer;