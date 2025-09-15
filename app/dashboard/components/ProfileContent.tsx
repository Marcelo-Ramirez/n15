"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileContent() {
  const { user } = useAuth();
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Verificar si el usuario ya tiene 2FA activado
  useEffect(() => {
    if ((user as any)?.twoFactorEnabled) setTwoFAEnabled(true);
  }, [user]);

  const handleGenerate2FA = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/2fa/generate");
      if (!res.ok) throw new Error("No se pudo generar QR");
      const data = await res.json();
      setQrCode(data.qrDataUrl);
      setMessage("Escanea el QR con Google Authenticator y luego ingresa el código para activarlo.");
    } catch (err: any) {
      setError(err.message || "Error al generar QR");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, token }),
      });
      if (!res.ok) throw new Error("Token inválido");
      setTwoFAEnabled(true);
      setMessage("2FA activado correctamente");
      setQrCode("");
      setToken("");
    } catch (err: any) {
      setError(err.message || "Error al verificar token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Perfil</h1>
      <p>Usuario: {user?.name || "Usuario"}</p>
      <p>Email: {user?.email}</p>

      <h2>Seguridad: Autenticación de 2 factores</h2>
      {twoFAEnabled ? (
        <p>2FA ya está activado</p>
      ) : (
        <div>
          <button onClick={handleGenerate2FA} disabled={loading}>
            {loading ? "Cargando..." : "Generar QR / Activar 2FA"}
          </button>

          {qrCode && (
            <div>
              <p>Escanea este QR con Google Authenticator:</p>
              <img src={qrCode} alt="QR Code 2FA" width={200} />
              <input
                type="text"
                placeholder="Ingresa el código de Google Authenticator"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <button onClick={handleVerify2FA} disabled={loading}>
                Verificar Token
              </button>
            </div>
          )}

          {message && <p style={{ color: "green" }}>{message}</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      )}
    </div>
  );
}
