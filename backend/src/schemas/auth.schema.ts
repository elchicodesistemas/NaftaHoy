import { z } from "zod";

export const tokenBodySchema = z.object({
  usuario: z.string().min(1, "usuario es requerido"),
  secret: z.string().min(1, "secret es requerido"),
});
