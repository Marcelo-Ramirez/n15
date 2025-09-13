"use client";
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  Stack,
  Card,
  Input,
  Link,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface RegisterFormData {
  username: string;
  name: string;
  password: string;
  confirmPassword: string;
  registerKey: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    name: "",
    password: "",
    confirmPassword: "",
    registerKey: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError("");
  };

  const validateForm = () => {
    setError("");
    
    if (!formData.username.trim()) {
      setError("Username is required");
      return false;
    }
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.password.trim()) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return false;
    }
    if (!formData.registerKey.trim()) {
      setError("Registration key is required");
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
      // Register the user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          name: formData.name,
          password: formData.password,
          registerKey: formData.registerKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess("Registration successful! Redirecting to login...");
      
      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (error: any) {
      setError(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      minH="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      bg="gray.50"
      p={4}
    >
      <Card.Root maxW="md" w="full" p={6}>
        <VStack gap={6} align="stretch">
          <Box textAlign="center">
            <Heading size="lg" mb={2}>Create Account</Heading>
            <Text color="gray.600">Join our inventory management system</Text>
          </Box>

          {error && (
            <Box p={3} bg="red.50" border="1px" borderColor="red.200" borderRadius="md">
              <Text color="red.600" fontSize="sm">{error}</Text>
            </Box>
          )}

          {success && (
            <Box p={3} bg="green.50" border="1px" borderColor="green.200" borderRadius="md">
              <Text color="green.600" fontSize="sm">{success}</Text>
            </Box>
          )}

          <form onSubmit={handleSubmit}>
            <Stack gap={4}>
              <Box>
                <Text mb={2} fontSize="sm" fontWeight="medium">Username</Text>
                <Input
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  disabled={isLoading}
                />
              </Box>

              <Box>
                <Text mb={2} fontSize="sm" fontWeight="medium">Full Name</Text>
                <Input
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={isLoading}
                />
              </Box>

              <Box>
                <Text mb={2} fontSize="sm" fontWeight="medium">Password</Text>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  disabled={isLoading}
                />
              </Box>

              <Box>
                <Text mb={2} fontSize="sm" fontWeight="medium">Confirm Password</Text>
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  disabled={isLoading}
                />
              </Box>

              <Box>
                <Text mb={2} fontSize="sm" fontWeight="medium">Registration Key</Text>
                <Input
                  type="password"
                  placeholder="Enter registration key"
                  value={formData.registerKey}
                  onChange={(e) => handleInputChange("registerKey", e.target.value)}
                  disabled={isLoading}
                />
              </Box>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                loading={isLoading}
                loadingText="Creating account..."
                disabled={isLoading || success !== ""}
              >
                Create Account
              </Button>
            </Stack>
          </form>

          <Box textAlign="center">
            <Text fontSize="sm" color="gray.600">
              Already have an account?{" "}
              <Link href="/login" color="blue.500" fontWeight="medium">
                Sign in here
              </Link>
            </Text>
          </Box>
        </VStack>
      </Card.Root>
    </Box>
  );
}
