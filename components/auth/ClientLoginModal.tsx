// components/auth/ClientLoginModal.tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

// Definición de las props
interface ClientLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
    onOpenRegister: () => void; // Función para abrir el modal de registro
}

export function ClientLoginModal({ isOpen, onClose, onLoginSuccess, onOpenRegister }: ClientLoginModalProps) {
    const [formData, setFormData] = useState({ userName: '', password: '' })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            // Llama al handler de NextAuth, que invoca la función authorize en [...nextauth].ts
            const result = await signIn('credentials', {
                ...formData, 
                redirect: false, // Fundamental: evita la redirección automática
            })
            
            if (result?.error) {
                // El error indica que las credenciales no pasaron la verificación en la DB
                setError('Usuario o contraseña incorrectos.');
                return;
            }
            
            // Si llega aquí, NextAuth ha creado una sesión.
            onLoginSuccess(); // Notifica al componente padre para que actualice la sesión (ej. con useSession)
            onClose();

        } catch (err) {
            setError('Error de conexión con el servidor.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Iniciar Sesión Cliente</DialogTitle>
                    <DialogDescription>Accede a tu carrito y historial de pedidos.</DialogDescription>
                </DialogHeader>
                
                {error && <p className="text-destructive text-sm font-medium">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="userName">Usuario</Label>
                        <Input
                            id="userName"
                            type="text"
                            value={formData.userName}
                            onChange={e => setFormData(d => ({ ...d, userName: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={e => setFormData(d => ({ ...d, password: e.target.value }))}
                            required
                        />
                    </div>
                    
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Entrar'}
                    </Button>
                </form>

                <div className='flex justify-center text-sm pt-2'>
                    {/* ✅ Llama a la función que cierra este modal y abre el de registro */}
                    <Button variant="link" onClick={() => { onClose(); onOpenRegister(); }}>
                        ¿No tienes cuenta? Regístrate
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}