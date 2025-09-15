import { authenticator } from "otplib";

export function verify2FA(token: string, secret: string) {
  return authenticator.check(token, secret);
}
