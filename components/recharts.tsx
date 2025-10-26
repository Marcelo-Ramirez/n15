'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Componentes Recharts (Mantenidos)
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip, // Renombramos Tooltip
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  LabelList,
} from 'recharts'; 

// --- Tipos de Datos (Mantenidos) ---
type ParetoData = { name: string; value: number; accumulated: number; };
type ParetoChartProps = { data: ParetoData[]; thresholds?: { A: number; B: number; C: number }; chartHeight?: number; };

interface RechartsRenderProps {
    x?: unknown; 
    y?: unknown;
    width?: unknown;
    value?: unknown;
    viewBox?: { y?: number; width?: number };
    color?: string;
    payload?: unknown;
    dataKey?: string;
}

// --- 1. Custom Tooltip (Sin cambios) ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TooltipPayload = { dataKey: string; value: number; color: string; payload: any; };
type CustomTooltipProps = { active?: boolean; payload?: TooltipPayload[]; label?: string; };

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <Card className="p-2 border bg-card text-card-foreground shadow-lg text-xs">
        <p className="font-semibold mb-1 border-b pb-1">{label}</p>
        {payload.map((entry, index) => {
          const keyName = entry.dataKey === 'accumulated' ? 'Acumulado' : 'Valor';
          const displayValue = entry.dataKey === 'accumulated' ? entry.value.toFixed(1) + '%' : entry.value.toLocaleString();
          
          return (
            <p key={`entry-${index}`} style={{ color: entry.color }}>
              {keyName}: <span className="font-bold">{displayValue}</span>
            </p>
          );
        })}
      </Card>
    );
  }
  return null;
};

// --- 2. Labels de Barra (Corregido: Usa RechartsRenderProps) ---
const renderBarLabel = (props: RechartsRenderProps) => {
  const { x, y, width, value } = props;
  
  // ✅ CLAVE: Convertir los valores de props a números de forma segura
  const xNum = Number(x) || 0;
  const yNum = Number(y) || 0;
  const widthNum = Number(width) || 0;
  const valueNum = Number(value) || 0;
  
  return (
    <g>
      <rect
        x={xNum + widthNum / 2 - 25}
        y={yNum - 25}
        width="50"
        height="18"
        fill="rgba(255, 255, 255, 0.9)"
        stroke="#e2e8f0"
        strokeWidth="1"
        rx="4"
      />
      <text
        x={xNum + widthNum / 2}
        y={yNum - 12}
        fill="#2d3748"
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
      >
        {valueNum.toLocaleString()}
      </text>
    </g>
  );
};

// --- 3. Labels de Línea (Corregido: Usa RechartsRenderProps) ---
const renderLineLabel = (props: RechartsRenderProps) => {
  const { x, y, value } = props;
  
  // ✅ CLAVE: Convertir los valores de props a números de forma segura
  const xNum = Number(x) || 0;
  const yNum = Number(y) || 0;
  const valueNum = Number(value) || 0;
  
  return (
    <g>
      <rect
        x={xNum - 20}
        y={yNum + 8}
        width="40"
        height="16"
        fill="rgba(255, 255, 255, 0.9)"
        stroke="#fed7aa"
        strokeWidth="1"
        rx="3"
      />
      <text
        x={xNum}
        y={yNum + 20}
        fill="#f56500"
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
      >
        {valueNum.toFixed(1)}%
      </text>
    </g>
  );
};

// --- 4. Labels de Referencia ABC (Corregido: Usa RechartsRenderProps) ---
const CustomReferenceLabel = (props: RechartsRenderProps) => {
  const { viewBox, value, color } = props;
  const y = viewBox?.y || 0;
  const width = viewBox?.width || 100;
  const labelValue = String(value || '');
  const labelColor = color || '#000000';
  const centerX = Math.floor(width / 2);

  return (
    <g>
      <rect
        x={centerX - 35}
        y={y + 0}
        width="70"
        height="22"
        fill={labelColor}
        rx="6"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="1"
      />
      <text
        x={centerX}
        y={y + 15}
        fill="white"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
      >
        Cat. {labelValue}
      </text>
    </g>
  );
};


const ParetoChart = ({
  data,
  thresholds = { A: 70, B: 90, C: 100 },
  chartHeight = 450,
}: ParetoChartProps) => {
  const [showABC, setShowABC] = useState(false);

  const chartData = data.map(item => ({
    name: item.name,
    value: item.value,
    accumulated: item.accumulated,
  }));

  return (
    <Card className="shadow-lg">
      <CardContent className="p-4 md:p-6">
        <Button
          variant="secondary"
          className="mb-4 text-sm"
          onClick={() => setShowABC(prev => !prev)}
        >
          <Settings className="h-4 w-4 mr-2" />
          {showABC ? 'Ocultar Líneas ABC' : 'Mostrar Líneas ABC'}
        </Button>
        
        {/* Contenedor del Gráfico: Usa la variable chartHeight */}
        <div className="w-full min-h-[300px] aspect-video bg-gray-50 dark:bg-gray-800 rounded-md p-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart 
              data={chartData} 
              margin={{ top: 30, right: 20, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                angle={-30}
                textAnchor="end"
                height={60}
                interval={0}
              />
              
              {/* Eje Y izquierdo (Valor) */}
              <YAxis 
                yAxisId="y1"
                type="number"
                tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                tickFormatter={(value) => value.toLocaleString()}
                width={50}
                label={{ 
                  value: 'Valor', 
                  angle: -90, 
                  position: 'insideLeft',
                  fill: 'hsl(var(--foreground))',
                  fontSize: '12px',
                }}
              />
              
              {/* Eje Y derecho (Acumulado %) */}
              <YAxis 
                yAxisId="y2" 
                orientation="right"
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
                tick={{ fontSize: 11, fill: '#f56500' }}
                axisLine={{ stroke: '#f56500', strokeWidth: 1 }}
                tickFormatter={(value) => `${value}%`}
                width={50}
                label={{ 
                  value: 'Acumulado %', 
                  angle: 90, 
                  position: 'insideRight',
                  fill: '#f56500',
                  fontSize: '12px',
                }}
              />
              
              <RechartsTooltip content={<CustomTooltip />} />
              
              <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }} />
              
              {/* Barras */}
              <Bar 
                yAxisId="y1"
                dataKey="value" 
                fill="hsl(var(--primary))"
                stroke="hsl(var(--primary))"
                name="Valor"
              >
                <LabelList content={renderBarLabel} />
              </Bar>
              
              {/* Línea */}
              <Line 
                yAxisId="y2"
                type="monotone" 
                dataKey="accumulated" 
                stroke="#f56500" 
                dot={{ fill: '#f56500', r: 4 }}
                name="Acumulado"
              >
                <LabelList content={renderLineLabel} />
              </Line>
              
              {/* Líneas ABC */}
              {showABC && (
                <>
                  <ReferenceLine yAxisId="y2" y={thresholds.A} stroke="#e53e3e" strokeDasharray="5 5" label={<CustomReferenceLabel value="A" color="#e53e3e" />} />
                  <ReferenceLine yAxisId="y2" y={thresholds.B} stroke="#3182ce" strokeDasharray="5 5" label={<CustomReferenceLabel value="B" color="#3182ce" />} />
                  <ReferenceLine yAxisId="y2" y={thresholds.C} stroke="#38a169" strokeDasharray="5 5" label={<CustomReferenceLabel value="C" color="#38a169" />} />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default ParetoChart;