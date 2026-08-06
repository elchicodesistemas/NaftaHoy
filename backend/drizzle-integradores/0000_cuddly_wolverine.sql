CREATE TABLE "integradores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario" text NOT NULL,
	"empresa" text NOT NULL,
	"secret_hash" text NOT NULL,
	"habilitado" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "integradores_usuario_unique" UNIQUE("usuario")
);
