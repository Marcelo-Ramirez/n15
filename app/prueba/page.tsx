"use client"

import { useState, useEffect } from "react"

export default function RatingsChart() {
  const [value, setValue] = useState<string>("2.5")
  const [maxValue, setMaxValue] = useState<string>("100")
  const [containerWidth, setContainerWidth] = useState<number>(1200)

  // Detectar el ancho de la ventana
  useEffect(() => {
    const updateWidth = () => {
      setContainerWidth(window.innerWidth - 48) // Restamos padding
    }
    
    updateWidth()
    window.addEventListener('resize', updateWidth)
    
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  // Convertir el rating a array de triángulos
  const generateTriangles = (rating: number) => {
    const triangles = []
    const fullTriangles = Math.floor(rating)
    const partialTriangle = rating % 1
    
    // Triángulos completos
    for (let i = 1; i <= fullTriangles; i++) {
      triangles.push({
        id: i,
        value: 1,
        type: 'full'
      })
    }
    
    // Triángulo parcial si existe
    if (partialTriangle > 0) {
      triangles.push({
        id: fullTriangles + 1,
        value: partialTriangle,
        type: 'partial'
      })
    }
    
    return triangles
  }

  const triangles = generateTriangles(Number(value))
  const totalTriangles = triangles.length // Solo los triángulos que realmente existen
  
  // Calcular ancho dinámico para ocupar todo el espacio
  const margin = 80
  const yAxisSpace = 60 // Espacio para etiquetas del eje Y
  const availableWidth = containerWidth - margin - yAxisSpace - 40 // Espacio disponible para triángulos
  
  // Ancho de cada triángulo para ocupar exactamente el espacio disponible
  const spacing = Math.max(2, containerWidth / 800) // Espaciado proporcional
  const totalSpacing = Math.max(0, (totalTriangles - 1) * spacing)
  const shapeWidth = Math.max(15, (availableWidth - totalSpacing) / totalTriangles) // Ocupa todo el ancho
  
  // Ancho total que realmente ocupan los triángulos
  const actualGraphWidth = (shapeWidth * totalTriangles) + totalSpacing

  // Componente de triángulo rectángulo simplificado
  const RightTriangle = ({ 
    x, 
    y, 
    width, 
    height, 
    fillPercent = 1, 
    index 
  }: { 
    x: number
    y: number
    width: number
    height: number
    fillPercent: number
    index: number
  }) => {
    const trianglePath = `
      M${x},${y + height}
      L${x},${y}
      L${x + width},${y + height}
      Z
    `
    
    return (
      <g>
        <defs>
          <clipPath id={`verticalClip-${index}`}>
            <rect 
              x={x} 
              y={y} 
              width={width * fillPercent} 
              height={height} 
            />
          </clipPath>
        </defs>
        
        {/* Triángulo de fondo */}
        <path 
          d={trianglePath}
          fill="none" 
          stroke="#e5e7eb" 
          strokeWidth="2"
        />
        
        {/* Triángulo lleno */}
        {fillPercent > 0 && (
          <path 
            d={trianglePath}
            fill={fillPercent === 1 ? "#10b981" : "#fbbf24"}
            clipPath={`url(#verticalClip-${index})`}
          />
        )}
        
        {/* Línea de corte */}
        {fillPercent > 0 && fillPercent < 1 && (
          <line
            x1={x + width * fillPercent}
            y1={y}
            x2={x + width * fillPercent}
            y2={y + height}
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="3 3"
          />
        )}
        
        {/* Número del triángulo */}
        <text
          x={x + width/2}
          y={y + height + 25}
          textAnchor="middle"
          fontSize="12"
          fill="#374151"
          fontWeight="600"
        >
          {index}
        </text>
      </g>
    )
  }

  return (
    <div className="w-full min-h-screen bg-white p-6" style={{ backgroundColor: 'white' }}>
      {/* Controles */}
      <div className="w-full bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex flex-wrap gap-6 items-center justify-center">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Rating</label>
            <input
              type="number"
              step="0.5"
              min="0"
              placeholder="Ej: 15.5"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Valor Anual Máximo</label>
            <input
              type="number"
              min="1"
              placeholder="Ej: 100"
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-36 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border">
            Triángulos: <span className="font-bold text-blue-600">{totalTriangles}</span>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto" style={{ backgroundColor: 'white' }}>
        <svg 
          width={containerWidth} 
          height="400" 
          viewBox={`0 0 ${containerWidth} 400`}
          className="w-full h-full"
          style={{ backgroundColor: 'white', minWidth: '800px' }}
        >
          {/* Eje Y - Valores del valor anual */}
          {Array.from({ length: 6 }, (_, i) => {
            const value = (Number(maxValue) * i) / 5
            const y = 320 - (i * 45) // Distribución vertical
            return (
              <g key={`y-axis-${i}`}>
                {/* Línea horizontal de guía */}
                <line
                  x1={margin}
                  y1={y}
                  x2={margin + actualGraphWidth}
                  y2={y}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
                {/* Etiqueta del valor */}
                <text
                  x={margin - 15}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="13"
                  fill="#6b7280"
                  fontWeight="500"
                >
                  {value.toFixed(0)}
                </text>
              </g>
            )
          })}

          {/* Eje Y - línea vertical */}
          <line
            x1={margin}
            y1={95}
            x2={margin}
            y2={320}
            stroke="#374151"
            strokeWidth="2"
          />

          {/* Eje X - línea horizontal */}
          <line
            x1={margin}
            y1={320}
            x2={margin + actualGraphWidth}
            y2={320}
            stroke="#374151"
            strokeWidth="2"
          />

          {/* Números de triángulos en eje X */}
          {Array.from({ length: totalTriangles + 1 }, (_, i) => {
            const x = margin + (i * (shapeWidth + spacing))
            // Solo mostrar números cada cierto intervalo para no saturar
            const shouldShow = totalTriangles <= 15 ? true : i % Math.ceil(totalTriangles / 15) === 0 || i === totalTriangles
            
            if (shouldShow) {
              return (
                <g key={`x-axis-${i}`}>
                  <line
                    x1={x}
                    y1={320}
                    x2={x}
                    y2={330}
                    stroke="#374151"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={345}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#6b7280"
                    fontWeight="500"
                  >
                    {i}
                  </text>
                </g>
              )
            }
            return null
          })}

          {/* Triángulos rectángulos */}
          {triangles.map((triangle, index) => (
            <RightTriangle
              key={triangle.id}
              x={margin + (index * (shapeWidth + spacing))}
              y={95}
              width={shapeWidth}
              height={225}
              fillPercent={triangle.value}
              index={triangle.id}
            />
          ))}

          {/* Etiqueta del eje Y */}
          <text
            x={25}
            y={210}
            textAnchor="middle"
            fontSize="14"
            fill="#374151"
            fontWeight="600"
            transform="rotate(-90, 25, 210)"
          >
            Valor Anual
          </text>

          {/* Etiqueta del eje X */}
          <text
            x={margin + actualGraphWidth / 2}
            y={380}
            textAnchor="middle"
            fontSize="14"
            fill="#374151"
            fontWeight="600"
          >
            Número de Triángulos
          </text>

          {/* Área del gráfico */}
          <rect
            x={margin}
            y={95}
            width={actualGraphWidth}
            height={225}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray="5 5"
            opacity="0.3"
          />
        </svg>
      </div>
    </div>
  )
}