# Servidor — NaftaHoy

## Datos del VPS

| Campo | Valor |
|-------|-------|
| Proveedor | Dattaweb |
| Host | `vps-5880806-x.dattaweb.com` |
| IP | `179.43.124.36` |
| Sistema Operativo | Ubuntu |
| Usuario | `root` |
| Puerto SSH | `5540` |

## Conexión SSH

```bash
ssh -p 5540 root@179.43.124.36
```

## Dominio

- **Dominio:** NaftaHoy.com
- **Estado:** Registrado (pendiente configurar DNS)

## Configuración pendiente

- [ ] Apuntar DNS del dominio al IP del servidor
- [ ] Actualizar sistema operativo (`apt update && apt upgrade`)
- [ ] Crear usuario no-root para deploy
- [ ] Instalar Docker y Docker Compose
- [ ] Instalar Nginx como reverse proxy
- [ ] Configurar SSL con Let's Encrypt (certbot)
- [ ] Configurar firewall (UFW)
- [ ] Instalar Git en el servidor
- [ ] Configurar deploy key de GitHub
- [ ] Configurar PM2 o similar para process management
- [ ] Configurar backups automáticos de la base de datos

## Puertos a abrir (UFW)

| Puerto | Servicio |
|--------|----------|
| 22 / 5540 | SSH |
| 80 | HTTP |
| 443 | HTTPS |
| 5432 | PostgreSQL (solo local) |
| 6379 | Redis (solo local) |

## Notas de seguridad

> **IMPORTANTE:** Las credenciales del servidor NUNCA deben estar en el código.
> Este archivo documenta datos de conexión para referencia del equipo.
> La contraseña se comparte solo por canal seguro entre los miembros del equipo.
