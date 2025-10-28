// lib/maintenance_logic.ts

// --- Tipos de Datos ---

export interface MaintenanceInput {
    assetName: string;
    // Campos de Contexto
    startDate: string; // Fecha de inicio de observación
    endDate: string;   // Fecha de fin de observación
    failureDescription: string; // Descripción de las causas
    // Campos de Cálculo Agregado
    totalTimeHours: number; 
    numFailures: number; 
    totalDowntimeHours: number; 
}

export interface MaintenanceIndicators {
    MTTR: string;
    MTTF: string;
    MTBF: string;
    FailureRate: string; // Tasa de Fallos
}

export type FullReport = MaintenanceInput & MaintenanceIndicators & { 
    totalRunningTimeHours: number; 
    timestamp: string; // Marca de tiempo para ordenar el historial
};


// --- Persistencia en LocalStorage (Historial) ---

const STORAGE_KEY = 'maintenance_report_data_history'; // Clave del historial

/**
 * Carga el array completo de reportes del historial desde localStorage.
 */
export function loadReportHistoryFromLocalStorage(): FullReport[] {
    try {
        if (typeof window !== 'undefined') {
            const data = localStorage.getItem(STORAGE_KEY);
            // Devuelve el array si existe, o un array vacío
            return data ? JSON.parse(data) : [];
        }
        return [];
    } catch (error) {
        console.error("Error cargando historial desde localStorage:", error);
        return [];
    }
}

/**
 * Añade un nuevo reporte al inicio del historial en localStorage.
 */
export function saveReportToLocalStorage(newReport: MaintenanceInput & MaintenanceIndicators): void {
    try {
        if (typeof window !== 'undefined') {
            const history = loadReportHistoryFromLocalStorage();
            
            // Calculamos el tiempo correcto para el reporte final (necesario para el modal/render)
            const totalRunningTimeHours = Math.max(0, newReport.totalTimeHours - newReport.totalDowntimeHours);
            
            const reportWithMetadata: FullReport = {
                ...newReport,
                totalRunningTimeHours: totalRunningTimeHours,
                timestamp: new Date().toLocaleString(), // Añadir fecha y hora
            };

            // Añadir el nuevo reporte al inicio del array
            const newHistory = [reportWithMetadata, ...history];
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
        }
    } catch (error) {
        console.error("Error guardando reporte en localStorage:", error);
    }
}


// --- Lógica de Cálculo ---

/**
 * Calcula los tres indicadores clave de mantenimiento (MTTR, MTTF, MTBF) en HORAS/FALLO,
 * incluyendo la Tasa de Fallos (Lambda).
 * @param input Datos ingresados por el formulario.
 */
export function calculateIndicators(input: MaintenanceInput): MaintenanceIndicators {
    const { totalTimeHours, totalDowntimeHours, numFailures } = input;

    if (numFailures <= 0) {
        return { 
            MTTR: "0.00 h/falla", 
            MTTF: "N/A", 
            MTBF: "N/A",
            FailureRate: "0.0000 fallos/h",
        };
    }
    
    const totalRunningTimeHours = Math.max(0, totalTimeHours - totalDowntimeHours);

    // 1. MTTR (Mean Time To Repair)
    const mttr = totalDowntimeHours / numFailures;

    // 2. MTTF (Mean Time To Failure)
    const mttf = totalRunningTimeHours / numFailures;

    // 3. MTBF (Mean Time Between Failures)
    const mtbf = totalTimeHours / numFailures;
    
    // 4. Tasa de Fallos (Lambda)
    const lambda = 1 / mtbf;

    return {
        MTTR: `${mttr.toFixed(2)} h/falla`,
        MTTF: `${mttf.toFixed(2)} h/falla`,
        MTBF: `${mtbf.toFixed(2)} h/falla`,
        FailureRate: `${lambda.toFixed(4)} fallos/h`, 
    };
}