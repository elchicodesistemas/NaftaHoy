"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, Mail, Send } from "lucide-react";
import { api } from "@/services/api";

const fields = [
  { id: "name", label: "Nombre", autoComplete: "name", placeholder: "Tu nombre", required: true },
  { id: "business", label: "Empresa o negocio", autoComplete: "organization", placeholder: "Nombre de tu negocio", required: true },
  { id: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "nombre@empresa.com", required: true },
  { id: "phone", label: "Teléfono / WhatsApp", type: "tel", autoComplete: "tel", placeholder: "+54 9...", required: true },
  { id: "category", label: "Rubro", placeholder: "Ej. taller, seguros, lubricantes", required: true },
  { id: "location", label: "Localidad / provincia", autoComplete: "address-level2", placeholder: "Ej. Rosario, Santa Fe", required: true },
] as const;

export default function AdvertisingForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSending(true);
    setError("");
    setSubmitted(false);
    const result = await api.submitAdvertisingLead({
      name: String(data.get("name") || ""), business: String(data.get("business") || ""), email: String(data.get("email") || ""),
      phone: String(data.get("phone") || ""), category: String(data.get("category") || ""), location: String(data.get("location") || ""),
      message: String(data.get("message") || ""), website: String(data.get("website") || ""),
    });
    setSending(false);
    if (result.ok) {
      setSubmitted(true);
      event.currentTarget.reset();
    } else setError(result.error || "No pudimos enviar tu consulta.");
  }

  const inputClass = "mt-1.5 w-full rounded-xl border border-surface-200 bg-white px-3.5 py-3 text-sm text-zinc-800 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 dark:border-dark-border dark:bg-dark-bg dark:text-zinc-100";

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card sm:p-7">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">Contacto comercial</p>
        <h2 className="mt-1 text-xl font-extrabold text-zinc-900 dark:text-white">Quiero publicitar mi negocio</h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Contanos lo básico y enviaremos tu consulta directamente al equipo comercial.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.id} className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            {field.label}
            <input {...field} name={field.id} className={inputClass} />
          </label>
        ))}
      </div>

      <label className="mt-4 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
        ¿Qué querés promocionar?
        <textarea name="message" required rows={5} placeholder="Contanos sobre tu propuesta, producto o servicio" className={`${inputClass} resize-y`} />
      </label>

      <label className="sr-only" aria-hidden="true">
        Sitio web
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      <button type="submit" disabled={sending} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3.5 text-sm font-bold text-white transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto">
        {sending ? "Enviando consulta..." : "Enviar consulta"} {sending ? <ArrowRight className="h-4 w-4 animate-pulse" /> : <Send className="h-4 w-4" />}
      </button>

      {submitted && (
        <p role="status" className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ¡Consulta enviada! Te responderemos a la dirección de email que nos compartiste.
        </p>
      )}
      {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}

      <div className="mt-6 border-t border-surface-100 pt-5 dark:border-dark-border">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">¿Preferís escribirnos directamente?</p>
        <a href="mailto:publicidad@naftahoy.com" className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-brand-primary hover:underline">
          <Mail className="h-4 w-4" /> publicidad@naftahoy.com
        </a>
      </div>
    </form>
  );
}
