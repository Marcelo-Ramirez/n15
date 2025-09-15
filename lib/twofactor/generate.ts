import { authenticator } from "otplib";
import qrcode from "qrcode";

export async function generate2FA(userEmail: string) {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(userEmail, "TuApp", secret);
  const qrDataUrl = await qrcode.toDataURL(otpauth);

  return { secret, qrDataUrl };
}
