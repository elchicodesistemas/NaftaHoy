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
| Contraseña | **Nunca guardar en el repo.** Compartir por canal seguro. |

## Conexión SSH

```bash
ssh -p 5540 root@179.43.124.36
```

## Dominio

- **Dominio:** naftahoy.com
- **Estado:** Registrado (pendiente configurar DNS apuntando a la IP del servidor)
- **Registrador:** Donweb (donweb.com)

## Guía completa de deploy

Ver [`guia-deploy.md`](guia-deploy.md) para el paso a paso completo.

## Notas de seguridad

> **IMPORTANTE:**
> - Las credenciales del servidor NUNCA deben estar en el código ni en el repo.
> - Las capturas con datos de acceso NO se commitean (están en el .gitignore).
> - La contraseña se comparte solo por canal seguro (mensaje privado, no grupo).
> - Crear un usuario no-root para deploy es recomendable una vez que esté todo funcionando.
