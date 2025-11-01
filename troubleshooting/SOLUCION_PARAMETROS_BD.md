# ✅ Solución: Falta de Parámetros de Base de Datos

## 🔴 El Problema

Viste este error:

```
Error: Parameters: [DBMasterPassword] must have values
```

## ❌ Por Qué Pasó

El archivo `samconfig.toml` no tenía las credenciales de la base de datos:
- `DBMasterUsername` (faltaba)
- `DBMasterPassword` (faltaba)

```toml
# ANTES (incompleto):
parameter_overrides = "Stage=\"dev\""

# AHORA (correcto):
parameter_overrides = "Stage=\"dev\" DBMasterUsername=\"postgres\" DBMasterPassword=\"ChangeMe123!\""
```

## ✅ Solución Aplicada

He actualizado el `samconfig.toml` con:
- **DBMasterUsername**: `postgres` (usuario por defecto)
- **DBMasterPassword**: `ChangeMe123!` (contraseña temporal)

## 🚀 Próximos Pasos

El archivo ya está arreglado. Solo ejecuta:

```powershell
cd D:\Proyectos\ClaudeCode\Registro-participantes
sam deploy
```

## ⏱️ Tiempo Estimado

- **Sam deploy**: 10-15 minutos
- **Espera total**: ~15 minutos

## ✅ Qué Esperar

Verás:

```
Waiting for stack create/update to complete
CloudFormation events from stack operations...
  CREATE_IN_PROGRESS | AWS::VPC::VPC | VPC
  CREATE_IN_PROGRESS | AWS::RDS::DBCluster | AuroraCluster
  CREATE_COMPLETE | AWS::RDS::DBCluster | AuroraCluster
  ...
  CREATE_COMPLETE | AWS::CloudFormation::Stack | registro-participantes-dev

Stack creation completed successfully.

Outputs:
─────────────────────────────────────────────
Key                 | Value
─────────────────────────────────────────────
ApiUrl              | https://xxxxx.execute-api.us-east-1.amazonaws.com/dev
CloudFrontUrl       | d123456789.cloudfront.net
FrontendBucketName  | registro-participantes-xxxxx
DBSecretArn         | arn:aws:secretsmanager:...
```

**Copia y guarda estas 3 URLs:**
```
API URL: https://xxxxx.execute-api.us-east-1.amazonaws.com/dev
Frontend Bucket: registro-participantes-xxxxx
CloudFront URL: d123456.cloudfront.net
```

## 🔒 Seguridad - IMPORTANTE PARA PRODUCCIÓN

La contraseña temporal `ChangeMe123!` está en el samconfig.toml.

**Para producción, debes:**

1. Cambiar la contraseña en AWS RDS
2. Actualizar el secreto en AWS Secrets Manager
3. No commitar credenciales reales en el código

Para ahora (desarrollo), está bien usar `ChangeMe123!`.

## 📋 Próximos Pasos Después de CREATE_COMPLETE

Una vez que veas "Stack creation completed successfully":

### 1. Crear Tablas en BD (5 min)

```powershell
# 1. Ve a: https://console.aws.amazon.com/rds
# 2. Click "Databases"
# 3. Click "registro-participantes"
# 4. Tab "Query editor"
# 5. Click "Create query"
# 6. Abre scripts/init-database.sql
# 7. Copia TODO el contenido
# 8. Pégalo en el editor
# 9. Click "Run"

# Deberías ver: "Tables created successfully"
```

### 2. Desplegar Frontend (5 min)

```powershell
cd frontend
npm install
npm run build
```

### 3. Subir a S3 (2 min)

```powershell
# Reemplaza con FrontendBucketName del output anterior
$BUCKET_NAME = "registro-participantes-xxxxx"

aws s3 sync frontend/dist/ s3://$BUCKET_NAME/ --delete
```

### 4. Invalidar CloudFront (1 min)

```powershell
$DIST_ID = aws cloudfront list-distributions --query "DistributionList.Items[0].Id" --output text
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```

### 5. Testear en Navegador (2 min)

```
1. Abre CloudFront URL del output
2. Verifica que carga
3. Click "Nuevo Participante"
4. Llena formulario
5. Click "Guardar"
6. Verifica que aparece en lista

✅ ¡Todo funciona!
```

## ⏱️ Tiempo Total Restante

```
Sam deploy:         10-15 min
Crear tablas BD:    5 min
Frontend build:     3 min
Subir a S3:         2 min
CloudFront:         1 min
Testear:            2 min
━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:              23-28 minutos
```

## 📋 Checklist

- [ ] Ejecuté `sam deploy`
- [ ] Espéré a `CREATE_COMPLETE`
- [ ] Copié las 3 URLs
- [ ] Creé tablas en BD
- [ ] Construí frontend
- [ ] Subí a S3
- [ ] Invalidé CloudFront
- [ ] Testeé en navegador
- [ ] App funciona ✅

## 💡 Resumen

**Problema:** Faltaban credenciales en samconfig.toml
**Solución:** Ya están agregadas
**Acción:** Ejecuta `sam deploy`
**Tiempo:** 10-15 minutos

---

**¡Estás muy cerca! El 90% del trabajo ya está hecho.** 🚀

Cuando veas `Stack creation completed successfully`, simplemente sigue los pasos de "Próximos Pasos Después de CREATE_COMPLETE" y tendrás la app funcional en menos de una hora.
