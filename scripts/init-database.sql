-- =====================================================
-- Script de Inicializacion de Base de Datos
-- Sistema: Registro de Participantes
-- =====================================================

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS participantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    estado VARCHAR(20) DEFAULT 'activo' NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    extra_data JSONB DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_participantes_email ON participantes(email);
CREATE INDEX IF NOT EXISTS idx_participantes_estado ON participantes(estado);
CREATE INDEX IF NOT EXISTS idx_participantes_fecha_registro ON participantes(fecha_registro);

CREATE TABLE IF NOT EXISTS registros_actividad (
    id SERIAL PRIMARY KEY,
    participante_id UUID REFERENCES participantes(id) ON DELETE CASCADE,
    tipo_evento VARCHAR(100),
    descripcion TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_actividad_participante ON registros_actividad(participante_id);
CREATE INDEX IF NOT EXISTS idx_actividad_fecha ON registros_actividad(fecha);
