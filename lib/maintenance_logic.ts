// lib/maintenance_logic.ts

// --- Tipos de Datos ---

export interface MaintenanceInput {
    assetName: string;
    totalTimeHours: number;        // Tiempo total considerado
    numFailures: number;           // Número total de fallos
    totalDowntimeHours: number;    // Suma de los tiempos de reparación (Inactividad)
}

export interface MaintenanceIndicators {
    MTTR: string;
    MTTF: string;
    MTBF: string;
}

// ✅ NUEVO TIPO DE REPORTE COMPLETO CON METADATOS DE HISTORIAL
export type FullReport = MaintenanceInput & MaintenanceIndicators & { 
    totalRunningTimeHours: number; 
    timestamp: string; // Marca de tiempo para ordenar el historial
};

// --- Persistencia en LocalStorage (Historial) ---

const STORAGE_KEY = 'maintenance_report_data_history'; // ⬅️ Nueva clave para el historial

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
            
            // Calculamos el tiempo correcto y añadimos el timestamp
            const totalRunningTimeHours = Math.max(0, newReport.totalTimeHours - newReport.totalDowntimeHours);
            
            const reportWithMetadata: FullReport = {
                ...newReport,
                totalRunningTimeHours: totalRunningTimeHours,
                timestamp: new Date().toLocaleString(), // Añadir fecha y hora
            };

            // Añadir el nuevo reporte al inicio del array (último en entrar, primero en mostrar)
            const newHistory = [reportWithMetadata, ...history];
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
        }
    } catch (error) {
        console.error("Error guardando reporte en localStorage:", error);
    }
}


// --- Lógica de Cálculo ---

/**
 * Calcula los tres indicadores clave de mantenimiento (MTTR, MTTF, MTBF) en HORAS/FALLO.
 * @param input Datos ingresados por el formulario.
 */
export function calculateIndicators(input: MaintenanceInput): MaintenanceIndicators {
    const { totalTimeHours, totalDowntimeHours, numFailures } = input;

    if (numFailures <= 0) {
        return { MTTR: "0.00 h/falla", MTTF: "N/A", MTBF: "N/A" };
    }
    
    const totalRunningTimeHours = Math.max(0, totalTimeHours - totalDowntimeHours);

    // 1. MTTR (Mean Time To Repair)
    const mttr = totalDowntimeHours / numFailures;

    // 2. MTTF (Mean Time To Failure)
    const mttf = totalRunningTimeHours / numFailures;

    // 3. MTBF (Mean Time Between Failures)
    const mtbf = totalTimeHours / numFailures;

    return {
        MTTR: `${mttr.toFixed(2)} h/falla`,
        MTTF: `${mttf.toFixed(2)} h/falla`,
        MTBF: `${mtbf.toFixed(2)} h/falla`,
    };
}