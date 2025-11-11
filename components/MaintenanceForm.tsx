// components/MaintenanceForm.tsx
"use client";
import { useState } from "react";
// ✅ Importamos FullReport y MaintenanceInput (asumiendo que MaintenanceInput en la librería ya tiene todos los campos)
import {
    calculateIndicators,
    saveReportToLocalStorage,
    MaintenanceInput,
    FullReport,
} from "@/lib/maintenance_logic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Calculator, AlertCircle } from "lucide-react";
import { MaintenanceResultsModal } from "./MaintenanceResultsModal";

export default function MaintenanceForm() {
    const today = new Date().toISOString().split("T")[0];
    const oneYearAgo = new Date(
        new Date().setFullYear(new Date().getFullYear() - 1)
    )
        .toISOString()
        .split("T")[0];

    const [input, setInput] = useState<MaintenanceInput>({
        assetName: "Activo Principal",
        startDate: oneYearAgo,
        endDate: today,
        failureDescription: "Fallas recurrentes en sensor y lubricación.",
        totalTimeHours: 2880,
        numFailures: 6,
        totalDowntimeHours: 1.17,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null); // ✅ ESTADOS DEL MODAL: Solo necesitamos controlar la visibilidad (isModalOpen)

    const [isModalOpen, setIsModalOpen] = useState(false); // ❌ ELIMINAMOS: const [results, setResults] = useState<FullReport | null>(null); // Ya no se usa
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { id, value } = e.target;
        let newValue: string | number = value; // Convertir a número solo si el campo es numérico

        if (
            id === "totalTimeHours" ||
            id === "numFailures" ||
            id === "totalDowntimeHours"
        ) {
            newValue = Number.parseFloat(value);
        }

        setInput((prev) => ({ ...prev, [id]: newValue } as MaintenanceInput));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (
            !input.assetName ||
            input.totalTimeHours <= 0 ||
            input.numFailures < 0 ||
            input.totalDowntimeHours < 0 ||
            !input.startDate ||
            !input.endDate
        ) {
            setError(
                "Por favor, complete todos los campos requeridos con valores válidos (> 0)."
            );
            return;
        }
        if (
            new Date(input.startDate).getTime() >= new Date(input.endDate).getTime()
        ) {
            setError("La fecha de inicio debe ser anterior a la fecha de fin.");
            return;
        }
        if (input.totalDowntimeHours > input.totalTimeHours) {
            setError(
                "El tiempo total de inactividad no puede ser mayor al tiempo total considerado."
            );
            return;
        }

        setLoading(true);
        try {
            // 1. Calcular indicadores
            const indicators = calculateIndicators(input); // 2. Combinar y guardar en localStorage (El servicio se encarga del historial)

            const report: FullReport = {
                ...input,
                ...indicators,
                totalRunningTimeHours: input.totalTimeHours - input.totalDowntimeHours,
                timestamp: new Date().toLocaleString(),
            };
            saveReportToLocalStorage(report); // 3. Mostrar resultados en el modal // ❌ ELIMINADO: setResults(report);

            setIsModalOpen(true);
        } catch (error) {
            console.error("Error durante el cálculo:", error);
            setError(
                "Error desconocido al realizar el cálculo. Verifique la consola para detalles."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-xl mx-auto shadow-xl">
            {/* ... (CardHeader JSX) ... */}           {" "}
            <CardHeader className="pb-3 pt-4">
                {" "}
                {/* Ajuste de padding */}               {" "}
                <CardTitle className="text-2xl">
                    Calculadora de KPIs de Mantenimiento
                </CardTitle>
                {" "}
                <p className="text-sm text-muted-foreground">
                    Utiliza datos históricos para proyectar la confiabilidad y
                    mantenibilidad.
                </p>
                {" "}
                {error && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-md flex items-center text-sm">
                        <AlertCircle className="w-4 h-4 mr-2" />{" "}
                        {error}                   {" "}
                    </div>
                )}
                {" "}
            </CardHeader>
            {" "}
            <CardContent className="pt-2">
                {" "}
                {/* Ajuste de padding */}               {" "}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {" "}
                    {/* Ajuste de espacio vertical */}
                    {/* NOMBRE DEL ACTIVO */}                   {" "}
                    <div className="space-y-1">
                        {" "}
                        <Label htmlFor="assetName">Nombre del Activo / Equipo</Label>
                        {" "}
                        <Input
                            id="assetName"
                            value={input.assetName}
                            onChange={handleChange}
                            required
                            className="h-9 text-sm"
                        />
                        {" "}
                    </div>
                    {/* RANGO DE FECHAS */}                  
                    <div className="grid grid-cols-2 gap-4">
                        {" "}
                        <div className="space-y-1">
                            {" "}
                            <Label htmlFor="startDate" className="text-xs">
                                Fecha de Inicio
                            </Label>
                            {" "}
                            <Input
                                id="startDate"
                                type="date"
                                value={input.startDate}
                                onChange={handleChange}
                                required
                                className="h-9 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="endDate" className="text-xs">
                                Fecha de Fin
                            </Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={input.endDate}
                                onChange={handleChange}
                                required
                                className="h-9 text-sm"
                            />
                        </div>
                    </div>
                    {/* DATOS NUMÉRICOS (MTBF) */}                   
                    <div className="grid grid-cols-2 gap-4">
                        {" "}
                        <div className="space-y-1">
                            <Label htmlFor="totalTimeHours" className="text-xs">
                                Tiempo Total Observación (horas)
                            </Label>
                            <Input
                                id="totalTimeHours"
                                type="number"
                                step="0.01"
                                value={input.totalTimeHours}
                                onChange={handleChange}
                                required
                                className="h-9 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            {" "}
                            <Label htmlFor="numFailures" className="text-xs">
                                Número Total de Fallas
                            </Label>
                            <Input
                                id="numFailures"
                                type="number"
                                step="1"
                                value={input.numFailures}
                                onChange={handleChange}
                                required
                                className="h-9 text-sm"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="totalDowntimeHours" className="text-xs">
                            Tiempo Total de Inactividad / Reparación (horas)
                        </Label>
                        <Input
                            id="totalDowntimeHours"
                            type="number"
                            step="0.01"
                            value={input.totalDowntimeHours}
                            onChange={handleChange}
                            required
                            className="h-9 text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            Suma de los tiempos que el equipo estuvo detenido por reparación.
                        </p>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="failureDescription">
                            Descripción General de las Fallas
                        </Label>
                        <textarea
                            id="failureDescription"
                            value={input.failureDescription}
                            onChange={handleChange}
                            rows={3}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px]"
                        />
                    </div>
                    <Separator />                   {" "}
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Calculator className="mr-2 h-4 w-4" />
                        )}
                        Calcular y Generar Reporte
                    </Button>
                </form>
                {" "}
            </CardContent>
            {/* ⬅️ Aquí va el modal */}

            <MaintenanceResultsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
            {" "}
        </Card>
    );
}
