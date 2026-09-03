import { config } from "../config";

// Nodemailer no publica definiciones TypeScript en esta versión; lo cargamos
// como módulo CommonJS y limitamos su uso a este servicio.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodemailer: { createTransport: (options: unknown) => { sendMail: (message: unknown) => Promise<unknown> } } = require("nodemailer");

export type AdvertisingLead = {
  name: string;
  business: string;
  email: string;
  phone: string;
  category: string;
  location: string;
  message: string;
};

function configured() {
  return Boolean(config.smtpHost && config.smtpUser && config.smtpPassword && config.smtpFrom);
}

export async function sendAdvertisingLead(lead: AdvertisingLead) {
  if (!configured()) throw new Error("EMAIL_NOT_CONFIGURED");
  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: { user: config.smtpUser, pass: config.smtpPassword },
  });
  const text = [
    "Nueva consulta de publicidad desde NaftaHoy",
    "",
    `Nombre: ${lead.name}`,
    `Empresa o negocio: ${lead.business}`,
    `Email: ${lead.email}`,
    `Teléfono / WhatsApp: ${lead.phone}`,
    `Rubro: ${lead.category}`,
    `Localidad / provincia: ${lead.location}`,
    "",
    "Qué quiere promocionar:",
    lead.message,
  ].join("\n");

  await transporter.sendMail({
    from: config.smtpFrom,
    to: config.advertisingRecipient,
    replyTo: lead.email,
    subject: `Nueva consulta publicitaria — ${lead.business}`,
    text,
  });
}
