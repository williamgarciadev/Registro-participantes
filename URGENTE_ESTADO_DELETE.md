# 🚨 URGENTE: Stack en DELETE_IN_PROGRESS

## 🔴 El Problema AHORA

El stack `registro-participantes-dev` está en estado **DELETE_IN_PROGRESS** y no puedes desplegar nuevamente.

```
Error: Stack is in DELETE_IN_PROGRESS state and can not be updated.
```

## ✅ Solución Inmediata

### OPCIÓN A: Esperar a que termine (Recomendado - 5 min)

El stack se está eliminando. Solo necesitas **esperar**.

Abre PowerShell y ejecuta esto para monitorear:

```powershell
# Ejecuta esto en PowerShell cada 10 segundos
aws cloudformation describe-stacks --stack-name registro-participantes-dev --query 'Stacks[0].StackStatus'
```

Espera a que veas uno de estos resultados:
- ✅ `DELETE_COMPLETE` → Perfecto, procede a OPCIÓN C
- ❌ `DELETE_FAILED` → Ve a OPCIÓN B

**¿Cuánto tarda?** Normalmente 3-5 minutos.

### OPCIÓN B: Si se queda en DELETE_IN_PROGRESS más de 10 minutos

Si después de 10 minutos sigue en `DELETE_IN_PROGRESS`, ejecuta esto para forzar la limpieza:

```powershell
# En PowerShell - Esperar con timeout
for ($i = 1; $i -le 30; $i++) {
    $status = aws cloudformation describe-stacks --stack-name registro-participantes-dev --query 'Stacks[0].StackStatus' 2>$null
    if ($status -eq '"DELETE_COMPLETE"' -or $status -eq 'null') {
        Write-Host "✅ Stack eliminado"
        break
    }
    Write-Host "Status: $status (intento $i/30)"
    Start-Sleep -Seconds 10
}
```

Si eso no funciona:

```powershell
# Ir a AWS Console manualmente
# https://console.aws.amazon.com/cloudformation
# Buscar stack: registro-participantes-dev
# Click derecho → Delete stack
# Confirmar
```

### OPCIÓN C: Desplegar nuevamente (cuando DELETE_COMPLETE)

Cuando el stack esté completamente eliminado, ejecuta:

```powershell
cd D:\Proyectos\ClaudeCode\Registro-participantes

# Esperar verificación final
aws cloudformation describe-stacks --stack-name registro-participantes-dev 2>&1 | findstr "does not exist"

# Si ves "does not exist" → El stack está eliminado, procede:
sam build

# Despliegue rápido (usa samconfig.toml)
sam deploy
```

## 📊 Estado Actual Basado en Tu Output

```
Última línea en tu output:
"Stack:...is in DELETE_IN_PROGRESS state and can not be updated."

Esto significa:
✅ El template.yaml está ARREGLADO (sin EngineVersion)
✅ El build (sam build) FUNCIONÓ
❌ Pero SAM intenta desplegar sobre un stack que se está eliminando
❌ Necesitas ESPERAR a que termine la eliminación
```

## 🎯 Plan Simple

1. **Ahora (0-10 min)**: Espera que `DELETE_IN_PROGRESS` termine

2. **Cuando veas `DELETE_COMPLETE`**: Ejecuta
   ```powershell
   sam build
   sam deploy
   ```

3. **Espera despliegue**: 10-15 minutos para crear recursos

4. **Cuando termineStatusCode `CREATE_COMPLETE`**: Continúa con crear tablas en BD

## ⏱️ Tiempo Total Desde Ahora

- Esperar DELETE: **3-5 min**
- Sam build: **2 min**
- Sam deploy: **10-15 min**
- **Total: 15-22 minutos hasta tener app en AWS**

## 💡 Por Qué Pasó Esto

1. Ejecutaste `sam deploy` mientras stack anterior estaba en error
2. SAM intentó eliminar el stack antiguo automáticamente
3. El stack está eliminándose, pero tarda
4. Intentaste desplegar nuevamente mientras se eliminaba
5. CloudFormation no permite eso - necesita terminar primero

## 📋 Checklist - QUÉ HACER AHORA

- [ ] Abre PowerShell en la carpeta del proyecto
- [ ] Ejecuta: `aws cloudformation describe-stacks --stack-name registro-participantes-dev --query 'Stacks[0].StackStatus'`
- [ ] Si dice `DELETE_COMPLETE` o `does not exist` → Ve al paso siguiente
- [ ] Si dice `DELETE_IN_PROGRESS` → Espera 1-2 minutos y repite
- [ ] Cuando esté eliminado: Ejecuta `sam build && sam deploy`
- [ ] Espera a `CREATE_COMPLETE`

## 🆘 Si Algo Falla

### Error: "Stack doesn't exist"
✅ Perfecto, significa que se eliminó. Procede a `sam deploy`.

### Error: "Stack still in DELETE_IN_PROGRESS after 15 min"
```powershell
# Accede a AWS Console
# https://console.aws.amazon.com/cloudformation
# Busca "registro-participantes-dev"
# Si aparece → Click → Delete button (fuerza eliminación)
# Si no aparece → Ya se eliminó, procede a sam deploy
```

### Error: "Cannot create changeset"
Significa que el stack sigue en DELETE_IN_PROGRESS.
Espera más tiempo (máximo 10 min total).

---

## ✅ PRÓXIMO PASO - A EJECUTAR CUANDO STACK ESTÉ ELIMINADO

```powershell
cd D:\Proyectos\ClaudeCode\Registro-participantes
sam build
sam deploy
```

Luego espera ~15 minutos a que termine.

---

**TL;DR**: El stack se está eliminando. Espera a que termine (máx 10 min). Luego ejecuta `sam build && sam deploy`.

**¿No sabes si terminó?** Ejecuta esto:
```powershell
aws cloudformation describe-stacks --stack-name registro-participantes-dev --query 'Stacks[0].StackStatus'
```

Si sale `DELETE_COMPLETE` o error `does not exist` → ¡Procede al deploy!
