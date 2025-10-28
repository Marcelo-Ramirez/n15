// components/MaintenanceResultsModal.tsx
'use client';
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Zap, Hourglass, BarChart3, AlertCircle} from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area"; // Necesario para el historial
// ✅ Importaciones de SHADCN UI
import { Card, CardContent } from "@/components/ui/card"; 

// ✅ IMPORTACIÓN DE LÓGICA DE HISTORIAL
import { MaintenanceInput, loadReportHistoryFromLocalStorage, FullReport } from "@/lib/maintenance_logic"; 

// --- Tipos de Datos (Simplificado para el Modal) ---
// La prop reportData se ELIMINA, ya que el modal carga el historial internamente.
interface MaintenanceResultsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MaintenanceResultsModal({ isOpen, onClose }: MaintenanceResultsModalProps) {
    // ✅ Estado para almacenar el ARRAY completo del historial
    const [reportHistory, setReportHistory] = useState<FullReport[]>([]);

    // Función para calcular el tiempo de funcionamiento (se usa en el render)
    const calculateRunningTime = (data: MaintenanceInput) => data.totalTimeHours - data.totalDowntimeHours;
    
    // Función para leer el reporte de localStorage
    useEffect(() => {
        if (isOpen) {
            // ✅ Carga el historial completo al abrir el modal
            const history = loadReportHistoryFromLocalStorage();
            setReportHistory(history);
        }
    }, [isOpen]); // Carga los datos cada vez que el modal se abre

    // Si el modal está cerrado, no renderizamos nada
    if (!isOpen) {
        return null;
    }
    
    // Si no hay reportes en el historial
    if (reportHistory.length === 0) {
         return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-md text-center p-6">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <DialogTitle>Sin Historial</DialogTitle>
                    <DialogDescription>Aún no se ha generado ningún reporte de mantenimiento.</DialogDescription>
                    <DialogFooter><Button onClick={onClose}>Cerrar</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }
    
    // Obtenemos el reporte más reciente para mostrar como principal
    const latestReport = reportHistory[0];
    
    // --- Cálculos para el Reporte Principal ---
    const mttfValue = Number.parseFloat(latestReport.MTTF.split(' ')[0]);
    const mtbfValue = Number.parseFloat(latestReport.MTBF.split(' ')[0]);
    const availability = (mtbfValue > 0) ? (mttfValue / mtbfValue) * 100 : 0;
    
    // Prepara los datos del activo para el resumen
    const assetData = [
        { label: 'Tiempo Observado', value: `${latestReport.totalTimeHours} h` },
        { label: 'Tiempo Operativo', value: `${calculateRunningTime(latestReport).toFixed(2)} h` },
        { label: 'Total de Fallas', value: latestReport.numFailures },
    ];
    
    // Prepara los resultados de los KPIs
    const kpiResults = [
        { label: 'MTTR (Mantenibilidad)', value: latestReport.MTTR, icon: Hourglass, color: 'text-orange-600' },
        { label: 'MTTF (Tiempo Correcto)', value: latestReport.MTTF, icon: Zap, color: 'text-blue-600' },
        { label: 'MTBF (Confiabilidad)', value: latestReport.MTBF, icon: Clock, color: 'text-green-600' },
    ];


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl w-[95%] max-h-[90vh]">
                <DialogHeader className="text-left">
                    <DialogTitle className="text-2xl">Historial de Reportes de Mantenimiento</DialogTitle>
                    <DialogDescription className="text-base font-semibold">
                        Último Cálculo: {latestReport.assetName} - {latestReport.timestamp}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex space-x-6 overflow-hidden max-h-[calc(90vh-150px)]">

                    {/* 1. SECCIÓN PRINCIPAL: ÚLTIMO REPORTE (IZQUIERDA) */}
                    <div className="flex-1 space-y-4 pr-6 overflow-y-auto">
                        
                        <h3 className="text-lg font-semibold flex items-center border-b pb-2">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Indicadores del Cálculo Reciente
                        </h3>
                        
                        {/* Resumen de Datos Utilizados */}
                        <div className="grid grid-cols-3 gap-4 border p-3 rounded-md bg-gray-50 dark:bg-gray-800">
                            {assetData.map((data) => (
                                <div key={data.label} className="text-center">
                                    <p className="text-xl font-extrabold text-foreground">{data.value}</p>
                                    <p className="text-xs text-muted-foreground">{data.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Resultados de KPIs */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {kpiResults.map((kpi) => (
                                <Card key={kpi.label} className="text-center p-3 border-l-4 border-primary">
                                    <kpi.icon className={`h-6 w-6 mx-auto mb-1 ${kpi.color}`} />
                                    <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                                    <p className="text-xl font-extrabold mt-1">{kpi.value}</p>
                                </Card>
                            ))}
                        </div>
                        
                        {/* Disponibilidad (Calculado) */}
                        <Card className="shadow-md bg-gray-50 dark:bg-gray-800">
                            <CardContent className="flex items-center justify-between">
                                <p className="text-lg font-semibold">Disponibilidad Operacional:</p>
                                <p className="text-4xl font-extrabold text-purple-600">{availability.toFixed(2)}%</p>
                            </CardContent>
                        </Card>

                    </div>

                    {/* 2. SECCIÓN DE HISTORIAL (DERECHA) */}
                    <div className="w-64 border-l pl-4 shrink-0">
                        <h4 className="font-bold mb-3 text-lg">Historial Completo ({reportHistory.length})</h4>
                        <ScrollArea className="h-full max-h-[calc(90vh-180px)] pr-2">
                            {reportHistory.slice(1).map((report, index) => ( // Muestra todos EXCEPTO el más reciente (index 0)
                                <div key={index} className="border-b py-2 text-sm hover:bg-muted/50 cursor-pointer">
                                    <p className="font-semibold">{report.assetName}</p>
                                    <p className="text-xs text-muted-foreground">{report.timestamp}</p>
                                    <p className="text-xs text-green-600">MTBF: {report.MTBF}</p>
                                </div>
                            ))}
                            {reportHistory.length === 1 && (
                                <p className="text-xs text-muted-foreground mt-4">No hay más reportes anteriores.</p>
                            )}
                        </ScrollArea>
                    </div>
                </div>

                <DialogFooter className="mt-6">
                    <Button onClick={onClose}>Cerrar Historial</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}