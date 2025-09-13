"use client";
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  Stack,
  Card,
  Input,
  Field,
  Link,
  Separator,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { Checkbox } from "@chakra-ui/react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  acceptTerms: boolean;
  newsletter: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    acceptTerms: false,
    newsletter: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (field: keyof RegisterFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(""); // Limpiar errores al escribir
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError("El nombre es requerido");
      return false;
    }
    if (!formData.lastName.trim()) {
      setError("El apellido es requerido");
      return false;
    }
    if (!formData.email.trim()) {
      setError("El email es requerido");
      return false;
    }
    if (!formData.password) {
      setError("La contraseña es requerida");
      return false;
    }
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }
    if (!formData.acceptTerms) {
      setError("Debes aceptar los términos y condiciones");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Registrar el usuario
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("¡Cuenta creada exitosamente! Iniciando sesión...");
        
        // Iniciar sesión automáticamente después del registro
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.ok) {
          router.push("/"); // Redirigir al dashboard
        } else {
          setError("Registro exitoso, pero error al iniciar sesión. Intenta iniciar sesión manualmente.");
        }
      } else {
        setError(data.error || "Error al crear la cuenta");
      }
    } catch (error) {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      setError("Error al registrarse con Google");
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={10} px={4}>
      <Stack gap={8} maxW="md" mx="auto">
        {/* Header */}
        <Stack gap={4} textAlign="center">
          <Heading size="3xl" color="blue.600">
            Crear Cuenta
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Completa el formulario para registrarte
          </Text>
        </Stack>

        {/* Registration Form */}
        <Card.Root boxShadow="md" borderRadius="3xl" overflow="hidden">
          <Card.Body p={8}>
            <form onSubmit={handleSubmit}>
              <VStack gap={6} align="stretch">
                {/* Error Message */}
                {error && (
                  <Text color="red.500" textAlign="center" fontSize="sm">
                    {error}
                  </Text>
                )}

                {/* Success Message */}
                {success && (
                  <Text color="green.500" textAlign="center" fontSize="sm">
                    {success}
                  </Text>
                )}

                {/* Name Fields */}
                <HStack gap={4}>
                  <Field.Root>
                    <Field.Label>Nombre</Field.Label>
                    <Input 
                      placeholder="Tu nombre" 
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      disabled={isLoading}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Apellido</Field.Label>
                    <Input 
                      placeholder="Tu apellido" 
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      disabled={isLoading}
                    />
                  </Field.Root>
                </HStack>

                {/* Email */}
                <Field.Root>
                  <Field.Label>Email</Field.Label>
                  <Input 
                    type="email" 
                    placeholder="tu@email.com" 
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={isLoading}
                  />
                </Field.Root>

                {/* Password */}
                <Field.Root>
                  <Field.Label>Contraseña</Field.Label>
                  <Input 
                    type="password" 
                    placeholder="Mínimo 6 caracteres" 
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    disabled={isLoading}
                  />
                </Field.Root>

                {/* Confirm Password */}
                <Field.Root>
                  <Field.Label>Confirmar Contraseña</Field.Label>
                  <Input 
                    type="password" 
                    placeholder="Repite tu contraseña" 
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    disabled={isLoading}
                  />
                </Field.Root>

                {/* Phone */}
                <Field.Root>
                  <Field.Label>Teléfono (opcional)</Field.Label>
                  <Input 
                    type="tel" 
                    placeholder="+1 (555) 000-0000" 
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={isLoading}
                  />
                </Field.Root>

                <Separator />

                {/* Terms and Conditions */}
                <Checkbox.Root 
                  checked={formData.acceptTerms}
                  onCheckedChange={(details) => handleInputChange("acceptTerms", details.checked)}
                  disabled={isLoading}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>
                    Acepto los{" "}
                    <Link color="blue.500" href="#" textDecoration="underline">
                      términos y condiciones
                    </Link>
                  </Checkbox.Label>
                </Checkbox.Root>

                {/* Newsletter */}
                <Checkbox.Root 
                  checked={formData.newsletter}
                  onCheckedChange={(details) => handleInputChange("newsletter", details.checked)}
                  disabled={isLoading}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>
                    Quiero recibir noticias y actualizaciones por email
                  </Checkbox.Label>
                </Checkbox.Root>

                {/* Submit Button */}
                <Button 
                  type="submit"
                  colorScheme="blue" 
                  size="lg" 
                  w="full"
                  mt={4}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                </Button>

                {/* Login Link */}
                <Text textAlign="center" color="gray.600">
                  ¿Ya tienes cuenta?{" "}
                  <Link color="blue.500" href="/login" fontWeight="medium">
                    Iniciar sesión
                  </Link>
                </Text>
              </VStack>
            </form>
          </Card.Body>
        </Card.Root>

        {/* Alternative Registration */}
        <Card.Root>
          <Card.Body p={6}>
            <VStack gap={4}>
              <Text color="gray.600" textAlign="center">
                O regístrate con
              </Text>
              <HStack gap={4} w="full">
                <Button 
                  variant="outline" 
                  flex={1}
                  onClick={handleGoogleRegister}
                  disabled={isLoading}
                >
                  🔍 Google
                </Button>
                <Button variant="outline" flex={1} disabled>
                  📘 Facebook
                </Button>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Stack>
    </Box>
  );
}
