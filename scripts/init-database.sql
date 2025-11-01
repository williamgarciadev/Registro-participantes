-- =====================================================
-- Script de Inicializacion de Base de Datos
-- Sistema: Registro de Participantes
-- =====================================================

CREATE TABLE IF NOT EXISTS participantes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    estado VARCHAR(50) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'suspendido')),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_participantes_email ON participantes(email);
CREATE INDEX IF NOT EXISTS idx_participantes_estado ON participantes(estado);
CREATE INDEX IF NOT EXISTS idx_participantes_fecha_registro ON participantes(fecha_registro);

CREATE TABLE IF NOT EXISTS registros_actividad (
    id SERIAL PRIMARY KEY,
    participante_id INTEGER REFERENCES participantes(id) ON DELETE CASCADE,
    tipo_evento VARCHAR(100),
    descripcion TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_actividad_participante ON registros_actividad(participante_id);
CREATE INDEX IF NOT EXISTS idx_actividad_fecha ON registros_actividad(fecha);

CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_participante ON participantes;
CREATE TRIGGER trigger_actualizar_participante
BEFORE UPDATE ON participantes
FOR EACH ROW
EXECUTE FUNCTION actualizar_timestamp();

INSERT INTO participantes (nombre, apellido, email, telefono, estado)
VALUES
    ('Juan', 'Perez', 'juan.perez@example.com', '+57 3001234567', 'activo'),
    ('Maria', 'Garcia', 'maria.garcia@example.com', '+57 3001234568', 'activo'),
    ('Carlos', 'Lopez', 'carlos.lopez@example.com', '+57 3001234569', 'activo'),
    ('Ana', 'Martinez', 'ana.martinez@example.com', '+57 3001234570', 'activo'),
    ('Luis', 'Rodriguez', 'luis.rodriguez@example.com', '+57 3001234571', 'inactivo')
ON CONFLICT (email) DO NOTHING;

INSERT INTO registros_actividad (participante_id, tipo_evento, descripcion, usuario)
SELECT id, 'REGISTRO', 'Participante registrado en el sistema', 'SISTEMA' FROM participantes LIMIT 5;
