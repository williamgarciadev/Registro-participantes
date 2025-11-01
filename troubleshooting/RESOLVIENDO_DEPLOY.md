# 🔧 Resolviendo el Despliegue - Estás Atascado en SAM Deploy

## 🔴 ¿Ves Este Error?

```
CREATE_FAILED - AWS::ApiGateway::Stage

CloudWatch Logs role ARN must be set in account settings to enable logging
```

**→ Ve a:** `troubleshooting/SOLUCION_CLOUDWATCH_LOGS.md`

---

## ⏳ ¿Estás Esperando en el Prompt?

Veo que estás en este punto:

```
Parameter DBMasterUsername:
Parameter DBMasterPassword:
Disable rollback [y/N]: y
FastAPIFunction has no authentication. Is this okay? [y/N]:
```

No te preocupes, aquí te digo exactamente qué hacer.

---

## 🎯 Los Pasos Exactos

### 1️⃣ Rellena DBMasterUsername

Cuando veas:
```
Parameter DBMasterUsername:
```

**Escribe:**
```
postgres
```

Luego presiona **ENTER**

---

### 2️⃣ Rellena DBMasterPassword

Cuando veas:
```
Parameter DBMasterPassword:
```

**Escribe una contraseña segura:**
```
MiPassword123!
```

⚠️ **REQUISITOS:**
- Mínimo 8 caracteres
- Con números
- Con mayúsculas
- Sin comillas

Luego presiona **ENTER**

**Guarda esta contraseña en un lugar seguro, la necesitarás después**

---

### 3️⃣ Disable rollback

Cuando veas:
```
Disable rollback [y/N]: y
```

**Presiona ENTER** (ya está en "y")

O escribe:
```
y
```

Luego presiona **ENTER**

---

### 4️⃣ FastAPIFunction has no authentication

Este es el punto donde estás ahora:

```
FastAPIFunction has no authentication. Is this okay? [y/N]:
```

**Escribe:**
```
y
```

Luego presiona **ENTER**

**Explicación:** Esto es normal. Lambda no necesita autenticación en sí mismo. API Gateway se encarga de rutear los requests. Más adelante puedes agregar AWS Cognito si necesitas.

---

### 5️⃣ Confirm changeset

Después verá:
```
Changeset created successfully.
Deploy this changeset? [y/N]:
```

**Escribe:**
```
y
```

Luego presiona **ENTER**

---

### ⏳ Espera a que Termine

Ahora SAM empezará a crear los recursos en AWS:

```
CloudFormation resources status
======================
Stack creation in progress...
...
Stack creation completed successfully.
```

**Esto toma 10-15 minutos.**

Verás muchos "CREATE_IN_PROGRESS" - eso es normal.

---

## ✅ Cuando Termine

Verás algo como:

```
Stack ARN: arn:aws:cloudformation:us-east-1:123456789012:stack/...

Outputs:
-------------------------------------
Key    | Value
-------------------------------------
ApiUrl | https://xxxxx.execute-api.us-east-1.amazonaws.com/dev
FrontendBucketName | registro-participantes-xxxxx
CloudFrontUrl | d123456.cloudfront.net
...
-------------------------------------
```

**¡Copia estas URLs! Las necesitarás**

---

## 🎯 Próximo Paso Después del Deploy

Una vez que termine `sam deploy`:

### 1. Crea las tablas en la BD

Ve a AWS Console:
1. RDS → Databases → Click en "registro-participantes"
2. Tab "Query editor"
3. Click "New query"
4. Abre archivo: `scripts/init-database.sql`
5. Copia todo el contenido
6. Pégalo en el Query Editor
7. Click "Run"

### 2. Construye el Frontend

```bash
cd frontend
npm install
npm run build
```

### 3. Sube a S3

Desde la raíz del proyecto:

```bash
# Obtener nombre del bucket (de los outputs del deploy)
BUCKET_NAME="registro-participantes-xxxxx"

# Subir
aws s3 sync frontend/dist/ s3://$BUCKET_NAME/ --delete
```

### 4. Invalida CloudFront

```bash
DIST_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[0].Id" --output text)

aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```

### 5. Prueba

1. Abre en navegador: `https://d123456.cloudfront.net`
2. Deberías ver la página de inicio
3. Haz clic en "Nuevo Participante"
4. Crea uno
5. Verifica que aparece en la lista

---

## 🆘 Si Algo Sale Mal

### Si ves error durante el deploy

Anota el error completo y ejecuta:

```bash
# Ver qué salió mal
aws cloudformation describe-stack-events \
  --stack-name registro-participantes-dev \
  --query 'StackEvents[0:5]'
```

### Si el script anterior no termina

**Presiona Ctrl+C** para detenerlo.

Luego comprueba el estado:

```bash
aws cloudformation describe-stacks \
  --stack-name registro-participantes-dev \
  --query 'Stacks[0].StackStatus'
```

Si dice "CREATE_COMPLETE", significa que ya terminó. Abre AWS Console para ver los outputs.

---

## 📋 Checklist para Terminar

- [ ] Rellenaste DBMasterUsername: `postgres`
- [ ] Rellenaste DBMasterPassword: `tu-contraseña` (guardada en lugar seguro)
- [ ] Respondiste `y` a "Disable rollback"
- [ ] Respondiste `y` a "FastAPIFunction has no authentication"
- [ ] Respondiste `y` a "Deploy this changeset"
- [ ] El deploy terminó exitosamente (ver "Stack creation completed successfully")
- [ ] Copiaste las URLs de los outputs
- [ ] Creaste las tablas en RDS Query Editor
- [ ] Subiste el frontend a S3
- [ ] Invalidaste CloudFront
- [ ] Probaste el frontend en el navegador

---

## 🚀 ¡Adelante!

Presiona hacia arriba para ver la pregunta de "FastAPIFunction has no authentication" si todavía está en pantalla.

Escribe `y` y presiona ENTER.

¡Verás que el despliegue continúa! 🎉
