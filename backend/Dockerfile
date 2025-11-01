FROM public.ecr.aws/lambda/python:3.11

# Copiar archivos de requirements
COPY requirements.txt ${LAMBDA_TASK_ROOT}

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código fuente
COPY src/ ${LAMBDA_TASK_ROOT}/src/

# Configurar el handler
CMD ["src.main.handler"]
