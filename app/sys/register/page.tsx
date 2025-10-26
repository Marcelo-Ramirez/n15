'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface FormData {
  userName: string
  name: string
  phone: string
  password: string
  confirmPassword: string
  role: string
  registrationKey: string
}

interface FormErrors {
  [key: string]: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    userName: '',
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    registrationKey: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.userName.trim()) {
      newErrors.userName = 'El nombre de usuario es requerido'
    } else if (formData.userName.length < 3) {
      newErrors.userName = 'El nombre de usuario debe tener al menos 3 caracteres'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre completo es requerido'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmar contraseña es requerido'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    if (!formData.role) {
      newErrors.role = 'El rol es requerido'
    }

    if (!formData.registrationKey.trim()) {
      newErrors.registrationKey = 'La clave de registro es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }))
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setServerError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro')
      }

      router.push('/sys/login?message=Registro exitoso. Por favor inicia sesión.')
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Registro de Usuario del Sistema</CardTitle>
          <CardDescription>Complete la información para crear una cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          {serverError && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
              {serverError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Nombre de Usuario</Label>
              <Input
                id="userName"
                type="text"
                value={formData.userName}
                onChange={handleInputChange('userName')}
                placeholder="Ingrese su nombre de usuario"
                className={errors.userName ? 'border-destructive' : ''}
              />
              {errors.userName && <p className="text-destructive text-sm mt-1">{errors.userName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange('name')}
                placeholder="Ingrese su nombre completo"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                placeholder="Ingrese su número de teléfono"
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                placeholder="Ingrese su contraseña"
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                placeholder="Confirme su contraseña"
                className={errors.confirmPassword ? 'border-destructive' : ''}
              />
              {errors.confirmPassword && <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select onValueChange={handleRoleChange} value={formData.role}>
                <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Seleccione un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="stockroom">Almacén</SelectItem>
                  <SelectItem value="sales">Ventas</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-destructive text-sm mt-1">{errors.role}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationKey">Clave de Registro</Label>
              <Input
                id="registrationKey"
                type="password"
                value={formData.registrationKey}
                onChange={handleInputChange('registrationKey')}
                placeholder="Ingrese la clave de registro"
                className={errors.registrationKey ? 'border-destructive' : ''}
              />
              {errors.registrationKey && <p className="text-destructive text-sm mt-1">{errors.registrationKey}</p>}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center items-center gap-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">¿Ya tienes una cuenta?</p>
          <NextLink href="/sys/login" className="text-sm text-primary hover:underline">Iniciar Sesión</NextLink>
        </CardFooter>
      </Card>
    </div>
  )
}
