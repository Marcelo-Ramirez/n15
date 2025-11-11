// app/api/system/pronostic/route.ts

import { NextResponse } from 'next/server';
import { ForecastService } from '@/lib/pronosticservice'; // O la ruta correcta

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Definición de rango de fechas (usando los valores enviados)
        const startString = searchParams.get('start');
        const endString = searchParams.get('end');
        
        // La validación de fechas ya no falla 400 porque el frontend lo maneja
        if (!startString || !endString) {
            return NextResponse.json({
                success: false, error: 'Faltan los parámetros de fecha (start y end).',
            }, { status: 400 });
        }

        
        const forecastResults = await ForecastService.generateAllProductsForecast(startString, endString);


        return NextResponse.json({
            success: true,
            forecasts: forecastResults,
        });

    } catch (error) {
        console.error('--- ERROR CRÍTICO GENERANDO PRONÓSTICO ---');
        console.error('[BACKEND-ROUTE] Detalle del Error:', error);
        return NextResponse.json({
            success: false,
            error: `Error interno del servidor. Revise los logs.`,
        }, { status: 500 });
    } finally {
        console.log('');
    }
}