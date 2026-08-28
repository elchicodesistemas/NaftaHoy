# Fuentes de datos — NaftaHoy

## Fuente activa planificada

### Secretaría de Energía — RES 1104/2004

- **Consulta:** http://res1104.se.gob.ar/consultaprecios.eess.php
- **Archivo:** `precios_eess_2025_en_adelante.zip`, con una base Microsoft Access `.accdb`.
- **Cobertura:** precios y volúmenes declarados por operadores, por período, producto, canal, bandera y establecimiento.
- **Frecuencia:** mensual. NaftaHoy sincroniza el archivo completo el día 5 de cada mes y conserva el historial por período.
- **Alcance importado:** únicamente el canal `Al público`; se excluyen mayoristas y otros canales.

La Resolución 717/2025 derogó la Resolución 314/2016, por lo que la aplicación no presenta los datos como precios en tiempo real ni utiliza la fuente anterior para nuevas sincronizaciones.

## Procesamiento

```
ZIP oficial → extracción del ACCDB → mdb-export por streaming → normalización → PostgreSQL
```

El importador conserva las coordenadas existentes de las estaciones identificadas por `Nro Inscripción`, ya que el archivo RES 1104/2004 no provee latitud ni longitud.

## Fuentes complementarias por investigar

- Shell Developer Portal — API oficial, requiere registro y credenciales.
- Sitios oficiales de YPF, Axion y Puma — evaluar si ofrecen información pública verificable por estación.

No se deben reactivar los datasets de la Resolución 314/2016 como fuente de precios actuales.
