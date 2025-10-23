"use client";

import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  Button,
  Spinner,
  SimpleGrid,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const InventoryEOQGraph = dynamic(() => import("@/components/InventoryEOQGraph"), { ssr: false });


import { Suspense } from "react";


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
  const [loadingModel, setLoadingModel] = useState(false);
  const [showGraph, setShowGraph] = useState(false);

  // Al cargar, obtener modelo EOQ guardado y demanda anual
  useEffect(() => {
    if (ingredientId) {
      fetchEOQModel();
      fetchAnnualDemand();
      fetchDailyDemand();
    }
    // eslint-disable-next-line
  }, [ingredientId]);
  const fetchDailyDemand = async () => {
    setLoadingDaily(true);
    try {
      const res = await fetch(`/api/system/inventory/ingredients/daily-demand?ingredientId=${ingredientId}`);
      const data = await res.json();
      setDailyDemand(data.dailyDemand ?? 0);
    } catch {
      setDailyDemand(0);
    }
    setLoadingDaily(false);
  };

  const fetchEOQModel = async () => {
    setLoadingModel(true);
    try {
      const res = await fetch(`/api/system/inventory/ingredients/eoq-model?ingredientId=${ingredientId}`);
      const data = await res.json();
      if (data.model) {
        setAnnualDemand(data.model.annualDemand ?? null);
        setOrderingCost(data.model.orderingCost?.toString() ?? "");
        setAnnualMaintenanceCost(data.model.annualMaintenanceCost?.toString() ?? "");
        setLeadTimeDays(data.model.leadTimeDays !== undefined ? data.model.leadTimeDays.toString() : "");
        setDailyDemand(data.model.dailyDemand !== undefined ? data.model.dailyDemand : null);
        setReorderPoint(data.model.reorderPoint !== undefined ? data.model.reorderPoint : null);
        // Calcula EOQ si todos los datos existen
        if (
          data.model.annualDemand &&
          data.model.orderingCost &&
          data.model.annualMaintenanceCost
        ) {
          const D = Number(data.model.annualDemand);
          const S = Number(data.model.orderingCost);
          const H = Number(data.model.annualMaintenanceCost);
          if (!isNaN(D) && !isNaN(S) && !isNaN(H) && D > 0 && S > 0 && H > 0) {
            setEoq(Math.sqrt((2 * D * S) / H));
          }
        }
      }
    } catch {}
    setLoadingModel(false);
  };

  const fetchAnnualDemand = async () => {
    setLoadingDemand(true);
    setError(null);
    try {
      const res = await fetch(`/api/system/inventory/ingredients/eoq-annual-demand?ingredientId=${ingredientId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al calcular demanda anual");
      setAnnualDemand(data.annualDemand);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoadingDemand(false);
    }
  };

  const handleCalculateEOQ = async () => {
    if (!annualDemand || !orderingCost || !annualMaintenanceCost) {
      setError("Completa todos los campos para calcular EOQ");
      return;
    }
    const D = Number(annualDemand);
    const S = Number(orderingCost);
    const H = Number(annualMaintenanceCost);
    if (isNaN(D) || isNaN(S) || isNaN(H) || D <= 0 || S <= 0 || H <= 0) {
      setError("Todos los valores deben ser números positivos");
      return;
    }
    // EOQ = sqrt(2DS/H)
    const eoqValue = Math.sqrt((2 * D * S) / H);
    setEoq(eoqValue);
    setError(null);
    // Guardar modelo EOQ en backend
    try {
      await fetch(`/api/system/inventory/ingredients/eoq-model`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredientId,
          annualDemand: D,
          orderingCost: S,
          annualMaintenanceCost: H,
        }),
      });
    } catch {}
  };

  // Calcular y guardar reorder point
  const handleReorderPoint = async () => {
    setError(null);
    const lead = Number(leadTimeDays);
    const daily = Number(dailyDemand);
    if (isNaN(lead) || isNaN(daily) || lead <= 0 || daily <= 0) {
      setError("LeadTimeDays y DailyDemand deben ser números positivos");
      return;
    }
    const rp = lead * daily;
    setReorderPoint(rp);
    // Guardar en backend
    try {
      await fetch(`/api/system/inventory/ingredients/eoq-model`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredientId,
          reorderPoint: rp,
          leadTimeDays: lead,
          dailyDemand: daily
        }),
      });
    } catch {}
  };

  // Accionar todos los generates
  const handleGenerateAll = async () => {
    await fetchAnnualDemand();
    await handleCalculateEOQ();
    await fetchDailyDemand();
    await handleReorderPoint();
  };

  return (
    <Box p={4} maxW="900px" mx="auto" border="2px solid #fff" borderRadius="2xl" bg="#181818">
      <HStack mb={2} justify="space-between">
        <Button variant="ghost" onClick={() => router.back()} fontSize="2xl">←</Button>
        <HStack gap={2}>
          <Button variant="outline">Print</Button>
          <Button variant="outline" onClick={handleGenerateAll}>Generate Everyting</Button>
        </HStack>
      </HStack>
      <Heading size="md" mb={2}>Ingredient model EOQ</Heading>
  <SimpleGrid columns={5} gap={4} mb={2}>
        <Box>
          <Text mb={1}>OrderingCost</Text>
          <Input value={orderingCost} onChange={e => setOrderingCost(e.target.value)} />
        </Box>
        <Box>
          <Text mb={1}>AnnualMaintenanceCost</Text>
          <Input value={annualMaintenanceCost} onChange={e => setAnnualMaintenanceCost(e.target.value)} />
        </Box>
        <Box>
          <Text mb={1}>AnnualDemand</Text>
          <HStack>
            <Input value={annualDemand ?? ''} readOnly />
            <Button size="sm" onClick={fetchAnnualDemand} loading={loadingDemand}>generate</Button>
          </HStack>
        </Box>
        <Box>
          <Text mb={1}>EOQ</Text>
          <HStack>
            <Input value={eoq !== null ? eoq.toFixed(2) : ''} readOnly />
            <Button size="sm" onClick={handleCalculateEOQ}>generate</Button>
          </HStack>
        </Box>
      </SimpleGrid>
      <Box h="2px" bg="#fff" my={2} />
  <SimpleGrid columns={3} gap={4} mb={2}>
        <Box>
          <Text mb={1}>LeadTimeDays</Text>
          <Input value={leadTimeDays} onChange={e => setLeadTimeDays(e.target.value)} />
        </Box>
        <Box>
          <Text mb={1}>DailyDemand</Text>
          <HStack>
            <Input value={dailyDemand ?? ''} readOnly />
            <Button size="sm" onClick={fetchDailyDemand} loading={loadingDaily}>generate</Button>
          </HStack>
        </Box>
        <Box>
          <Text mb={1}>ReorderPoint</Text>
          <HStack>
            <Input value={reorderPoint !== null ? reorderPoint : ''} readOnly />
            <Button size="sm"
              onClick={handleReorderPoint}
              disabled={
                !leadTimeDays || isNaN(Number(leadTimeDays)) || Number(leadTimeDays) <= 0 ||
                dailyDemand === null || isNaN(Number(dailyDemand)) || Number(dailyDemand) <= 0
              }
            >
              generate
            </Button>
          </HStack>
        </Box>
      </SimpleGrid>
      <Box h="2px" bg="#fff" my={2} />
      <Box>
        <Text mb={1}>Grafic</Text>
        <Button size="sm" variant="outline" onClick={() => setShowGraph(true)}>generate</Button>
      </Box>
      {showGraph && eoq && reorderPoint && leadTimeDays && annualDemand && (
        <InventoryEOQGraph
          eoq={Number(eoq)}
          reorderPoint={Number(reorderPoint)}
          leadTime={Number(leadTimeDays)}
          periods={Math.max(1, Math.round(Number(annualDemand) / Number(eoq)))}
            annualDemand={Number(annualDemand)}
          />
      )}
      {error && <Text color="red.500">{error}</Text>}
    </Box>
  );
}

export default function EOQModelPage() {
  return (
    <Suspense>
      <EOQModelPageInner />
    </Suspense>
  );
}
