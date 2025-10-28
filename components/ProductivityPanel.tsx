"use client";
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

type ProductSummary = { productId: number; name: string; quantity: number; pricePerUnit: number; revenue: number };

export default function ProductivityPanel({ initialData }: { initialData?: { rawMaterialCost?: number; salesRevenue?: number; products?: ProductSummary[] } } ) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [laborCost, setLaborCost] = useState<number | ''>('');
  const [rawMaterialCost, setRawMaterialCost] = useState<number | null>(initialData?.rawMaterialCost ?? null);
  const [salesRevenue, setSalesRevenue] = useState<number | null>(initialData?.salesRevenue ?? null);
  const [products, setProducts] = useState<ProductSummary[]>(initialData?.products ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Keep client state in sync when server-provided initialData changes (e.g., navigation)
  useEffect(() => {
    if (initialData) {
      setRawMaterialCost(initialData.rawMaterialCost ?? null);
      setSalesRevenue(initialData.salesRevenue ?? null);
      setProducts(initialData.products ?? []);
    }
  }, [initialData]);
  const fetchMonth = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      setError(null);
  console.log('ProductivityPanel: fetching month data for', { year, month });
      const res = await fetch(`/api/admin/productivity/month-data?year=${year}&month=${month}`, { credentials: 'include' });
  console.log('ProductivityPanel: fetch sent to', `/api/admin/productivity/month-data?year=${year}&month=${month}`);
      const json = await res.json();
      // Debug: log full response so the button reveals what the API returned
      // Use console.group for readability
      try {
        console.groupCollapsed('productivity/month-data response');
        console.log('status', res.status, 'ok', res.ok);
        console.log('body', json);
        console.groupEnd();
      } catch (logErr) {
        // ignore logging errors
      }
      if (!res.ok) {
        // Keep previously rendered initialData values; just surface the error
        setError(json?.error || 'Error fetching data');
        return false;
      }

      setRawMaterialCost(Number((json.rawMaterialCost || 0).toFixed(2)));
      setSalesRevenue(Number((json.salesRevenue || 0).toFixed(2)));
      setProducts(json.products || []);
      return true;
    } catch (e) {
      console.error(e);
      setError('Network error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    // Don't auto-fetch on mount: rely on server-provided initialData to render immediately.
    // Keep this effect to refresh when year/month change only if you want auto-refresh.
    // For now, do nothing here so the 'Actualizar' button controls client fetches.
  }, [fetchMonth]);

  // fetchMonth implemented above with useCallback

  const profits = salesRevenue !== null && rawMaterialCost !== null && laborCost !== '' ? salesRevenue - rawMaterialCost - Number(laborCost) : null;
  const fmt = (n: number) => n.toLocaleString('es-ES', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

  // Productivity = salesRevenue / (rawMaterialCost + laborCost)
  const productivity = (() => {
    if (salesRevenue === null || rawMaterialCost === null || laborCost === '') return null;
    const denom = rawMaterialCost + Number(laborCost);
    if (denom === 0) return null;
    return salesRevenue / denom;
  })();

  // debug
  useEffect(() => {
    console.log('productivity debug', { salesRevenue, rawMaterialCost, laborCost, productivity });
  }, [salesRevenue, rawMaterialCost, laborCost, productivity]);

  return (
    <div>
      <div className="flex gap-2 items-center mb-4">
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="border p-2 rounded">
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i+1} value={i+1}>{i+1}</option>
          ))}
        </select>
        <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="border p-2 rounded w-24" />
        </div>
            <div className="mb-4 flex gap-2">
                <button
                    type="button"
            onClick={async () => {
              console.log('btn Actualizar clicked for', { year, month });
              try {
                const ok = await fetchMonth();
                // if fetchMonth could not confirm success, fallback to server navigation
                if (!ok) {
                  console.log('client fetch did not return ok - navigating to server page to force initialData');
                  router.push(`/sys/admin/productivity?year=${year}&month=${month}`);
                }
              } catch (e) {
                console.error('error on actualizar click', e);
                router.push(`/sys/admin/productivity?year=${year}&month=${month}`);
              }
            }}
                    disabled={loading}
                    className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
                >
                    {loading ? 'Cargando...' : 'Actualizar'}
                </button>
            </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Costo de Materia Prima</Label>
          <Card className="p-3 mt-2">{loading ? 'Cargando...' : (rawMaterialCost !== null ? fmt(rawMaterialCost) : '-')}</Card>
        </div>

        <div>
          <Label>Costo de mano de obra</Label>
            <Input type="number" value={laborCost === '' ? '' : String(laborCost)} onChange={(e) => setLaborCost(e.target.value === '' ? '' : Number(e.target.value))} />
        </div>

        <div>
          <Label>Ganancias</Label>
          <Card className="p-3 mt-2">{loading ? 'Cargando...' : (salesRevenue !== null ? fmt(salesRevenue) : '-')}</Card>
        </div>

        <div>
          <Label>Resultado (Ganancias - MP - Mano de obra)</Label>
      <Card className="p-3 mt-2">{profits !== null ? fmt(Number(profits.toFixed(2))) : '-'}</Card>
        </div>

        <div>
          <Label>Productividad (Ganancias / (MP + Mano obra))</Label>
          <Card className="p-3 mt-2">{productivity !== null ? productivity.toFixed(4) : '-'}</Card>
        </div>
      </div>

    {error && <div className="mt-4 text-destructive">{error}</div>}

      <div className="mt-6">
        <h3 className="font-medium">Detalle por producto</h3>
        <Card className="p-3 mt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio/u</th>
                <th>Recaudación</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.productId}>
                  <td>{p.name}</td>
                  <td>{p.quantity}</td>
                  <td>{p.pricePerUnit}</td>
                  <td>{p.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}
