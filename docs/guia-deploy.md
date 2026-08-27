# Guía de Deploy — NaftaHoy

Guía paso a paso para poner NaftaHoy.com online. Pensada para que la sigan juntos vos y tu compañero de infraestructura.

---

## Datos del servidor

| Campo | Valor |
|-------|-------|
| Proveedor | Dattaweb |
| Host | `vps-5880806-x.dattaweb.com` |
| IP | `179.43.124.36` |
| Usuario | `root` |
| Puerto SSH | `5540` |
| Contraseña | **NO la guardes en el repo**. Compartila solo por canal seguro. |

---

## Paso 1 — Conectarse al servidor

Desde tu terminal (PowerShell, CMD, Git Bash, o la terminal del IDE):

```bash
ssh -p 5540 root@179.43.124.36
```

Te va a pedir la contraseña. La pegás y listo (no se ve mientras la escribís, es normal).

Si nunca te conectaste, te va a preguntar si confiás en el servidor. Escribí `yes` y enter.

### Si no funciona SSH desde Windows

Instalá **PuTTY** (gratis) o usá **Windows Terminal**:
- Host: `179.43.124.36`
- Port: `5540`
- Usuario: `root`

---

## Paso 2 — Preparar el servidor (primera vez)

Una vez conectado al servidor, ejecutá estos comandos uno por uno:

### 2.1 — Actualizar el sistema

```bash
apt update && apt upgrade -y
```

### 2.2 — Instalar herramientas básicas

```bash
apt install -y curl wget git unzip ufw software-properties-common
```

### 2.3 — Instalar Node.js 20 (LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

Verificar:

```bash
node -v    # Debería mostrar v20.x.x
npm -v     # Debería mostrar 10.x.x
```

### 2.4 — Instalar PM2 (mantiene la app corriendo)

```bash
npm install -g pm2
```

### 2.5 — Instalar Nginx (recibe el tráfico web)

```bash
apt install -y nginx
systemctl enable nginx
systemctl start nginx
```

### 2.6 — Configurar el firewall

```bash
ufw allow 5540/tcp    # SSH (tu puerto custom)
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw enable
```

Te va a preguntar si estás seguro, escribí `y`. **Importante: asegurate de que el puerto 5540 esté permitido ANTES de activar el firewall**, sino te quedás afuera del servidor.

---

## Paso 3 — Configurar el dominio (DNS)

El dominio `naftahoy.com` está registrado en **Donweb**. Esto lo tiene que hacer quien tenga acceso al panel de Donweb.

### ¿Qué hay que hacer?

Entrar al panel DNS del dominio y crear/modificar estos registros:

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| **A** | `@` | `179.43.124.36` | 3600 |
| **A** | `www` | `179.43.124.36` | 3600 |

Eso es todo. El registro **A** le dice a internet "cuando alguien escriba naftahoy.com, mandalo a esta IP".

### Paso a paso en Donweb

1. Entrar a [donweb.com](https://donweb.com) e iniciar sesión
2. Ir a **Mi Cuenta** → **Mis Dominios** (o "Dominios" en el menú lateral)
3. Buscar `naftahoy.com` y hacer click en **Administrar** o **Gestionar**
4. Ir a la sección **Zona DNS** (o "DNS Zone", "Configuración DNS")
5. Buscar si ya hay un registro tipo **A** con nombre `@`:
   - Si existe → editarlo y poner `179.43.124.36`
   - Si no existe → crear uno nuevo
6. Repetir para el registro **A** con nombre `www`
7. Guardar cambios

Si Donweb tiene nameservers propios apuntando a otro lado (por ejemplo a un hosting de Donweb), asegurate de que la zona DNS la maneje Donweb directamente y no esté delegada a otro servicio.

### Panel DNS en otros registradores (referencia)

- **GoDaddy**: My Products → DNS → Manage DNS
- **Namecheap**: Domain List → Manage → Advanced DNS
- **Hostinger**: Dominios → DNS Zone
- **NIC Argentina** (.com.ar): nic.ar → Mis Dominios → Delegaciones

### ¿Cuánto tarda?

Los cambios de DNS tardan entre 5 minutos y 48 horas en propagarse. Normalmente se ven en 15-30 minutos.

### ¿Cómo verifico que funciona?

Desde tu computadora:

```bash
ping naftahoy.com
```

Si responde con la IP `179.43.124.36`, el DNS está funcionando.

También podés verificar en: https://dnschecker.org/#A/naftahoy.com

---

## Paso 4 — Subir el proyecto al servidor

### 4.1 — Clonar el repo en el servidor

Conectate por SSH y ejecutá:

```bash
cd /var/www
git clone https://github.com/elchicodesistemas/NaftaHoy.git naftahoy
cd naftahoy/frontend
```

### 4.2 — Instalar dependencias y compilar

```bash
npm install
npm run build
```

### 4.3 — Iniciar con PM2

```bash
pm2 start npm --name "naftahoy" -- start
pm2 save
pm2 startup
```

Esto hace que la app arranque automáticamente si el servidor se reinicia.

### Verificar que funciona

```bash
pm2 status
```

Debería mostrar "naftahoy" con status "online". La app corre internamente en el puerto 3000.

---

## Paso 5 — Configurar Nginx (conectar dominio con la app)

### 5.1 — Crear la configuración de Nginx

```bash
nano /etc/nginx/sites-available/naftahoy
```

Pegá esto:

```nginx
server {
    listen 80;
    server_name naftahoy.com www.naftahoy.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Guardar: `Ctrl+O` → Enter → `Ctrl+X`

### 5.2 — Activar el sitio

```bash
ln -s /etc/nginx/sites-available/naftahoy /etc/nginx/sites-enabled/
nginx -t          # Verificar que no hay errores
systemctl reload nginx
```

Ahora si entrás a `http://naftahoy.com` (una vez que el DNS esté configurado) deberías ver la web.

---

## Paso 6 — HTTPS con Let's Encrypt (SSL gratuito)

### 6.1 — Instalar Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### 6.2 — Generar el certificado

```bash
certbot --nginx -d naftahoy.com -d www.naftahoy.com
```

Te va a pedir:
1. Tu email (para avisos de renovación)
2. Aceptar términos → `Y`
3. Redireccionar HTTP a HTTPS → elegí `2` (redirect)

### 6.3 — Verificar renovación automática

```bash
certbot renew --dry-run
```

Los certificados se renuevan automáticamente cada 90 días.

---

## Paso 7 — Actualizaciones futuras

Cada vez que quieran subir cambios:

```bash
cd /var/www/naftahoy
git pull origin main
cd frontend
npm install
npm run build
pm2 restart naftahoy
```

### Script de deploy rápido (opcional)

Crear archivo `/var/www/naftahoy/deploy.sh`:

```bash
#!/bin/bash
echo "Actualizando NaftaHoy..."
cd /var/www/naftahoy
git pull origin main
cd frontend
npm install
npm run build
pm2 restart naftahoy
echo "Deploy completado."
```

Darle permisos y usarlo:

```bash
chmod +x /var/www/naftahoy/deploy.sh
./deploy.sh
```

---

## Resumen visual del flujo

```
Usuario escribe naftahoy.com
        │
        ▼
   DNS resuelve a 179.43.124.36
        │
        ▼
   Nginx (puerto 80/443 con SSL)
        │
        ▼
   proxy_pass a localhost:3000
        │
        ▼
   Next.js (PM2) sirve la web
```

---

## Checklist de deploy

- [ ] Conectarse al servidor por SSH
- [ ] Actualizar el sistema (apt update/upgrade)
- [ ] Instalar Node.js 20, PM2, Nginx
- [ ] Configurar firewall (UFW)
- [ ] Configurar DNS del dominio → IP del servidor
- [ ] Clonar repo, npm install, npm build
- [ ] Iniciar la app con PM2
- [ ] Configurar Nginx como reverse proxy
- [ ] Instalar certificado SSL con Certbot
- [ ] Verificar que https://naftahoy.com funciona
- [ ] Configurar deploy.sh para actualizaciones rápidas

---

## Preguntas frecuentes

**¿Qué pasa si me quedo afuera del servidor?**
Contactá a Dattaweb, tu proveedor de VPS. Pueden resetear el acceso desde su panel.

**¿Puedo conectarme desde el celular?**
Sí, con la app "Termius" (gratis) o "JuiceSSH" para Android.

**¿Cómo veo los logs de la app?**
```bash
pm2 logs naftahoy
```

**¿Cómo veo los logs de Nginx?**
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```
