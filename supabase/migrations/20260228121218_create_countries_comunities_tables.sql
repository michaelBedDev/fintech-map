-- 1. Crear estructuras maestras
CREATE TABLE paises (
    id INT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo_iso VARCHAR(2) NOT NULL UNIQUE
);

CREATE TABLE comunidades_autonomas (
    id INT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    pais_id INT,
    CONSTRAINT fk_pais FOREIGN KEY (pais_id) REFERENCES paises(id)
);


ALTER TABLE provincias ADD COLUMN comunidad_id INT;


UPDATE provincias p
SET comunidad_id = (
    SELECT c.id
    FROM comunidades_autonomas c
    WHERE c.nombre = p.comunidad_autonoma
);


ALTER TABLE provincias
ADD CONSTRAINT fk_comunidad
FOREIGN KEY (comunidad_id) REFERENCES comunidades_autonomas (id);

ALTER TABLE provincias DROP COLUMN comunidad_autonoma;
