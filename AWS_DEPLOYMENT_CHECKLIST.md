# ✅ Checklist de Despliegue en AWS

Usa este checklist para rastrear tu progreso en el despliegue.

## FASE 1: Preparación (10 minutos)

- [ ] Tengo cuenta AWS activa
- [ ] Tengo Access Key ID y Secret Access Key del usuario IAM
- [ ] Tengo Python 3.11+ instalado
- [ ] Tengo Node.js 18+ instalado
- [ ] Tengo Docker instalado
- [ ] Tengo Git instalado

## FASE 2: Configuración de Herramientas (15 minutos)

- [ ] AWS CLI instalado (`aws --version` funciona)
- [ ] AWS SAM CLI instalado (`sam --version` funciona)
- [ ] AWS CLI configurado (`aws configure`)
- [ ] Verifiqué credenciales (`aws sts get-caller-identity`)

**Documentación:** Ver `docs/AWS_SETUP_STEP_BY_STEP.md` Paso 1-2

---

## FASE 3: Despliegue Backend (20-30 minutos)

### Construir
- [ ] Ejecuté `sam build`
- [ ] Build fue exitoso (sin errores)
- [ ] Folder `.aws-sam/` fue creado

### Desplegar
- [ ] Ejecuté `sam deploy --guided`
- [ ] Stack name: `registro-participantes-dev`
- [ ] Region: `us-east-1`
- [ ] Stage: `dev`
- [ ] DBMasterPassword: guardé la contraseña en lugar seguro
- [ ] Despliegue completó exitosamente (10-15 min)

### Verificar Outputs
- [ ] Obtuve `ApiUrl` de CloudFormation
- [ ] Obtuve `FrontendBucketName` de CloudFormation
- [ ] Obtuve `CloudFrontUrl` de CloudFormation
- [ ] Obtuve `DBEndpoint` de CloudFormation

**Documentación:** Ver `docs/AWS_SETUP_STEP_BY_STEP.md` Paso 3

**Datos Guardados:**
```
API URL: _________________________________
Frontend Bucket: _________________________
CloudFront URL: ___________________________
DB Endpoint: _______________________________
Stack Name: ________________________________
```

---

## FASE 4: Configurar Base de Datos (10 minutos)

### Obtener Credenciales
- [ ] Ejecuté AWS CLI para obtener secreto de BD
- [ ] Guardé host, usuario, contraseña, nombre de BD

**Credenciales:**
```
Host: _____________________________________
Usuario: __________________________________
Contraseña: ________________________________
Base de datos: _____________________________
```

### Crear Tablas
- [ ] Abrí RDS Query Editor en AWS Console
- [ ] Conecté con el cluster Aurora
- [ ] Ejecuté script `scripts/init-database.sql`
- [ ] Verifiqué que las tablas se crearon correctamente

**Documentación:** Ver `docs/AWS_SETUP_STEP_BY_STEP.md` Paso 4-5

---

## FASE 5: Probar Backend (5 minutos)

### Health Check
- [ ] Ejecuté health check: `curl $API_URL/health`
- [ ] Recibí respuesta `{"status":"healthy"}`

### Crear Participante
- [ ] Ejecuté POST a `/api/v1/participantes`
- [ ] Recibí respuesta con nuevo participante

### Listar Participantes
- [ ] Ejecuté GET a `/api/v1/participantes`
- [ ] Recibí lista de participantes

**Documentación:** Ver `docs/AWS_SETUP_STEP_BY_STEP.md` Paso 7

---

## FASE 6: Desplegar Frontend (15-20 minutos)

### Preparar
- [ ] Obtuve URL de API Gateway
- [ ] Creé `.env` en folder `frontend/`
- [ ] Configuré `VITE_API_URL` con URL de API

### Instalar y Construir
- [ ] Ejecuté `cd frontend` y `npm install`
- [ ] Sin errores de instalación
- [ ] Ejecuté `npm run build`
- [ ] Folder `dist/` fue creado exitosamente

### Subir a S3
- [ ] Obtuve nombre del bucket S3
- [ ] Ejecuté `aws s3 sync dist/ s3://$BUCKET_NAME/ --delete`
- [ ] Archivos fueron subidos exitosamente

### Invalidar CloudFront
- [ ] Obtuve Distribution ID de CloudFront
- [ ] Ejecuté `aws cloudfront create-invalidation`
- [ ] Invalidation fue creado

**Documentación:** Ver `docs/AWS_SETUP_STEP_BY_STEP.md` Paso 6

---

## FASE 7: Probar Frontend (5-10 minutos)

### Acceso Básico
- [ ] Abrí URL de CloudFront en navegador
- [ ] Página de inicio cargó correctamente
- [ ] Menú de navegación es visible

### Crear Participante
- [ ] Hice clic en "Nuevo Participante"
- [ ] Completé formulario con datos válidos
- [ ] Hice clic en "Guardar"
- [ ] Participante fue creado exitosamente

### Ver Lista
- [ ] Hice clic en "Participantes"
- [ ] Lista muestra el participante que creé
- [ ] Puedo ver nombre, email, estado

### Buscar
- [ ] Usé la barra de búsqueda
- [ ] Búsqueda por nombre funciona
- [ ] Búsqueda por email funciona

### Editar
- [ ] Hice clic en botón editar
- [ ] Actualicé datos del participante
- [ ] Cambios se guardaron correctamente

### Eliminar
- [ ] Hice clic en botón eliminar
- [ ] Confirmar eliminación
- [ ] Participante fue marcado como inactivo

**Documentación:** Ver `docs/AWS_SETUP_STEP_BY_STEP.md` Paso 7

---

## FASE 8: Monitoreo (10 minutos)

### CloudWatch Logs
- [ ] Abrí AWS Console → CloudWatch → Logs
- [ ] Encontré log group `/aws/lambda/registro-participantes-dev-FastAPIFunction`
- [ ] Verifiqué que hay logs de ejecuciones

### Ver Logs en Vivo
- [ ] Ejecuté `sam logs -n FastAPIFunction --stack-name registro-participantes-dev --tail`
- [ ] Logs aparecen en tiempo real

### Métricas
- [ ] Abrí CloudWatch → Dashboards
- [ ] Veo gráficos de invocaciones
- [ ] Veo gráficos de duración

### X-Ray Traces
- [ ] Abrí AWS Console → X-Ray → Service map
- [ ] Veo la arquitectura: API Gateway → Lambda → Aurora
- [ ] Veo traces de mis requests

**Documentación:** Ver `docs/AWS_SETUP_STEP_BY_STEP.md` Paso 8

---

## FASE 9: Optimización (Opcional)

- [ ] Configuré CloudWatch alarms para errores
- [ ] Revisé CloudWatch metrics
- [ ] Configuré budget alerts en AWS Budgets
- [ ] Verifiqué costos estimados

---

## FASE 10: Documentación (5 minutos)

- [ ] Guardé todas las URLs importantes
- [ ] Guardé credenciales en lugar seguro
- [ ] Documenté el proceso en un documento
- [ ] Compartí URLs con el equipo (si aplica)

**Información Importante:**
```
API URL: ___________________________________
Frontend URL: _______________________________
Stack Name: ________________________________
AWS Region: _________________________________
AWS Account: ________________________________
Support Contact: ____________________________
```

---

## ✅ DESPLIEGUE COMPLETADO!

### URLs para Acceder

**Frontend (Principal):**
```
https://[CLOUDFRONT-URL]
```

**API Backend (Developer):**
```
https://[API-GATEWAY-URL]/api/v1
```

**API Docs (Swagger):**
```
https://[API-GATEWAY-URL]/docs
```

**API Docs (ReDoc):**
```
https://[API-GATEWAY-URL]/redoc
```

---

## 🔧 Desarrollo Continuo

### Para hacer cambios en Backend:
```bash
# Hacer cambios en código
# Luego:
sam build && sam deploy
```

### Para hacer cambios en Frontend:
```bash
cd frontend
npm run build
aws s3 sync dist/ s3://$BUCKET_NAME/ --delete
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```

---

## 📊 Monitoreo Diario

- [ ] Revisar CloudWatch logs
- [ ] Revisar errores en X-Ray
- [ ] Revisar costos en AWS Billing
- [ ] Verificar health check

**Comandos Útiles:**
```bash
# Ver logs en vivo
sam logs -n FastAPIFunction --stack-name registro-participantes-dev --tail

# Ver costos
aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 --granularity MONTHLY --metrics "UnblendedCost"

# Ver eventos del stack
aws cloudformation describe-stack-events --stack-name registro-participantes-dev
```

---

## ❌ Troubleshooting

Si algo no funciona:

### Error: "Stack creation failed"
```bash
# Ver detalles del error
aws cloudformation describe-stack-events \
  --stack-name registro-participantes-dev \
  --query 'StackEvents[0:5]'
```

### Error: "Lambda timeout"
- Aumentar timeout en `template.yaml`
- Ejecutar `sam build && sam deploy`

### Error: "Cannot connect to Aurora"
- Verificar Security Groups
- Verificar credenciales en Secrets Manager
- Verificar estado de Aurora

### Error: "Frontend no carga"
- Esperar propagación de CloudFront (5-10 min)
- Invalidar cache
- Verificar bucket S3

### Error: "CORS error"
- Verificar `CORS_ORIGINS` en `backend/src/core/config.py`
- Reconstruir y desplegar backend

---

## 📞 Soporte

Si necesitas ayuda:

1. Revisa los logs: `sam logs ...`
2. Revisa documentación: `docs/AWS_SETUP_STEP_BY_STEP.md`
3. Revisa CloudFormation events en AWS Console
4. Busca el error específico en Google o Stack Overflow

---

**Última actualización:** 2024
**Versión:** 1.0
**Estado:** ✅ Producción
