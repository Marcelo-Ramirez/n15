"use client";

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

type Product = { id: number; name: string; flavor: string; type: string; currentQuantity: number; pricePerUnit: number };

export default function ProductionCapacityPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [mode, setMode] = useState<'individual' | 'todo'>('individual');

  // inputs
  const [designCapacity, setDesignCapacity] = useState<number | ''>('');
  const [effectiveCapacity, setEffectiveCapacity] = useState<number | ''>('');

  // results
  const [soldToday, setSoldToday] = useState<number | null>(null);
  const [utilization, setUtilization] = useState<number | null>(null);
  const [efficiency, setEfficiency] = useState<number | null>(null);
  const [estimatedProduction, setEstimatedProduction] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/admin/production-capacity/products')
      .then(r => r.json())
      .then(data => setProducts(data.products || []))
      .catch(console.error);
  }, []);

  // types derived from products (kept for future use)

  function selectProduct(p: Product) {
    setSelectedProduct(p);
    setMode('individual');
    setSoldToday(null);
    setUtilization(null);
    setEfficiency(null);
    setEstimatedProduction(null);
  }

  // Auto-fetch sold today when a product is selected (or when mode/times change)
  useEffect(() => {
    let mounted = true;
    async function fetchSold() {
      try {
        if (mode === 'individual' && selectedProduct) {
          const res = await fetch(`/api/admin/production-capacity/sales-today?productId=${selectedProduct.id}`);
          const json = await res.json();
          if (!mounted) return;
          setSoldToday(json.total ?? 0);
        } else if (mode === 'todo') {
          // In 'todo' mode fetch total for ALL products for today
          const res = await fetch(`/api/admin/production-capacity/sales-today`);
          const json = await res.json();
          if (!mounted) return;
          setSoldToday(json.total ?? 0);
        }
      } catch (e) {
        console.error('Error fetching sold today', e);
      }
    }
    fetchSold();
    return () => { mounted = false; };
  }, [selectedProduct, mode]);

  async function calculate() {
    let totalSold = 0;
    if (mode === 'individual') {
      if (!selectedProduct) return alert('Seleccione un producto');
      const res = await fetch(`/api/admin/production-capacity/sales-today?productId=${selectedProduct.id}`);
      const json = await res.json();
      totalSold = json.total ?? 0;
    } else {
      // mode todo -> aggregate across ALL sale records for today
      const res = await fetch(`/api/admin/production-capacity/sales-today`);
      const json = await res.json();
      totalSold = json.total ?? 0;
    }

  setSoldToday(totalSold);

  // formulas (from images):
  // Utilizacion = Capacidad Utilizada / Capacidad Diseñada
  // Eficiencia = Capacidad Utilizada / Capacidad Efectiva
  // Produccion estimada = Capacidad diseñada * Utilizacion * Eficiencia

  const util = (designCapacity && designCapacity !== 0) ? totalSold / designCapacity : null;
  const eff = (effectiveCapacity && effectiveCapacity !== 0) ? totalSold / effectiveCapacity : null;
  const prodEst = (util !== null && eff !== null && designCapacity) ? Number(designCapacity) * util * eff : null;

  setUtilization(util !== null ? Number((util * 100).toFixed(2)) : null);
  setEfficiency(eff !== null ? Number((eff * 100).toFixed(2)) : null);
  setEstimatedProduction(prodEst !== null ? Number(prodEst.toFixed(2)) : null);
  }

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <h1 className="text-2xl font-semibold">Capacidad de producción</h1>
        <div className="text-sm text-muted-foreground">Hoy {new Date().toLocaleDateString('es-ES')}</div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <div className="mb-4 flex gap-2">
            <Button variant={mode === 'individual' ? 'default' : 'ghost'} onClick={() => setMode('individual')}>individual</Button>
            <Button variant={mode === 'todo' ? 'default' : 'ghost'} onClick={() => setMode('todo')}>todo</Button>
          </div>

          {mode === 'individual' ? (
            <Card className="p-2 h-[60vh] overflow-auto">
              {products.map(p => (
                <div key={p.id} className={`p-2 rounded mb-2 cursor-pointer ${selectedProduct?.id === p.id ? 'bg-accent/30' : 'hover:bg-muted/10'}`} onClick={() => selectProduct(p)}>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-muted-foreground">{p.flavor} • {p.type}</div>
                </div>
              ))}
            </Card>
          ) : (
            <Card className="p-2 h-[60vh] flex items-center justify-center text-sm text-muted-foreground">Modo &quot;todo&quot; — calculando/mostrando total de ventas de hoy</Card>
          )}
        </div>

        <div className="col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nombre de Producto</Label>
              <Input value={mode === 'todo' ? 'Todo' : (selectedProduct?.name ?? '')} readOnly />
            </div>
            <div>
              <Label>Capacidad de diseño (unidades/día)</Label>
              <Input type="number" value={designCapacity === '' ? '' : String(designCapacity)} onChange={(e) => setDesignCapacity(e.target.value === '' ? '' : Number(e.target.value))} />
            </div>

            <div>
              <Label>Capacidad Efectiva (unidades/día)</Label>
              <Input type="number" value={effectiveCapacity === '' ? '' : String(effectiveCapacity)} onChange={(e) => setEffectiveCapacity(e.target.value === '' ? '' : Number(e.target.value))} />
            </div>
            <div className="flex items-end">
              <Button onClick={calculate}>CALCULAR</Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">Capacidad real (vendido hoy)</div>
                <div className="text-xl font-semibold">{soldToday ?? '-'}</div>
                <div className="mt-2 text-sm">Utilización: {utilization ?? '-'}%</div>
              </Card>
            </div>

            <div>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">Eficiencia</div>
                <div className="text-xl font-semibold">{efficiency ?? '-'}%</div>
                <div className="mt-2 text-sm">Producción estimada: {estimatedProduction ?? '-'} unidades/día</div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
