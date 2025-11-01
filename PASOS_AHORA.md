# 🚀 Pasos Ahora: Continuar el Deploy

## ✅ Qué Se Arregló

El archivo `template.yaml` ha sido corregido. Se removió la línea problemática:

```yaml
# ANTES (error):
EngineVersion: '15.4'  # ← Esta versión no existe

# AHORA (corregido):
# EngineVersion removido - AWS usa la versión predeterminada
```

**Error que causaba:**
```
Cannot find version 15.4 for aurora-postgresql
```

## 🎯 Próximos Pasos (5 minutos)

### Paso 1: Eliminar el stack fallido (1 min)

```bash
# Verifica que el stack está en estado failed
aws cloudformation describe-stacks --stack-name registro-participantes-dev

# Elimina el stack fallido
aws cloudformation delete-stack --stack-name registro-participantes-dev

# Espera a que se elimine completamente (puede tardar 2-3 min)
aws cloudformation wait stack-delete-complete --stack-name registro-participantes-dev
```

Si esto tarda mucho, avanza al paso 2 mientras se elimina.

### Paso 2: Compilar el proyecto (2 min)

```bash
cd D:\Proyectos\ClaudeCode\Registro-participantes
sam build
```

### Paso 3: Desplegar nuevamente (10-15 min)

```bash
# Opción A: Despliegue rápido (usa samconfig.toml existente)
sam deploy

# Opción B: Despliegue interactivo (si necesitas cambiar parámetros)
sam deploy --guided
```

### Paso 4: Espera a que termine

El deploy tomará **10-15 minutos**. Verás algo como:

```
Changeset created successfully.
Stack creation in progress...
  CREATE_IN_PROGRESS | AWS::VPC::VPC | VPC
  CREATE_IN_PROGRESS | AWS::S3::Bucket | FrontendBucket
  ...
  CREATE_COMPLETE | AWS::CloudFormation::Stack | registro-participantes-dev
```

### Paso 5: Verifica éxito

Cuando termine verás:

```
Stack creation completed successfully.

Outputs:
─────────────────────────────────
Key                 | Value
─────────────────────────────────
ApiUrl              | https://xxxxx.execute-api.us-east-1.amazonaws.com/dev
CloudFrontUrl       | d123456789.cloudfront.net
FrontendBucketName  | registro-participantes-xxxxx
...
```

**Guarda estas URLs**, las necesitarás después.

## 📋 Resumen de lo que pasa

```
1. Eliminas stack fallido (~3 min)
2. sam build compila código (~2 min)
3. sam deploy crea recursos en AWS:
   - VPC y subnets
   - Aurora PostgreSQL (con versión correcta)
   - Lambda function
   - API Gateway
   - S3 bucket
   - CloudFront distribution
   - Logging y monitoring
   (~10-15 min)
4. Te muestra los outputs
```

## 🆘 Si Algo Sale Mal

### El stack sigue en estado "DELETE_IN_PROGRESS"

Espera a que termine (máx 5 minutos). Puedes ver el progreso:

```bash
aws cloudformation describe-stacks --stack-name registro-participantes-dev
```

### Error: "Stack with id registro-participantes-dev does not exist"

Perfecto, significa que ya se eliminó. Procede al Paso 2.

### Error durante sam deploy

Lee: `SOLUCION_AURORA_VERSION.md` → Troubleshooting

### Error: "Access Denied"

Verifica credenciales AWS:
```bash
aws sts get-caller-identity
```

## ⏱️ Tiempo Total

- Eliminar stack: 3-5 minutos
- Sam build: 2 minutos
- Sam deploy: 10-15 minutos
- **Total: 15-22 minutos**

## 🎯 Después de que Termine Exitosamente

Una vez que veas "Stack creation completed successfully":

1. **Crear tablas en BD** (5 min) → SOLUCION_AURORA_VERSION.md
2. **Desplegar frontend** (5 min)
3. **Subir a S3** (2 min)
4. **Invalidar CloudFront** (1 min)
5. **Testear** (2 min)

Total post-deploy: 15 minutos

## 📞 Documentos de Referencia

- **Durante deploy**: `AWS_QUICK_COMMANDS.md` → Monitoreo
- **Si error Aurora**: `SOLUCION_AURORA_VERSION.md`
- **Comandos útiles**: `AWS_QUICK_COMMANDS.md`
- **Aprender arquitectura**: `AWS_DEPLOYMENT_OVERVIEW.md`

---

## ✅ CHECKLIST RÁPIDO

- [ ] Eliminar stack con `aws cloudformation delete-stack`
- [ ] Esperar que se elimine (`aws cloudformation wait`)
- [ ] Ejecutar `sam build`
- [ ] Ejecutar `sam deploy`
- [ ] Esperar a que termine (~15 min)
- [ ] Ver "Stack creation completed successfully"
- [ ] Copiar las 3 URLs del output
- [ ] Continuar con siguiente paso (crear tablas en BD)

---

**¡Adelante! Tu aplicación estará en AWS en menos de 30 minutos.** 🚀

*Última actualización: Después de corregir EngineVersion en template.yaml*
