# 📧 Configuración de Gmail SMTP para Desarrollo

Esta guía te ayudará a configurar Gmail SMTP para enviar emails reales de recuperación de contraseña en desarrollo.

## 🎯 ¿Por qué Gmail SMTP?

Durante el desarrollo, es útil probar el flujo completo de emails sin necesidad de configurar AWS SES. Gmail SMTP es:

- ✅ **Gratis** para desarrollo (hasta 500 emails/día)
- ✅ **Fácil de configurar** (5 minutos)
- ✅ **Confiable** y bien documentado
- ✅ **No requiere** tarjeta de crédito ni cuenta de AWS

## 📋 Requisitos Previos

- Una cuenta de Gmail activa
- Verificación en 2 pasos activada en tu cuenta

## 🔐 Paso 1: Generar Contraseña de Aplicación

### ⚠️ IMPORTANTE
**NO uses tu contraseña normal de Gmail**. Las contraseñas de aplicación son más seguras y específicas para cada aplicación.

### Instrucciones:

1. **Ir a Seguridad de Google**
   - Visita: https://myaccount.google.com/security
   - O busca "Google Account Security" en Google

2. **Activar Verificación en 2 Pasos** (si no está activada)
   - Busca la sección "Verificación en 2 pasos"
   - Haz clic en "Empezar"
   - Sigue los pasos (necesitarás tu teléfono)

3. **Generar Contraseña de Aplicación**
   - Una vez activada la verificación en 2 pasos
   - Busca "Contraseñas de aplicaciones" (App passwords)
   - Puede que necesites volver a iniciar sesión
   
4. **Crear Nueva Contraseña**
   - En "Seleccionar app": Elige "Correo" (Mail)
   - En "Seleccionar dispositivo": Elige "Otro" y escribe "Registro Participantes"
   - Haz clic en "Generar"

5. **Copiar la Contraseña**
   - Verás una contraseña de 16 caracteres como: `abcd efgh ijkl mnop`
   - **Cópiala inmediatamente** (solo se muestra una vez)

## ⚙️ Paso 2: Configurar Variables de Entorno

### Opción A: Configuración Local (Recomendado para desarrollo)

1. **Crea un archivo `.env` en `/backend`** (si no existe):
   ```bash
   cd backend
   copy .env.example .env  # En Windows
   # o
   cp .env.example .env    # En Mac/Linux
   ```

2. **Edita el archivo `.env`** y agrega tus credenciales:
   ```bash
   # Email y recuperación de contraseña
   ENVIRONMENT=development
   FRONTEND_URL=http://localhost:3000
   EMAIL_FROM=tu-email@gmail.com
   
   # Gmail SMTP
   GMAIL_USER=tu-email@gmail.com
   GMAIL_APP_PASSWORD=abcd-efgh-ijkl-mnop
   ```

   ⚠️ **Reemplaza:**
   - `tu-email@gmail.com` con tu email real de Gmail
   - `abcd-efgh-ijkl-mnop` con la contraseña de aplicación generada (sin espacios)

3. **Guarda el archivo**

### Opción B: Configuración en Docker Compose

Si prefieres configurarlo directamente en Docker:

Edita `docker-compose.dev.yml` en la sección del servicio `backend`:

```yaml
backend:
  environment:
    - GMAIL_USER=tu-email@gmail.com
    - GMAIL_APP_PASSWORD=abcd-efgh-ijkl-mnop
    - EMAIL_FROM=tu-email@gmail.com
    - FRONTEND_URL=http://localhost:3000
    - ENVIRONMENT=development
```

## 🧪 Paso 3: Probar la Configuración

1. **Reinicia el backend** (si está corriendo):
   ```powershell
   docker-compose -f docker-compose.dev.yml restart backend
   ```

2. **Prueba el endpoint** desde la terminal:
   ```powershell
   $body = @{email='tu-email@gmail.com'} | ConvertTo-Json
   Invoke-RestMethod -Uri 'http://localhost:8000/api/v1/auth/password-reset/request' `
     -Method Post -Body $body -ContentType 'application/json'
   ```

3. **Verifica tu bandeja de entrada**
   - Deberías recibir un email profesional con el link de recuperación
   - Revisa spam/promociones si no lo ves en tu bandeja principal

4. **Prueba desde el frontend**:
   - Ve a http://localhost:3000/login
   - Haz clic en "¿Olvidaste tu contraseña?"
   - Ingresa tu email
   - Haz clic en "Enviar Instrucciones"
   - ¡Verifica tu email!

## ✅ Verificación Exitosa

Si todo funciona correctamente, verás:

**En los logs del backend:**
```
📧 Email de recuperación enviado exitosamente via Gmail SMTP
```

**En tu email:**
- ✉️ Asunto: "Recuperación de Contraseña - Registro de Participantes"
- 🎨 Email HTML profesional con gradiente morado/azul
- 🔘 Botón grande "Restablecer Contraseña"
- ⚠️ Advertencia de expiración en 1 hora

## ❌ Troubleshooting

### Error: "Username and Password not accepted"

**Causa:** Contraseña incorrecta o verificación en 2 pasos no activada

**Solución:**
1. Verifica que activaste la verificación en 2 pasos
2. Genera una nueva contraseña de aplicación
3. Asegúrate de copiar la contraseña SIN espacios

### Error: "SMTPAuthenticationError"

**Causa:** Credenciales incorrectas en `.env`

**Solución:**
1. Verifica que `GMAIL_USER` tenga tu email completo (@gmail.com)
2. Verifica que `GMAIL_APP_PASSWORD` no tenga espacios ni guiones
3. Genera una nueva contraseña de aplicación si persiste

### Error: "Connection refused" o timeout

**Causa:** Firewall o puerto bloqueado

**Solución:**
1. Verifica que el puerto 587 no esté bloqueado
2. Intenta con `SMTP_PORT=465` y SSL en lugar de TLS
3. Verifica tu conexión a internet

### No recibo el email

**Soluciones:**
1. **Revisa spam/promociones** - Gmail puede clasificarlo así la primera vez
2. **Espera 1-2 minutos** - A veces hay retraso
3. **Verifica logs del backend** - Busca errores
4. **Marca como "No es spam"** para futuros emails

## 🔒 Seguridad

### ⚠️ Mejores Prácticas:

1. **NUNCA** compartas tu contraseña de aplicación
2. **NUNCA** hagas commit del archivo `.env` a Git
3. El archivo `.env` está en `.gitignore` (ya configurado)
4. Revoca contraseñas de aplicación que ya no uses
5. Usa diferentes contraseñas de aplicación para cada proyecto

### Revocar Contraseña de Aplicación:

Si necesitas revocar una contraseña:
1. Ve a https://myaccount.google.com/security
2. Busca "Contraseñas de aplicaciones"
3. Haz clic en el ícono de basura junto a la contraseña
4. Genera una nueva si es necesario

## 📊 Límites de Gmail SMTP

**Límite diario:** 500 emails/día
**Límite por minuto:** ~10-20 emails
**Tamaño máximo:** 25 MB por email

Para desarrollo local, estos límites son más que suficientes.

## 🚀 En Producción

**⚠️ NO uses Gmail SMTP en producción**

Para producción, usa:
- **AWS SES** (Amazon Simple Email Service)
- **SendGrid**
- **Mailgun**
- **Postmark**

Estos servicios están optimizados para producción y tienen mejor deliverability.

## 💡 Tips Adicionales

### Personalizar el remitente

Puedes cambiar el nombre que aparece como remitente:

```bash
EMAIL_FROM="Registro Participantes <tu-email@gmail.com>"
```

### Modo simulado (sin enviar emails)

Si quieres volver al modo simulado (solo logs):

```bash
# Deja estas variables vacías o coméntalas
GMAIL_USER=
GMAIL_APP_PASSWORD=
```

El sistema automáticamente volverá al modo simulado.

## 📚 Referencias

- [Google App Passwords](https://support.google.com/accounts/answer/185833)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Python smtplib Documentation](https://docs.python.org/3/library/smtplib.html)

---

**¿Problemas?** Abre un issue en el repositorio o consulta la documentación de Gmail.
