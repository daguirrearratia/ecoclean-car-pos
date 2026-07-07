-- Creación de Enumeraciones (Tipos de datos seguros)
CREATE TYPE categoria_vehiculo AS ENUM ('SEDÁN', 'SUV', 'XL');
CREATE TYPE tipo_pago AS ENUM ('TARJETA', 'TRANSFERENCIA');
CREATE TYPE estado_servicio AS ENUM ('En Proceso', 'Secado Técnico', 'Listo para Retiro');

-- Catálogo oficial e inmutable para el operador
CREATE TABLE catalogo_servicios (
    id SERIAL PRIMARY KEY,
    categoria categoria_vehiculo NOT NULL,
    nombre_servicio VARCHAR(100) NOT NULL,
    precio_bruto INT NOT NULL,
    CONSTRAINT unique_servicio_categoria UNIQUE (categoria, nombre_servicio)
);

-- Tabla de Clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE
);

-- Tabla de Vehículos
CREATE TABLE vehiculos (
    patente VARCHAR(8) PRIMARY KEY,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    categoria categoria_vehiculo NOT NULL
);

-- Historial transaccional auditabilidad anti-robo hormiga
CREATE TABLE ordenes_servicio (
    id SERIAL PRIMARY KEY,
    cliente_id INT REFERENCES clientes(id) NOT NULL,
    vehiculo_patente VARCHAR(8) REFERENCES vehiculos(patente) NOT NULL,
    servicio_id INT REFERENCES catalogo_servicios(id) NOT NULL,
    tipo_pago tipo_pago NOT NULL,
    valor_bruto INT NOT NULL,
    valor_neto INT NOT NULL,
    valor_iva INT NOT NULL,
    estado estado_servicio DEFAULT 'En Proceso' NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Carga del catálogo oficial extraído de la imagen
INSERT INTO catalogo_servicios (categoria, nombre_servicio, precio_bruto) VALUES
('SEDÁN', 'Lavado Exterior', 9990),
('SEDÁN', 'Lavado Full Interior + Exterior Premium', 19990),
('SEDÁN', 'Limpieza de Tapiz (incluye Higienización)', 27990),
('SEDÁN', 'Limpieza y Protección de Motor', 15990),
('SEDÁN', 'Higienización Aire Acondicionado', 14990),
('SUV', 'Lavado Exterior', 12990),
('SUV', 'Lavado Full Interior + Exterior Premium', 23990),
('SUV', 'Limpieza de Tapiz (incluye Higienización)', 34990),
('SUV', 'Limpieza y Protección de Motor', 16990),
('SUV', 'Higienización Aire Acondicionado', 14990),
('XL', 'Lavado Exterior', 14990),
('XL', 'Lavado Full Interior + Exterior Premium', 25990),
('XL', 'Limpieza de Tapiz (incluye Higienización)', 37990),
('XL', 'Limpieza y Protección de Motor', 16990),
('XL', 'Higienización Aire Acondicionado', 14990);
