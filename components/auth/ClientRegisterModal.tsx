// components/auth/ClientRegisterModal.tsx (CORREGIDO)
'use client'

import React, { useState } from 'react' // Import React for FormEvent
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

// ✅ Añadido confirmPassword
interface FormData {
    userName: string
    name: string
    phone: string
    password: string
    confirmPassword: string // Nuevo campo
}

// Interfaz para errores de formulario
interface FormErrors {
    [key: string]: string | undefined; // Permite acceder con claves string
}


export function ClientRegisterModal({ isOpen, onClose, onOpenLogin }: { isOpen: boolean, onClose: () => void, onOpenLogin: () => void }) {
    // ✅ Estado inicial con confirmPassword
    const [formData, setFormData] = useState<FormData>({ userName: '', name: '', phone: '', password: '', confirmPassword: '' })
    const [isLoading, setIsLoading] = useState(false)
    const [serverError, setServerError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    // ✅ Estado para errores de validación del frontend
    const [errors, setErrors] = useState<FormErrors>({})

    // ✅ Validación del Frontend (Incluye confirmPassword)
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.userName.trim()) newErrors.userName = 'Usuario requerido';
        if (!formData.name.trim()) newErrors.name = 'Nombre requerido';
        if (!formData.phone.trim()) newErrors.phone = 'Teléfono requerido';
        if (!formData.password) newErrors.password = 'Contraseña requerida';
        else if (formData.password.length < 6) newErrors.password = 'Contraseña debe tener al menos 6 caracteres';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        // Limpiar error al escribir
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
        // Limpiar error de confirmación si se edita la contraseña
        if (field === 'password' && errors.confirmPassword) {
             setErrors(prev => ({ ...prev, confirmPassword: undefined }));
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setServerError('')
        setSuccessMessage('')

        // ✅ Ejecutar validación del frontend primero
        if (!validateForm()) {
            return; 
        }

        setIsLoading(true)

        try {
            // Preparamos los datos a enviar (sin confirmPassword)
            const dataToSend = {
                userName: formData.userName,
                name: formData.name,
                phone: formData.phone,
                password: formData.password,
            };

            const response = await fetch('/api/auth/clientregister', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend), // Enviamos solo los datos necesarios
            })

            const data = await response.json()

            if (!response.ok) {
                // El error 400 viene de aquí si la API rechaza los datos
                throw new Error(data.message || 'Error en el registro.')
            }

            setSuccessMessage('Registro exitoso. Serás redirigido al inicio de sesión.')
            setFormData({ userName: '', name: '', phone: '', password: '', confirmPassword: '' }) // Limpiar formulario completo
            
            setTimeout(() => {
                onClose();
                onOpenLogin();
            }, 1500);

        } catch (error) {
            setServerError(error instanceof Error ? error.message : 'Error desconocido')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Registro de Cliente</DialogTitle>
                    <DialogDescription>Crea tu cuenta para comprar nuestras gomitas.</DialogDescription>
                </DialogHeader>
                
                {serverError && <p className="text-destructive text-sm font-medium p-2 bg-destructive/10 rounded">{serverError}</p>}
                {successMessage && <p className="text-green-600 bg-green-100 p-2 rounded text-sm font-medium">{successMessage}</p>}

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {/* Campos individuales para mejor control */}
                    <div className="space-y-2">
                        <Label htmlFor="userName">Usuario</Label>
                        <Input id="userName" value={formData.userName} onChange={handleInputChange('userName')} required className={errors.userName ? 'border-destructive' : ''}/>
                        {errors.userName && <p className="text-destructive text-xs">{errors.userName}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre Completo</Label>
                        <Input id="name" value={formData.name} onChange={handleInputChange('name')} required className={errors.name ? 'border-destructive' : ''}/>
                         {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input id="phone" type="tel" value={formData.phone} onChange={handleInputChange('phone')} required className={errors.phone ? 'border-destructive' : ''}/>
                         {errors.phone && <p className="text-destructive text-xs">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input id="password" type="password" value={formData.password} onChange={handleInputChange('password')} required className={errors.password ? 'border-destructive' : ''}/>
                         {errors.password && <p className="text-destructive text-xs">{errors.password}</p>}
                    </div>
                    {/* ✅ Campo de Confirmar Contraseña */}
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                        <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange('confirmPassword')} required className={errors.confirmPassword ? 'border-destructive' : ''}/>
                        {errors.confirmPassword && <p className="text-destructive text-xs">{errors.confirmPassword}</p>}
                    </div>
                    
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Crear Cuenta'}
                    </Button>
                </form>

                <div className='flex justify-center text-sm pt-2'>
                    <Button variant="link" onClick={() => { onClose(); onOpenLogin(); }}>
                        ¿Ya tienes cuenta? Iniciar Sesión
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}