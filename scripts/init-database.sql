-- Script para inicializar la base de datos en Aurora Serverless
-- Ejecutar en: AWS RDS Query Editor o pgAdmin

-- Crear extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tabla de participantes
CREATE TABLE IF NOT EXISTS participantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_participantes_email ON participantes(email);
CREATE INDEX IF NOT EXISTS idx_participantes_estado ON participantes(estado);
CREATE INDEX IF NOT EXISTS idx_participantes_fecha_registro ON participantes(fecha_registro DESC);
CREATE INDEX IF NOT EXISTS idx_participantes_nombre ON participantes(nombre);
CREATE INDEX IF NOT EXISTS idx_participantes_apellido ON participantes(apellido);

-- Crear tabla de auditoría (opcional, para rastrear cambios)
CREATE TABLE IF NOT EXISTS participantes_audit (
    id SERIAL PRIMARY KEY,
    participante_id UUID NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
    accion VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE
    datos_anterior JSONB,
    datos_nuevo JSONB,
    usuario VARCHAR(255),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice para auditoría
CREATE INDEX IF NOT EXISTS idx_audit_participante ON participantes_audit(participante_id);
CREATE INDEX IF NOT EXISTS idx_audit_fecha ON participantes_audit(fecha DESC);

-- Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_participantes_updated_at ON participantes;
CREATE TRIGGER update_participantes_updated_at
    BEFORE UPDATE ON participantes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Ver el resultado
SELECT 'Tablas creadas exitosamente' AS resultado;

-- Mostrar estructura de la tabla
\d+ participantes;

-- Verificar índices
SELECT indexname FROM pg_indexes WHERE tablename = 'participantes';
