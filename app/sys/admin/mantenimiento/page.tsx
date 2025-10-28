// app/mantenimiento/page.tsx (Versión FINAL)
'use client';
import { Fragment } from 'react';
import MaintenanceForm from '@/components/MaintenanceForm';
// Ya no es necesario el reporte que lee el localStorage directamente

export default function MaintenancePage() {
    return (
        <Fragment>
            <div className="p-4 md:p-6 space-y-8 max-w-4xl mx-auto">
                <MaintenanceForm /> 
            </div>
        </Fragment>
    );
}