# ✅ Solución: Error de Versión Aurora PostgreSQL

## 🔴 El Problema

Viste este error durante `sam deploy`:

```
CREATE_FAILED AWS::RDS::DBCluster AuroraCluster
Resource handler returned message: "Cannot find version 15.4 for aurora-postgresql
(Service: Rds, Status Code: 400, Request ID: ffe5bcd2-a905-4f2b-a109-4dd233e1b98b)"
```

## ❌ Por Qué Pasó

El archivo `template.yaml` especificaba `EngineVersion: '15.4'` para Aurora PostgreSQL, pero AWS RDS no reconoce esa versión exacta como válida.

```yaml
AuroraCluster:
  Type: AWS::RDS::DBCluster
  Properties:
    Engine: aurora-postgresql
    EngineVersion: '15.4'  # ← Esta versión NO existe en AWS
```

## ✅ Solución Aplicada

Se removió la especificación de versión del template.yaml. AWS ahora usará automáticamente la versión más reciente compatible de Aurora PostgreSQL.

```yaml
AuroraCluster:
  Type: AWS::RDS::DBCluster
  Properties:
    Engine: aurora-postgresql
    # EngineVersion removido - AWS usa la versión predeterminada
```

## 🚀 Próximos Pasos

### 1. Limpiar el despliegue anterior (si se quedó en proceso)

```bash
# Ver el stack que falló
aws cloudformation describe-stacks --stack-name registro-participantes-dev

# Eliminar el stack fallido (CUIDADO: esto elimina recursos)
aws cloudformation delete-stack --stack-name registro-participantes-dev

# Esperar a que se elimine
aws cloudformation wait stack-delete-complete --stack-name registro-participantes-dev
```

### 2. Reintentar el despliegue

```bash
# Build
sam build

# Deploy (opción A: automático - usa samconfig.toml existente)
sam deploy

# Deploy (opción B: guiado - si necesitas cambiar parámetros)
sam deploy --guided
```

### 3. Monitorear el despliegue

```bash
# Ver eventos en tiempo real
aws cloudformation describe-stack-events \
  --stack-name registro-participantes-dev \
  --query 'StackEvents[0:10]' \
  --output table

# O esperar a que termine (puede tomar 10-15 min)
aws cloudformation wait stack-create-complete \
  --stack-name registro-participantes-dev
```

## ⏳ Tiempo Estimado

- **Sam build**: 2-3 minutos
- **Sam deploy**: 10-15 minutos
- **Total**: 15-20 minutos

## ✅ Cómo Verificar Éxito

Cuando termine exitosamente verás:

```
Changeset created successfully.
Stack creation completed successfully.

Outputs:
─────────────────────────────────
Key             | Value
─────────────────────────────────
ApiUrl          | https://xxxxx.execute-api.us-east-1.amazonaws.com/dev
FrontendBucketName | registro-participantes-xxxxx
CloudFrontUrl   | d123456789.cloudfront.net
...
```

## 🎯 Después del Deploy Exitoso

Una vez que veas "Stack creation completed successfully":

### 1. Crear Tablas en BD

```bash
# 1. Ve a AWS Console: https://console.aws.amazon.com
# 2. Busca: RDS → Databases
# 3. Click en: registro-participantes
# 4. Tab: "Query editor" (o "Database Tools")
# 5. Click: "Create Query"
# 6. Copia el contenido de scripts/init-database.sql
# 7. Pégalo en el editor
# 8. Click: "Execute"
```

### 2. Desplegar Frontend

```bash
cd frontend
npm install
npm run build
```

### 3. Subir a S3

```bash
# Del output anterior, obtén FrontendBucketName
BUCKET_NAME="registro-participantes-xxxxx"

aws s3 sync frontend/dist/ s3://$BUCKET_NAME/ --delete
```

### 4. Invalidar CloudFront

```bash
# Obtén Distribution ID
DIST_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[0].Id" \
  --output text)

# Invalida el cache
aws cloudfront create-invalidation \
  --distribution-id $DIST_ID \
  --paths "/*"
```

### 5. Testear

```bash
# Abre en navegador la URL CloudFront de los outputs
# Deberías ver la aplicación cargando
# Si ves "Cannot GET /" es normal - necesitas las tablas en BD
```

## 🆘 Si Algo Sale Mal

### Error: "Stack already exists"

```bash
# El stack anterior no se eliminó completamente
aws cloudformation delete-stack --stack-name registro-participantes-dev
# Espera que termine
aws cloudformation wait stack-delete-complete --stack-name registro-participantes-dev
# Reintenta
sam deploy --guided
```

### Error: "Cannot connect to database"

```bash
# Las credenciales no coinciden o el secreto no se creó
# Verifica en AWS Secrets Manager
aws secretsmanager get-secret-value \
  --secret-id registro-participantes-dev-db-credentials
```

### Error: "Lambda no puede conectar a Aurora"

```bash
# Verifica que los security groups estén configurados
aws ec2 describe-security-groups \
  --filters Name=group-name,Values=*aurora-sg \
  --query 'SecurityGroups[0]'
```

## 📋 Checklist

- [ ] Template.yaml fijo (EngineVersion removido)
- [ ] Git commit hecho
- [ ] Stack anterior eliminado (si fue necesario)
- [ ] Sam build completado
- [ ] Sam deploy completado exitosamente
- [ ] Tablas creadas en BD
- [ ] Frontend construido
- [ ] Frontend subido a S3
- [ ] CloudFront invalidado
- [ ] App funciona en navegador

## 💡 Por Qué Esta Solución Funciona

**Mejor Práctica**: No hardcodear versiones de bases de datos en infraestructura

✅ **Ventajas de remover EngineVersion**:
- AWS usa la versión más reciente compatible automáticamente
- Sin necesidad de actualizar template cuando hay nuevas versiones
- Mejor seguridad (parches se aplican automáticamente)
- Evita conflictos de versiones en el futuro

❌ **Desventajas de especificar versión exacta**:
- Requiere actualización manual cuando AWS retira versiones
- Propensa a errores de compatibilidad
- Versiones muy específicas (como 15.4) pueden no existir

---

**¡Adelante! Tu aplicación estará en AWS en 20 minutos.** 🚀
