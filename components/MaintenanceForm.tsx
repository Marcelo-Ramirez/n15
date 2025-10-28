// components/MaintenanceForm.tsx
'use client';
import { useState } from 'react';
// ✅ CORRECCIÓN: Importamos FullReport directamente del archivo de lógica, eliminando la re-declaración local.
import { calculateIndicators, saveReportToLocalStorage, MaintenanceInput, FullReport } from '@/lib/maintenance_logic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Calculator, AlertCircle } from 'lucide-react';

// ✅ IMPORTAR EL MODAL DE RESULTADOS (Ajusta la ruta si es necesario)
import { MaintenanceResultsModal } from './MaintenanceResultsModal'; 

// ❌ ELIMINAR ESTA LÍNEA (ESTO CAUSABA EL ERROR DE DUPLICACIÓN DE TIPOS):
// type FullReport = MaintenanceInput & MaintenanceIndicators;


export default function MaintenanceForm() {
    const [input, setInput] = useState<MaintenanceInput>({
        assetName: 'Activo Principal',
        totalTimeHours: 2880, // Ej: 4 meses * 30 días * 24 horas = 2880 horas
        numFailures: 6,
        totalDowntimeHours: 1.17, // Ej: 70 min / 60 min = 1.17 horas
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // ❌ ELIMINAR: const router = useRouter();

    // ✅ ESTADOS DEL MODAL: Ahora FullReport es el tipo importado
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [results, setResults] = useState<FullReport | null>(null);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        // Convertir a número solo si el campo no es assetName
        const newValue = id === 'assetName' ? value : Number.parseFloat(value);
        setInput(prev => ({ ...prev, [id]: newValue }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!input.assetName || input.totalTimeHours <= 0 || input.numFailures < 0 || input.totalDowntimeHours < 0) {
            setError('Por favor, complete todos los campos numéricos con valores válidos (> 0).');
            return;
        }

        if (input.totalDowntimeHours > input.totalTimeHours) {
            setError('El tiempo total de inactividad no puede ser mayor al tiempo total considerado.');
            return;
        }

        setLoading(true);
        
        try {
            // 1. Calcular indicadores
            const indicators = calculateIndicators(input);

            // 2. Combinar y guardar en localStorage
            const report: FullReport = { 
                ...input, 
                ...indicators,
                // Nota: Asegurarse que el tipo FullReport en maintenance_logic.ts 
                // ya incluye 'totalRunningTimeHours' y 'timestamp' para que la asignación sea válida.
                totalRunningTimeHours: input.totalTimeHours - input.totalDowntimeHours, 
                timestamp: new Date().toLocaleString(),
            };
            saveReportToLocalStorage(report);

            // 3. Mostrar resultados en el modal
            setResults(report);
            setIsModalOpen(true); 

       } catch (error) {
            console.error('Error durante el cálculo:', error); 
            setError('Error desconocido al realizar el cálculo. Verifique la consola para detalles.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-xl mx-auto shadow-xl">
            {/* ... (CardHeader JSX) ... */}
            <CardHeader>
                <CardTitle className="text-2xl">Calculadora de KPIs de Mantenimiento</CardTitle>
                <p className="text-sm text-muted-foreground">Utiliza datos históricos para proyectar la confiabilidad y mantenibilidad.</p>
                {error && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-md flex items-center text-sm">
                        <AlertCircle className="w-4 h-4 mr-2" /> {error}
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    <div className="space-y-2">
                        <Label htmlFor="assetName">Nombre del Activo / Equipo</Label>
                        <Input id="assetName" value={input.assetName} onChange={handleChange} required />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="totalTimeHours">Tiempo Total de Observación (horas)</Label>
                            <Input id="totalTimeHours" type="number" step="0.01" value={input.totalTimeHours} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="numFailures">Número Total de Fallas</Label>
                            <Input id="numFailures" type="number" step="1" value={input.numFailures} onChange={handleChange} required />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="totalDowntimeHours">Tiempo Total de Inactividad / Reparación (horas)</Label>
                        <Input id="totalDowntimeHours" type="number" step="0.01" value={input.totalDowntimeHours} onChange={handleChange} required />
                        <p className="text-xs text-muted-foreground">Suma de los tiempos que el equipo estuvo detenido por reparación.</p>
                    </div>

                    <Separator />

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Calculator className="mr-2 h-4 w-4" />
                        )}
                        Calcular y Generar Reporte
                    </Button>
                </form>
            </CardContent>
             {/* ⬅️ Aquí va el modal */}
             <MaintenanceResultsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                reportData={results}
            />
        </Card>
    );
}