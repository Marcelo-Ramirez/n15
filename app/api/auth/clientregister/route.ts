// app/api/auth/client-register/route.ts
import { NextResponse } from 'next/server';
import { createUser } from '@/lib/db'; 

export async function POST(req: Request) {
    try {
        const { userName, name, phone, password } = await req.json();

        // 1. Validación básica de datos (mantenida)
        if (!userName || !name || !phone || !password) {
            return NextResponse.json({ message: 'Todos los campos son requeridos.' }, { status: 400 });
        }
        
        const newUser = await createUser(
            userName, 
            name, 
            password, 
            phone, 
            'cliente' // Rol fijo
        );

        if (newUser) {
             return NextResponse.json({ success: true, userId: newUser.id }, { status: 200 });
        } else {
            // Si createUser devuelve null por alguna razón inesperada
             throw new Error('No se pudo crear el usuario.');
        }

    } catch (error) {
        console.error('Error en API client-register:', error);

        if (error instanceof Error && error.message === "USER_EXISTS") {
            // Devolvemos el 409 con el mensaje genérico
            return NextResponse.json({ message: 'Error al crear la cuenta. Verifique sus datos o intente más tarde.' }, { status: 409 });
        }

        return NextResponse.json({ message: error instanceof Error ? error.message : 'Error interno del servidor al registrar.' }, { status: 500 });
    }
}