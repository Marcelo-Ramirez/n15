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

  useEffect(() => {
    if ((user as any)?.twoFactorEnabled) setTwoFAEnabled(true);
  }, [user]);

  const handleGenerate2FA = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/auth/2fa/generate");
      if (!res.ok) throw new Error("No se pudo generar QR");
      const data = await res.json();
      setQrCode(data.qrDataUrl);
      setMessage(
        "Escanea el QR con Google Authenticator y luego ingresa el código para activarlo."
      );
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
    <div style={{
      maxWidth: "500px",
      margin: "40px auto",
      padding: "20px",
      border: "2px solid #333",
      borderRadius: "10px",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f9f9f9"
    }}>
      <h1 style={{ textAlign: "center", color: "#222" }}>Perfil de Usuario</h1>

      <div style={{ margin: "20px 0", padding: "10px", backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #ccc" }}>
        <p><strong>Nombre:</strong> {user?.name || "Usuario"}</p>
        <p><strong>Email:</strong> {user?.email || "-"}</p>
      </div>

      <h2 style={{ marginTop: "30px", color: "#222" }}>Seguridad: Autenticación 2FA</h2>

      {twoFAEnabled ? (
        <div style={{ padding: "10px", backgroundColor: "#d4edda", color: "#155724", borderRadius: "5px", marginTop: "10px" }}>
          {message || "2FA ya está activado"}
        </div>
      ) : (
        <div style={{ marginTop: "10px" }}>
          <button
            onClick={handleGenerate2FA}
            disabled={loading || !!qrCode}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: loading || qrCode ? "not-allowed" : "pointer",
              marginBottom: "15px"
            }}
          >
            {loading && !qrCode ? "Cargando..." : qrCode ? "QR generado" : "Generar QR / Activar 2FA"}
          </button>

          {qrCode && (
            <div style={{ marginTop: "15px" }}>
              <p>Escanea este QR con Google Authenticator:</p>
              <img src={qrCode} alt="QR Code 2FA" width={200} height={200} style={{ display: "block", marginBottom: "10px" }} />
              <input
                type="text"
                placeholder="Ingresa el código de Google Authenticator"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                style={{ padding: "8px", width: "100%", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
              />
              <button
                onClick={handleVerify2FA}
                disabled={loading}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#28a745",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                {loading ? "Verificando..." : "Verificar Token"}
              </button>
            </div>
          )}

          {message && !twoFAEnabled && (
            <div style={{ padding: "10px", backgroundColor: "#d4edda", color: "#155724", borderRadius: "5px", marginTop: "10px" }}>
              {message}
            </div>
          )}
          {error && (
            <div style={{ padding: "10px", backgroundColor: "#f8d7da", color: "#721c24", borderRadius: "5px", marginTop: "10px" }}>
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
