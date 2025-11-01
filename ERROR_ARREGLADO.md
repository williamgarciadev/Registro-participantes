# 🔧 Error Arreglado - Solución Rápida

## 🔴 EL PROBLEMA

Viste este error:

```
The config file extension '' is not supported. Supported formats are: [.toml|.yaml|.yml]
Error: The config file D:\...\y uses an unsupported extension, and cannot be read.
```

## ❌ POR QUÉ PASÓ

Respondiste "y" (yes) a TODAS las preguntas, incluso a:
- `SAM configuration file [samconfig.toml]:` ← Aquí NO deberías escribir nada
- `SAM configuration environment [default]:` ← Aquí NO deberías escribir nada

Cuando veas una pregunta con `[default]` o `[samconfig.toml]` entre corchetes, **SOLO presiona ENTER**.

## ✅ SOLUCIÓN

### Opción A: Empezar de Nuevo (Recomendado - 5 min)

```bash
# 1. Elimina archivos rotos
rm samconfig.toml
rm -r .aws-sam

# 2. Intenta de nuevo
sam deploy --guided
```

Pero esta vez **cuando veas esto:**
```
Save arguments to configuration file [Y/n]: y
SAM configuration file [samconfig.toml]:
```

**SOLO PRESIONA ENTER** (no escribas "y")

El prompt cambiará a:
```
SAM configuration environment [default]:
```

**SOLO PRESIONA ENTER** de nuevo

---

### Opción B: Usar Samconfig.toml Actual

Si quieres arreglar sin empezar de nuevo:

```bash
# 1. Verifica el archivo
cat samconfig.toml

# 2. Debería verse así:
# [default]
# [default.build.parameters]
# [default.deploy.parameters]
# ...

# 3. Si está correcto, intenta:
sam build

# 4. Luego:
sam deploy
```

---

## 🎯 CUANDO SAM TE PREGUNTE NUEVAMENTE

### Preguntas donde ESCRIBES algo:

```
Stack Name [registro-participantes]: registro-participantes-dev
AWS Region [us-east-1]: us-east-1
Parameter Stage [dev]: dev
Parameter DBMasterUsername: postgres
Parameter DBMasterPassword: MiPassword123!
Confirm changes before deploy [Y/n]: y
Allow SAM CLI IAM role creation [Y/n]: y
Disable rollback [y/N]: y
FastAPIFunction has no authentication. Is this okay? [y/N]: y
```

### Preguntas donde SOLO PRESIONAS ENTER:

```
Save arguments to configuration file [Y/n]: ← ENTER (no escribas)
SAM configuration file [samconfig.toml]: ← ENTER (no escribas)
SAM configuration environment [default]: ← ENTER (no escribas)
```

---

## 🚀 AHORA INTENTA ESTO

```bash
# Opción 1: Empezar de nuevo (más seguro)
rm samconfig.toml
rm -r .aws-sam
sam deploy --guided

# Opción 2: Usar lo que tienes
sam build
sam deploy
```

**Espera el despliegue (10-15 minutos)**

Si ves `Stack creation completed successfully` → ✅ Funciona

---

## ⚠️ RECUERDA

Cuando veas `[something]` entre corchetes, significa:
- `[something]` = valor por defecto
- Si presionas ENTER = usa el valor por defecto
- Si escribes algo = reemplaza el valor por defecto

En Windows PowerShell, los corchetes `[ ]` aparecen en los prompts.

---

## ✅ PRÓXIMO PASO

Ejecuta una de estas:

```bash
# Si quieres empezar limpio
rm samconfig.toml && rm -r .aws-sam && sam deploy --guided

# Si quieres usar lo existente
sam build && sam deploy
```

¡Estarás en AWS en 15 minutos! 🚀

---

Si vuelve a salir error, copia el error completo y búscalo en:
→ `AWS_QUICK_COMMANDS.md` → Troubleshooting
