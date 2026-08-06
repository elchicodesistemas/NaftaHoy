import { z } from "zod";

export const tokenBodySchema = z.object({
  usuario: z.string().min(1, "usuario es requerido"),
  empresa: z.string().min(1, "empresa es requerida"),
  secret: z.string().min(1, "secret es requerido"),
});
