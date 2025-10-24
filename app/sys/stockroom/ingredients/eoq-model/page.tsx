"use client";

import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Heading,
  Text,
  HStack,
  Input,
  Button,
  SimpleGrid,
  Spinner // Importado Spinner para usarlo
} from "@chakra-ui/react";
// ✅ 1. Importar useCallback
import { useEffect, useState, Suspense, useCallback } from "react";
import dynamic from "next/dynamic";
const InventoryEOQGraph = dynamic(() => import("@/components/InventoryEOQGraph"), { ssr: false });

function EOQModelPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ingredientId = searchParams.get("ingredientId");
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
  // ✅ 2. Eliminado useState para 'loadingModel' no utilizado
  // const [loadingModel, setLoadingModel] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  // Estado de carga específico para guardar/calcular modelo
  const [isCalculating, setIsCalculating] = useState(false); 


  // --- Funciones de Fetch envueltas en useCallback ---

  const fetchDailyDemand = useCallback(async () => {
    if (!ingredientId) return; // Guardián
    setLoadingDaily(true);
    try {
      const res = await fetch(`/api/system/inventory/ingredients/daily-demand?ingredientId=${ingredientId}`);
      const data = await res.json();
      // ✅ 3. Usar ?? para valor por defecto 0
      setDailyDemand(data.dailyDemand ?? 0);
    } catch (err) {
       console.error("Error fetching daily demand:", err);
       setError("Error al obtener la demanda diaria.");
       setDailyDemand(0); // O null, dependiendo de cómo quieras manejar el error
    } finally {
       setLoadingDaily(false);
    }
  }, [ingredientId]);

  const fetchAnnualDemand = useCallback(async () => {
    if (!ingredientId) return; // Guardián
    setLoadingDemand(true);
    setError(null);
    try {
      const res = await fetch(`/api/system/inventory/ingredients/eoq-annual-demand?ingredientId=${ingredientId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al calcular demanda anual");
      // ✅ 3. Usar ?? para valor por defecto null
      setAnnualDemand(data.annualDemand ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido al obtener demanda anual");
      setAnnualDemand(null); // Resetear en caso de error
    } finally {
      setLoadingDemand(false);
    }
  }, [ingredientId]);

  const fetchEOQModel = useCallback(async () => {
    if (!ingredientId) return; // Guardián
    // Usamos el estado general o uno específico si se quiere diferenciar
    setIsCalculating(true); 
    try {
      const res = await fetch(`/api/system/inventory/ingredients/eoq-model?ingredientId=${ingredientId}`);
      const data = await res.json();
      if (data.model) {
        // ✅ 3. Usar ?? para valores por defecto
        setAnnualDemand(data.model.annualDemand ?? null);
        setOrderingCost(data.model.orderingCost?.toString() ?? "");
        setAnnualMaintenanceCost(data.model.annualMaintenanceCost?.toString() ?? "");

        setLeadTimeDays(data.model.leadTimeDays?.toString() ?? "");

        setReorderPoint(data.model.reorderPoint ?? null);
        
        // Calcula EOQ si todos los datos existen al cargar
        if (
          data.model.annualDemand &&
          data.model.orderingCost &&
          data.model.annualMaintenanceCost
        ) {
          const D = Number(data.model.annualDemand);
          const S = Number(data.model.orderingCost);
          const H = Number(data.model.annualMaintenanceCost);

          if (!Number.isNaN(D) && !Number.isNaN(S) && !Number.isNaN(H) && D > 0 && S > 0 && H > 0) {
            setEoq(Math.sqrt((2 * D * S) / H));
          } else {
             setEoq(null); // Resetear si los datos cargados no son válidos
          }
        } else {
            setEoq(null); // Resetear si faltan datos
        }
      } else {
          setOrderingCost("");
          setAnnualMaintenanceCost("");
          setLeadTimeDays("");
          setReorderPoint(null);
          setEoq(null);
      }
    } catch (err) {
        console.error("Error fetching EOQ model:", err);
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
  }, [ingredientId, fetchEOQModel, fetchAnnualDemand, fetchDailyDemand]); // Incluir funciones useCallback

  const handleCalculateEOQ = useCallback(async () => {
    setError(null); // Limpiar errores previos
    if (annualDemand === null || !orderingCost || !annualMaintenanceCost) {
      setError("Completa Demanda Anual, Costo de Orden y Costo de Mantenimiento para calcular EOQ");
      return;
    }
    const D = Number(annualDemand);
    const S = Number(orderingCost);
    const H = Number(annualMaintenanceCost);
    
    // ✅ 5. Usar Number.isNaN
    if (Number.isNaN(D) || Number.isNaN(S) || Number.isNaN(H) || D <= 0 || S <= 0 || H <= 0) {
      setError("Demanda Anual, Costo de Orden y Costo de Mantenimiento deben ser números positivos");
      setEoq(null); // Resetear EOQ si el cálculo falla
      return;
    }
    
    const eoqValue = Math.sqrt((2 * D * S) / H);
    setEoq(eoqValue);
    
    // Guardar modelo EOQ en backend
    setIsCalculating(true);
    try {
      const res = await fetch(`/api/system/inventory/ingredients/eoq-model`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredientId,
          annualDemand: D,
          orderingCost: S,
          annualMaintenanceCost: H,
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
  }, [annualDemand, orderingCost, annualMaintenanceCost, ingredientId, leadTimeDays, dailyDemand, reorderPoint]); // Dependencias de useCallback

  const handleReorderPoint = useCallback(async () => {
    setError(null); // Limpiar errores previos
    if (!leadTimeDays || dailyDemand === null) {
        setError("Completa Lead Time y Demanda Diaria para calcular ROP.");
        return;
    }
    const lead = Number(leadTimeDays);
    const daily = Number(dailyDemand);

    if (Number.isNaN(lead) || Number.isNaN(daily) || lead <= 0 || daily < 0) { // daily puede ser 0
      setError("Lead Time debe ser positivo. Demanda Diaria debe ser 0 o positiva.");
      setReorderPoint(null); // Resetear ROP
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
          ingredientId,
          reorderPoint: rp,
          leadTimeDays: lead,
          dailyDemand: daily,
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
  }, [leadTimeDays, dailyDemand, ingredientId, annualDemand, orderingCost, annualMaintenanceCost]); // Dependencias de useCallback

  const handleGenerateAll = useCallback(async () => {
    await fetchAnnualDemand();
    await fetchDailyDemand();
    
    await new Promise(resolve => setTimeout(resolve, 100)); 
    
    await handleCalculateEOQ(); 
    await handleReorderPoint();

  }, [fetchAnnualDemand, fetchDailyDemand, handleCalculateEOQ, handleReorderPoint]);

  return (
    <Box p={4} maxW="900px" mx="auto" /* bg="#181818" color="white" */ > {/* Estilos base de Chakra */}
      <HStack mb={4} justify="space-between">
        <Button variant="ghost" onClick={() => router.back()} aria-label="Volver">←</Button>
        <Heading size="lg" textAlign="center">Modelo EOQ del Ingrediente</Heading>
        <HStack gap={2}>
          <Button variant="outline" size="sm" /* onClick={handlePrint} */>Imprimir</Button>
          <Button 
             variant="solid" 
             colorScheme="blue" 
             size="sm" 
             onClick={handleGenerateAll}
             loading={loadingDemand || loadingDaily || isCalculating} // Mostrar carga si alguna acción está en curso
          >
             Calcular Todo
          </Button>
        </HStack>
      </HStack>
      
      {/* Sección EOQ */}
      <Heading size="md" mb={3} mt={6}>Cálculo EOQ (Cantidad Económica de Pedido)</Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={6} alignItems="flex-end">
        <Box>
          <Text mb={1} fontSize="sm">Costo por Orden (S)</Text>
          <Input 
             type="number" 
             placeholder="Ej: 50"
             value={orderingCost} 
             onChange={e => setOrderingCost(e.target.value)} 
             disabled={isCalculating}
          />
        </Box>
        <Box>
          <Text mb={1} fontSize="sm">Costo Mant. Anual por Unidad (H)</Text>
          <Input 
             type="number" 
             step="0.01" 
             placeholder="Ej: 2.50"
             value={annualMaintenanceCost} 
             onChange={e => setAnnualMaintenanceCost(e.target.value)} 
             disabled={isCalculating}
          />
        </Box>
        <Box>
          <Text mb={1} fontSize="sm">Demanda Anual (D)</Text>
          <HStack>
            <Input value={annualDemand ?? ''} readOnly placeholder="Calculado..." />
            <Button 
               size="sm" 
               onClick={fetchAnnualDemand} 
               loading={loadingDemand} 
               disabled={isCalculating}
               minW="80px" // Ancho mínimo
             >
               Calcular
             </Button>
          </HStack>
        </Box>
        <Box gridColumn={{ base: "span 1", md: "span 3" }}> 
            <Button 
              w="full" // Ancho completo
              colorScheme="green" 
              onClick={handleCalculateEOQ} 
              loading={isCalculating && !loadingDemand} // Carga si está calculando EOQ específicamente
              disabled={annualDemand === null || !orderingCost || !annualMaintenanceCost || isCalculating}
              mt={2}
             >
              Calcular EOQ (Q*)
            </Button>
        </Box>
         <Box gridColumn={{ base: "span 1", md: "span 3" }} mt={-2}> {/* Resultado EOQ */}
            <Text mb={1} fontSize="sm" fontWeight="bold">Resultado EOQ (Q*):</Text>
             {/* ✅ 6. Usar ?? para EOQ Input */}
            <Input value={eoq?.toFixed(2) ?? ''} readOnly bg="gray.100" />
         </Box>
      </SimpleGrid>

      <Box h="1px" bg="gray.300" my={6} />

      {/* Sección ROP */}
      <Heading size="md" mb={3}>Cálculo ROP (Punto de Reorden)</Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={6} alignItems="flex-end">
        <Box>
          <Text mb={1} fontSize="sm">Lead Time (Días)</Text>
          <Input 
             type="number" 
             placeholder="Ej: 7"
             value={leadTimeDays} 
             onChange={e => setLeadTimeDays(e.target.value)} 
             disabled={isCalculating}
          />
        </Box>
        <Box>
          <Text mb={1} fontSize="sm">Demanda Diaria Promedio</Text>
          <HStack>
            <Input value={dailyDemand?.toFixed(2) ?? ''} readOnly placeholder="Calculado..." />
            <Button 
               size="sm" 
               onClick={fetchDailyDemand} 
               loading={loadingDaily} 
               disabled={isCalculating}
               minW="80px"
            >
              Calcular
            </Button>
          </HStack>
        </Box>
         <Box gridColumn={{ base: "span 1", md: "span 3" }}>
            <Button 
              w="full"
              colorScheme="orange" 
              onClick={handleReorderPoint}
              loading={isCalculating && !loadingDaily} // Carga si calcula ROP específicamente
              disabled={
                !leadTimeDays || Number.isNaN(Number(leadTimeDays)) || Number(leadTimeDays) <= 0 ||
                dailyDemand === null || Number.isNaN(Number(dailyDemand)) || Number(dailyDemand) < 0 || // Puede ser 0
                isCalculating
              }
              mt={2}
            >
              Calcular Punto de Reorden (ROP)
            </Button>
        </Box>
         <Box gridColumn={{ base: "span 1", md: "span 3" }} mt={-2}>
            <Text mb={1} fontSize="sm" fontWeight="bold">Resultado ROP:</Text>
            {/* ✅ 7. Usar ?? para Reorder Point Input */}
            <Input value={reorderPoint?.toFixed(2) ?? ''} readOnly bg="gray.100" />
         </Box>
      </SimpleGrid>

      <Box h="1px" bg="gray.300" my={6} />

      {/* Sección Gráfica */}
      <Box textAlign="center">
          <Button 
            size="md" 
            variant="outline" 
            onClick={() => setShowGraph(prev => !prev)} // Toggle para mostrar/ocultar
            disabled={eoq === null || reorderPoint === null || !leadTimeDays || annualDemand === null} // Deshabilitar si faltan datos
           >
            {showGraph ? "Ocultar Gráfica" : "Generar Gráfica EOQ"}
         </Button>
      </Box>

      {/* Mensaje de error general */}
      {error && <Text color="red.500" mt={4} textAlign="center">{error}</Text>}

      {/* Contenedor de la gráfica */}
      {showGraph && eoq !== null && reorderPoint !== null && leadTimeDays && annualDemand !== null && (
        <Box mt={6}>
           <InventoryEOQGraph
             eoq={eoq} // Ya es número
             reorderPoint={reorderPoint} // Ya es número
             leadTime={Number(leadTimeDays)}
             // Calcular períodos basado en demanda anual y EOQ, asegurando al menos 1
             periods={Math.max(1, Math.ceil(annualDemand / eoq))} 
             annualDemand={annualDemand} // Ya es número
            />
        </Box>
      )}
     
    </Box>
  );
}

// Componente Wrapper para Suspense (no cambia)
export default function EOQModelPage() {
  return (
    <Suspense fallback={<Spinner />}> {/* Añadir un fallback para Suspense */}
      <EOQModelPageInner />
    </Suspense>
  );
}