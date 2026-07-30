CREATE TABLE "estaciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"petrolera_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"direccion" text NOT NULL,
	"localidad" text NOT NULL,
	"provincia" text NOT NULL,
	"latitud" numeric(9, 6) NOT NULL,
	"longitud" numeric(9, 6) NOT NULL,
	"fuente" text NOT NULL,
	"external_id" text NOT NULL,
	"activa" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "estaciones_fuente_external_id_unique" UNIQUE("fuente","external_id")
);
--> statement-breakpoint
CREATE TABLE "ingesta_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fuente" text NOT NULL,
	"estado" text DEFAULT 'en_progreso' NOT NULL,
	"registros_procesados" integer DEFAULT 0 NOT NULL,
	"error_mensaje" text,
	"iniciado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"finalizado_en" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "petroleras" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "petroleras_nombre_unique" UNIQUE("nombre"),
	CONSTRAINT "petroleras_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "precios_actuales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"estacion_id" uuid NOT NULL,
	"tipo_combustible" text NOT NULL,
	"precio" numeric(10, 2) NOT NULL,
	"moneda" text DEFAULT 'ARS' NOT NULL,
	"fecha_vigencia" timestamp with time zone NOT NULL,
	"fecha_capturado" timestamp with time zone DEFAULT now() NOT NULL,
	"fuente" text NOT NULL,
	CONSTRAINT "precios_actuales_estacion_combustible_unique" UNIQUE("estacion_id","tipo_combustible")
);
--> statement-breakpoint
CREATE TABLE "precios_historico" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"estacion_id" uuid NOT NULL,
	"tipo_combustible" text NOT NULL,
	"precio" numeric(10, 2) NOT NULL,
	"moneda" text DEFAULT 'ARS' NOT NULL,
	"fecha_vigencia" timestamp with time zone NOT NULL,
	"fuente" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "precios_historico_estacion_combustible_vigencia_unique" UNIQUE("estacion_id","tipo_combustible","fecha_vigencia")
);
--> statement-breakpoint
CREATE TABLE "reporte_likes" (
	"reporte_id" uuid NOT NULL,
	"usuario_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reporte_likes_reporte_id_usuario_id_pk" PRIMARY KEY("reporte_id","usuario_id")
);
--> statement-breakpoint
CREATE TABLE "reportes_precio" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid,
	"petrolera_id" uuid NOT NULL,
	"estacion_id" uuid,
	"tipo_combustible" text NOT NULL,
	"region" text NOT NULL,
	"precio_reportado" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"verificado" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "estaciones" ADD CONSTRAINT "estaciones_petrolera_id_petroleras_id_fk" FOREIGN KEY ("petrolera_id") REFERENCES "public"."petroleras"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "precios_actuales" ADD CONSTRAINT "precios_actuales_estacion_id_estaciones_id_fk" FOREIGN KEY ("estacion_id") REFERENCES "public"."estaciones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "precios_historico" ADD CONSTRAINT "precios_historico_estacion_id_estaciones_id_fk" FOREIGN KEY ("estacion_id") REFERENCES "public"."estaciones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reporte_likes" ADD CONSTRAINT "reporte_likes_reporte_id_reportes_precio_id_fk" FOREIGN KEY ("reporte_id") REFERENCES "public"."reportes_precio"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reporte_likes" ADD CONSTRAINT "reporte_likes_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reportes_precio" ADD CONSTRAINT "reportes_precio_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reportes_precio" ADD CONSTRAINT "reportes_precio_petrolera_id_petroleras_id_fk" FOREIGN KEY ("petrolera_id") REFERENCES "public"."petroleras"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reportes_precio" ADD CONSTRAINT "reportes_precio_estacion_id_estaciones_id_fk" FOREIGN KEY ("estacion_id") REFERENCES "public"."estaciones"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "estaciones_provincia_localidad_idx" ON "estaciones" USING btree ("provincia","localidad");--> statement-breakpoint
CREATE INDEX "estaciones_petrolera_idx" ON "estaciones" USING btree ("petrolera_id");--> statement-breakpoint
CREATE INDEX "precios_historico_tendencia_idx" ON "precios_historico" USING btree ("tipo_combustible","fecha_vigencia");