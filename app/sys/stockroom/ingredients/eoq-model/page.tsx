"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense, useCallback } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, Calculator, TrendingUp, Loader2 } from 'lucide-react'; // Iconos

// Importa componentes Shadcn UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Componente EOQ Graph (Asumido como migrado a Recharts/Tailwind)
const InventoryEOQGraph = dynamic(() => import("@/components/InventoryEOQGraph"), { ssr: false });

// --- Componente Lógico Principal ---
function EOQModelPageInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const ingredientId = searchParams.get("ingredientId");
    
    // --- Estados (Mantenidos) ---
    const [annualDemand, setAnnualDemand] = useState<number | null>(null);
    const [loadingDemand, setLoadingDemand] = useState(false);
    const [orderingCost, setOrderingCost] = useState("");
    const [annualMaintenanceCost, setAnnualMaintenanceCost] = useState("");
    const [leadTimeDays, setLeadTimeDays] = useState("");
    const [dailyDemand, setDailyDemand] = useState<number | null>(null);
    const [loadingDaily, setLoadingDaily] = useState(false);
    const [eoq, setEoq] = useState<number | null>(null);
    const [reorderPoint, setReorderPoint] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showGraph, setShowGraph] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false); 

    // --- Funciones de Fetch (Mantenidas) ---

    const fetchDailyDemand = useCallback(async () => {
        if (!ingredientId) return;
        setLoadingDaily(true);
        try {
            const res = await fetch(`/api/system/inventory/ingredients/daily-demand?ingredientId=${ingredientId}`);
            const data = await res.json();
            setDailyDemand(data.dailyDemand ?? 0);
        } catch (err) {
            setError("Error al obtener la demanda diaria.");
            setDailyDemand(0);
        } finally {
            setLoadingDaily(false);
        }
    }, [ingredientId]);

    const fetchAnnualDemand = useCallback(async () => {
        if (!ingredientId) return;
        setLoadingDemand(true);
        setError(null);
        try {
            const res = await fetch(`/api/system/inventory/ingredients/eoq-annual-demand?ingredientId=${ingredientId}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error al calcular demanda anual");
            setAnnualDemand(data.annualDemand ?? null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido al obtener demanda anual");
            setAnnualDemand(null);
        } finally {
            setLoadingDemand(false);
        }
    }, [ingredientId]);

    const fetchEOQModel = useCallback(async () => {
        if (!ingredientId) return;
        setIsCalculating(true); 
        try {
            const res = await fetch(`/api/system/inventory/ingredients/eoq-model?ingredientId=${ingredientId}`);
            const data = await res.json();
            if (data.model) {
                const model = data.model;
                setAnnualDemand(model.annualDemand ?? null);
                setOrderingCost(model.orderingCost?.toString() ?? "");
                setAnnualMaintenanceCost(model.annualMaintenanceCost?.toString() ?? "");
                setLeadTimeDays(model.leadTimeDays?.toString() ?? "");
                setReorderPoint(model.reorderPoint ?? null);
                
                if (model.annualDemand && model.orderingCost && model.annualMaintenanceCost) {
                    const D = Number(model.annualDemand);
                    const S = Number(model.orderingCost);
                    const H = Number(model.annualMaintenanceCost);
                    if (!Number.isNaN(D) && !Number.isNaN(S) && !Number.isNaN(H) && D > 0 && S > 0 && H > 0) {
                        setEoq(Math.sqrt((2 * D * S) / H));
                    } else { setEoq(null); }
                } else { setEoq(null); }
            } else {
                setOrderingCost(""); setAnnualMaintenanceCost(""); setLeadTimeDays(""); setReorderPoint(null); setEoq(null);
            }
        } catch (err) {
            setError("Error al cargar el modelo EOQ guardado.");
        } finally {
            setIsCalculating(false);
        }
    }, [ingredientId]);

    useEffect(() => {
        if (ingredientId) {
            fetchEOQModel();
            fetchAnnualDemand();
            fetchDailyDemand();
        }
    }, [ingredientId, fetchEOQModel, fetchAnnualDemand, fetchDailyDemand]);

    const handleCalculateEOQ = useCallback(async () => {
        setError(null);
        if (annualDemand === null || !orderingCost || !annualMaintenanceCost) {
            setError("Completa Demanda Anual, Costo de Orden y Costo de Mantenimiento para calcular EOQ");
            return;
        }
        const D = Number(annualDemand);
        const S = Number(orderingCost);
        const H = Number(annualMaintenanceCost);
        
        if (Number.isNaN(D) || Number.isNaN(S) || Number.isNaN(H) || D <= 0 || S <= 0 || H <= 0) {
            setError("Demanda Anual, Costo de Orden y Costo de Mantenimiento deben ser números positivos");
            setEoq(null);
            return;
        }
        
        const eoqValue = Math.sqrt((2 * D * S) / H);
        setEoq(eoqValue);
        
        setIsCalculating(true);
        try {
            const res = await fetch(`/api/system/inventory/ingredients/eoq-model`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ingredientId, annualDemand: D, orderingCost: S, annualMaintenanceCost: H,
                    leadTimeDays: Number(leadTimeDays) || null,
                    dailyDemand: dailyDemand ?? null,
                    reorderPoint: reorderPoint ?? null
                }),
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Error al guardar el modelo EOQ");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido al guardar EOQ");
        } finally {
            setIsCalculating(false);
        }
    }, [annualDemand, orderingCost, annualMaintenanceCost, ingredientId, leadTimeDays, dailyDemand, reorderPoint]);

    const handleReorderPoint = useCallback(async () => {
        setError(null);
        if (!leadTimeDays || dailyDemand === null) {
            setError("Completa Lead Time y Demanda Diaria para calcular ROP.");
            return;
        }
        const lead = Number(leadTimeDays);
        const daily = Number(dailyDemand);

        if (Number.isNaN(lead) || Number.isNaN(daily) || lead <= 0 || daily < 0) {
            setError("Lead Time debe ser positivo. Demanda Diaria debe ser 0 o positiva.");
            setReorderPoint(null);
            return;
        }
        
        const rp = lead * daily;
        setReorderPoint(rp);
        
        setIsCalculating(true);
        try {
            const res = await fetch(`/api/system/inventory/ingredients/eoq-model`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ingredientId, reorderPoint: rp, leadTimeDays: lead, dailyDemand: daily,
                    annualDemand: annualDemand ?? null,
                    orderingCost: Number(orderingCost) || null,
                    annualMaintenanceCost: Number(annualMaintenanceCost) || null,
                }),
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Error al guardar el Punto de Reorden");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido al guardar ROP");
        } finally {
            setIsCalculating(false);
        }
    }, [leadTimeDays, dailyDemand, ingredientId, annualDemand, orderingCost, annualMaintenanceCost]);

    const handleGenerateAll = useCallback(async () => {
        setError(null);
        setIsCalculating(true);
        await fetchAnnualDemand();
        await fetchDailyDemand();
        
        await new Promise(resolve => setTimeout(resolve, 100)); // Pequeña pausa para asegurar la actualización de estado
        
        await handleCalculateEOQ();
        await handleReorderPoint();
        setIsCalculating(false);
    }, [fetchAnnualDemand, fetchDailyDemand, handleCalculateEOQ, handleReorderPoint]);
    
    // --- JSX (Migrado) ---
    const isCalculatingAny = loadingDemand || loadingDaily || isCalculating;

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-8 text-foreground">
            {/* Barra Superior */}
            <div className="flex justify-between items-center pb-4 border-b border-border">
                <Button variant="ghost" onClick={() => router.back()} className="text-primary hover:bg-accent" aria-label="Volver">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    <span className="hidden sm:inline">Volver</span>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight text-center">Modelo EOQ</h1>
                <Button
                    onClick={handleGenerateAll}
                    disabled={isCalculatingAny}
                    className="bg-primary hover:bg-primary/90"
                >
                    {isCalculatingAny && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Calcular Todo
                </Button>
            </div>

            {/* Mensaje de error general */}
            {error && (
                <Card className="p-4 bg-destructive/10 border-destructive border">
                    <p className="text-destructive font-medium">{error}</p>
                </Card>
            )}

            {/* 1. Sección EOQ */}
            <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold mb-3">Cálculo EOQ (Cantidad Económica de Pedido)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    
                    {/* Costo por Orden (S) */}
                    <div className="space-y-1">
                        <Label>Costo por Orden (S)</Label>
                        <Input 
                            type="number" 
                            placeholder="Ej: 50"
                            value={orderingCost} 
                            onChange={e => setOrderingCost(e.target.value)} 
                            disabled={isCalculatingAny}
                        />
                    </div>
                    
                    {/* Costo Mant. Anual por Unidad (H) */}
                    <div className="space-y-1">
                        <Label>Costo Mant. Anual por Unidad (H)</Label>
                        <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="Ej: 2.50"
                            value={annualMaintenanceCost} 
                            onChange={e => setAnnualMaintenanceCost(e.target.value)} 
                            disabled={isCalculatingAny}
                        />
                    </div>
                    
                    {/* Demanda Anual (D) */}
                    <div className="space-y-1">
                        <Label>Demanda Anual (D)</Label>
                        <div className="flex space-x-2">
                            <Input value={annualDemand?.toFixed(0) ?? ''} readOnly placeholder="Calculado..." className="bg-muted/50" />
                            <Button 
                                size="sm" 
                                onClick={fetchAnnualDemand} 
                                disabled={isCalculatingAny}
                                className="h-10 text-sm"
                            >
                                {loadingDemand ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Calcular'}
                            </Button>
                        </div>
                    </div>
                    
                    {/* Botón de Cálculo EOQ */}
                    <div className="sm:col-span-3 pt-2">
                        <Button 
                            onClick={handleCalculateEOQ} 
                            disabled={annualDemand === null || !orderingCost || !annualMaintenanceCost || isCalculatingAny}
                            className="w-full bg-green-600 hover:bg-green-700"
                        >
                            <Calculator className="mr-2 h-4 w-4" /> Calcular EOQ (Q*)
                        </Button>
                    </div>
                </div>

                {/* Resultado EOQ */}
                <div className="pt-2">
                    <Label>Resultado EOQ (Q*):</Label>
                    <Input value={eoq?.toFixed(2) ?? ''} readOnly className="font-bold text-lg mt-1 bg-primary/10" />
                </div>
            </Card>

            <Separator className="my-6" />

            {/* 2. Sección ROP */}
            <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold mb-3">Cálculo ROP (Punto de Reorden)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    
                    {/* Lead Time (L) */}
                    <div className="space-y-1">
                        <Label>Lead Time (Días)</Label>
                        <Input 
                            type="number" 
                            placeholder="Ej: 7"
                            value={leadTimeDays} 
                            onChange={e => setLeadTimeDays(e.target.value)} 
                            disabled={isCalculatingAny}
                        />
                    </div>
                    
                    {/* Demanda Diaria Promedio (d) */}
                    <div className="space-y-1">
                        <Label>Demanda Diaria Promedio (d)</Label>
                        <div className="flex space-x-2">
                            <Input value={dailyDemand?.toFixed(2) ?? ''} readOnly placeholder="Calculado..." className="bg-muted/50" />
                            <Button 
                                size="sm" 
                                onClick={fetchDailyDemand} 
                                disabled={isCalculatingAny}
                                className="h-10 text-sm"
                            >
                                {loadingDaily ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Calcular'}
                            </Button>
                        </div>
                    </div>

                     {/* Resultado ROP */}
                    <div className="space-y-1">
                        <Label>Resultado ROP:</Label>
                        <Input value={reorderPoint?.toFixed(2) ?? ''} readOnly className="font-bold text-lg mt-1 bg-orange-100 dark:bg-orange-950 text-orange-600" />
                    </div>
                    
                    {/* Botón de Cálculo ROP */}
                    <div className="sm:col-span-3 pt-2">
                        <Button 
                            onClick={handleReorderPoint}
                            disabled={!leadTimeDays || dailyDemand === null || isCalculatingAny}
                            className="w-full bg-orange-600 hover:bg-orange-700"
                        >
                            <TrendingUp className="mr-2 h-4 w-4" /> Calcular ROP
                        </Button>
                    </div>
                </div>
            </Card>

            <Separator className="my-6" />

            {/* 3. Sección Gráfica */}
            <Card className="p-6 space-y-4 text-center">
                <h2 className="text-xl font-semibold">Gráfico de Inventario</h2>
                <Button 
                    variant="outline" 
                    onClick={() => setShowGraph(prev => !prev)} 
                    disabled={eoq === null || reorderPoint === null || !leadTimeDays || annualDemand === null}
                    className="mb-4"
                >
                    {showGraph ? "Ocultar Gráfica" : "Generar Gráfica EOQ"}
                </Button>
            
                {/* Contenedor de la gráfica */}
                {showGraph && eoq !== null && reorderPoint !== null && leadTimeDays && annualDemand !== null && (
                    <div className="h-[400px] w-full mt-4">
                        <InventoryEOQGraph
                           eoq={eoq}
                           reorderPoint={reorderPoint}
                           leadTime={Number(leadTimeDays)}
                           // Calcular períodos basado en demanda anual y EOQ, asegurando al menos 1
                           periods={Math.max(1, Math.ceil(annualDemand / eoq))} 
                           annualDemand={annualDemand} 
                        />
                    </div>
                )}
            </Card>
        </div>
    );
}

// Componente Wrapper para Suspense (Migrado)
export default function EOQModelPage() {
    return (
        <Suspense fallback={
             <div className="min-h-screen flex items-center justify-center bg-gray-950">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
        }>
            <EOQModelPageInner />
        </Suspense>
    );
}