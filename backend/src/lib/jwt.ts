import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error("Falta JWT_SECRET en backend/.env");
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "1h";

export interface IntegradorTokenPayload {
  sub: string;
  empresa: string;
}

export function signIntegradorToken(payload: IntegradorTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyIntegradorToken(token: string): IntegradorTokenPayload {
  return jwt.verify(token, JWT_SECRET) as IntegradorTokenPayload;
}
