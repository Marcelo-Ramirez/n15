import { authenticator } from "otplib";

// Configurar opciones para mayor tolerancia de tiempo
authenticator.options = {
  window: 2, // Permite tokens de 2 ventanas antes y después (±60 segundos)
  step: 30,  // Ventana de 30 segundos
};

export function verify2FA(token: string, secret: string) {
  try {
    // Limpiar el token de espacios y guiones
    const cleanToken = token.replace(/\s|-/g, '');
    
    // Verificar que el token tenga 6 dígitos
    if (!/^\d{6}$/.test(cleanToken)) {
      console.log("Invalid token format:", cleanToken);
      return false;
    }
    
    const isValid = authenticator.check(cleanToken, secret);
    console.log("2FA verification result:", isValid, "for token:", cleanToken);
    
    return isValid;
  } catch (error) {
    console.error("Error verifying 2FA token:", error);
    return false;
  }
}
