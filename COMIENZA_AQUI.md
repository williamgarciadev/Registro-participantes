# 🚀 COMIENZA AQUÍ - Guía de Inicio Rápido

Bienvenido al proyecto **Registro de Participantes**. Esta es tu puerta de entrada a todo lo que necesitas saber.

---

## ⏱️ Tiempo Total: ~2 horas

```
Preparación Local: 10 min
↓
Desplegar en AWS: 1.5 horas
↓
Testing y Validación: 10 min
= Total: ~1.5-2 horas
```

---

## 📍 Guía Visual de Documentos

```
┌─────────────────────────────────────────────────┐
│        ¿QUÉ QUIERES HACER AHORA?               │
└─────────────────────────────────────────────────┘
          │
          ├─ "Quiero desplegar en AWS"
          │  ↓
          │  👉 Lee: AWS_SETUP_STEP_BY_STEP.md
          │         (10 pasos detallados)
          │
          ├─ "Quiero comandos rápidos"
          │  ↓
          │  👉 Usa: AWS_QUICK_COMMANDS.md
          │         (copy-paste commands)
          │
          ├─ "Quiero ver checklist"
          │  ↓
          │  👉 Abre: AWS_DEPLOYMENT_CHECKLIST.md
          │          (seguir progreso)
          │
          ├─ "Quiero entender arquitectura"
          │  ↓
          │  👉 Lee: AWS_DEPLOYMENT_OVERVIEW.md
          │         (diagramas y componentes)
          │
          ├─ "Quiero desarrollar localmente"
          │  ↓
          │  👉 Lee: docs/DEVELOPMENT.md
          │
          └─ "Necesito documentación de API"
             ↓
             👉 Lee: docs/API.md
```

---

## 🎯 Opción A: Despliegue Automatizado (⭐ Recomendado)

**Tiempo: 45 minutos aprox**

### Paso 1: Verificar Requisitos (5 min)

```bash
# Verifica que tengas todo instalado
python --version     # Debe ser 3.11+
node --version       # Debe ser 18+
npm --version
git --version
docker --version

# Resultado esperado: todas las versiones se muestran sin errores
```

### Paso 2: Configurar AWS (10 min)

**Primero, crea tu cuenta AWS:**

1. Ve a https://aws.amazon.com
2. Crea una cuenta (si no tienes)
3. Verifica email y teléfono

**Luego, crea usuario IAM:**

1. AWS Console → IAM → Users → Create user
2. Nombre: `registro-participantes-dev`
3. Habilita "Provide user access to AWS Management Console"
4. Selecciona "Attach policies directly"
5. Busca y selecciona: `AdministratorAccess`
6. Click "Create user"

**Obtén Access Keys:**

1. IAM → Users → `registro-participantes-dev`
2. Security credentials → Create access key
3. Selecciona "Command Line Interface (CLI)"
4. **Copia y guarda en lugar seguro:**
   - Access Key ID
   - Secret Access Key

### Paso 3: Instalar Herramientas (10 min)

```bash
# AWS CLI
# Windows: Descargar desde https://awscli.amazonaws.com/AWSCLIV2.msi
# macOS: brew install awscli
# Linux: pip install awscli

# AWS SAM CLI
# Windows: Descargar desde https://github.com/aws/aws-sam-cli/releases
# macOS: brew install aws-sam-cli
# Linux: pip install aws-sam-cli

# Verificar
aws --version
sam --version
```

### Paso 4: Configurar AWS CLI (5 min)

```bash
aws configure

# Ingresar:
AWS Access Key ID: [tu-access-key-id]
AWS Secret Access Key: [tu-secret-access-key]
Default region: us-east-1
Default output format: json

# Verificar
aws sts get-caller-identity
```

### Paso 5: Ejecutar Script de Despliegue (30 min)

```bash
# Navegar al proyecto
cd Registro-participantes

# Ejecutar script (elige según tu SO)

# macOS/Linux
bash scripts/setup-aws.sh

# Windows PowerShell
.\scripts\setup-aws.ps1
```

El script hará automáticamente:
- ✅ Verificar requisitos
- ✅ Construir backend (`sam build`)
- ✅ Desplegar en AWS (`sam deploy`)
- ✅ Construir frontend (`npm run build`)
- ✅ Subir a S3
- ✅ Invalidar CloudFront

**Espera a que termine (10-15 minutos)**

### Paso 6: Ver Resultados

Al terminar, verás:

```
========================================
URLs del Despliegue
========================================
API Backend: https://xxxxx.execute-api.us-east-1.amazonaws.com/dev
Frontend: https://d123456.cloudfront.net
Bucket S3: registro-participantes-xxxxx
```

✅ **¡Tu aplicación está desplegada en AWS!**

---

## 🎯 Opción B: Despliegue Manual (Para Aprender)

**Tiempo: 1.5-2 horas aprox**

Si prefieres aprender paso a paso en detalle:

**👉 Lee: [AWS_SETUP_STEP_BY_STEP.md](./docs/AWS_SETUP_STEP_BY_STEP.md)**

Contiene:
- Paso 1: Configurar AWS
- Paso 2: Preparar entorno
- Paso 3: Desplegar backend
- Paso 4: Configurar Aurora
- Paso 5: Crear migraciones
- Paso 6: Desplegar frontend
- Paso 7: Verificar todo
- Paso 8: Monitoreo

Sigue cada paso en orden y aprenderás cómo funciona todo.

---

## 🧪 Testing Después de Despliegue

Una vez desplegado, prueba que todo funciona:

### 1. Health Check (API)

```bash
# Obtener URL de API (verás en output del script)
API_URL="https://xxxxx.execute-api.us-east-1.amazonaws.com/dev"

# Probar
curl $API_URL/health

# Deberías ver: {"status":"healthy"}
```

### 2. Crear Participante

```bash
curl -X POST $API_URL/api/v1/participantes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "apellido": "User",
    "email": "test@example.com",
    "telefono": "+1234567890"
  }'

# Deberías ver el participante creado con un ID
```

### 3. Acceder a Frontend

1. Abre URL del CloudFront en navegador
2. Deberías ver página de inicio
3. Haz clic en "Nuevo Participante"
4. Crea un participante
5. Verifica que aparece en la lista

✅ **¡Todo funciona!**

---

## 📊 Crear Tablas en Base de Datos

Después de desplegar, necesitas crear las tablas en Aurora:

### Opción 1: RDS Query Editor (Más fácil)

1. AWS Console → RDS → Databases
2. Click en cluster `registro-participantes`
3. Tab "Query editor"
4. Click "New query"
5. Abre: [scripts/init-database.sql](./scripts/init-database.sql)
6. Copia todo el contenido y pégalo en el editor
7. Click "Run"

### Opción 2: Desde CLI

```bash
# (Más avanzado, requiere acceso a la DB)
# Ver: AWS_QUICK_COMMANDS.md → Base de Datos
```

---

## 🔍 Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| "AWS CLI no configurado" | Ejecuta `aws configure` |
| "SAM CLI no encontrado" | Instálalo: `pip install aws-sam-cli` |
| "Stack creation failed" | Ver logs: `aws cloudformation describe-stack-events --stack-name registro-participantes-dev` |
| "Lambda timeout" | Aumentar timeout en `template.yaml` |
| "API no responde" | Ver logs: `sam logs -n FastAPIFunction --tail` |
| "Frontend no carga" | Esperar 5-10 min para CloudFront propagation |

Para más troubleshooting:
👉 [AWS_QUICK_COMMANDS.md](./AWS_QUICK_COMMANDS.md) → Troubleshooting

---

## 📚 Documentación por Tema

### 🏗️ Arquitectura y Despliegue
- **[AWS_DEPLOYMENT_OVERVIEW.md](./AWS_DEPLOYMENT_OVERVIEW.md)** - Componentes, flujos, diagrama

### 📖 Despliegue Detallado
- **[docs/AWS_SETUP_STEP_BY_STEP.md](./docs/AWS_SETUP_STEP_BY_STEP.md)** - 10 pasos completos

### ✅ Checklist
- **[AWS_DEPLOYMENT_CHECKLIST.md](./AWS_DEPLOYMENT_CHECKLIST.md)** - Seguimiento paso a paso

### ⚡ Comandos Rápidos
- **[AWS_QUICK_COMMANDS.md](./AWS_QUICK_COMMANDS.md)** - Copy-paste ready

### 💻 Desarrollo Local
- **[docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)** - Setup local

### 🔌 API
- **[docs/API.md](./docs/API.md)** - Endpoints documentation

### 🚀 Despliegues Futuros
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Updates y redeploys

---

## 🤔 Preguntas Frecuentes

### ¿Cuánto cuesta?

**Desarrollo:** $40-70/mes
**Producción:** $100-150/mes

Incluye Lambda, Aurora, API Gateway, S3, CloudFront.

### ¿Qué si algo sale mal?

1. Leer los logs: `sam logs -n FastAPIFunction --tail`
2. Ver eventos del stack: `aws cloudformation describe-stack-events --stack-name registro-participantes-dev`
3. Revisar troubleshooting en [AWS_QUICK_COMMANDS.md](./AWS_QUICK_COMMANDS.md)

### ¿Puedo usar dominio propio?

Sí, con Route 53 de AWS. Documentación en docs/DEPLOYMENT.md

### ¿Cómo añado autenticación?

Futura mejora con AWS Cognito. Ver docs/DEPLOYMENT.md

### ¿Cómo automatizo el despliegue?

Con GitHub Actions. Template en docs/DEPLOYMENT.md

---

## 🎓 Aprender Más

Recursos para profundizar:

- **AWS Docs:** https://docs.aws.amazon.com/
- **AWS SAM:** https://aws.amazon.com/serverless/sam/
- **FastAPI:** https://fastapi.tiangolo.com/
- **React + TypeScript:** https://react.dev/
- **Aurora:** https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/

---

## 🚨 IMPORTANTE - Antes de Empezar

- [ ] Tengo credenciales AWS guardadas en lugar seguro
- [ ] Entiendo que AWS cobrará por servicios (mínimo ~$50/mes)
- [ ] Tengo Python 3.11+ instalado
- [ ] Tengo Node.js 18+ instalado
- [ ] Tengo Docker instalado (para SAM)

---

## 🎉 ¡Listo para Empezar!

### Si quieres despliegue rápido:
```bash
bash scripts/setup-aws.sh  # macOS/Linux
# o
.\scripts\setup-aws.ps1   # Windows
```

### Si quieres aprender paso a paso:
👉 Lee: [AWS_SETUP_STEP_BY_STEP.md](./docs/AWS_SETUP_STEP_BY_STEP.md)

### Si necesitas consultar durante el proceso:
👉 Usa: [AWS_QUICK_COMMANDS.md](./AWS_QUICK_COMMANDS.md)

---

## 📞 Soporte

Si algo no funciona:

1. **Logs:** `sam logs -n FastAPIFunction --tail`
2. **Documentación:** Lee el archivo correspondiente
3. **Troubleshooting:** Busca en [AWS_QUICK_COMMANDS.md](./AWS_QUICK_COMMANDS.md)
4. **Google:** Busca el error específico

---

**Tiempo estimado para estar en producción: 2 horas**

**¡Adelante! 🚀**
