import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;

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
