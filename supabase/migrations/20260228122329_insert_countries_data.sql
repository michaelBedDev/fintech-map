-- 1. Insertar el País
INSERT INTO "paises" ("id", "nombre", "codigo_iso") VALUES
(1, 'España', 'ES'),
(2, 'Andorra', 'AD')
ON CONFLICT (id) DO NOTHING;

-- 2. Insertar Comunidades Autónomas
INSERT INTO "comunidades_autonomas" ("id", "nombre", "pais_id") VALUES
(1, 'Andalucía', 1), (2, 'Aragón', 1), (3, 'Asturias', 1), (4, 'Canarias', 1),
(5, 'Cantabria', 1), (6, 'Castilla y León', 1), (7, 'Castilla-La Mancha', 1),
(8, 'Cataluña', 1), (9, 'Ceuta', 1), (10, 'Comunidad Valenciana', 1),
(11, 'Comunidad de Madrid', 1), (12, 'Extremadura', 1), (13, 'Galicia', 1),
(14, 'Islas Baleares', 1), (15, 'La Rioja', 1), (16, 'Melilla', 1),
(17, 'Navarra', 1), (18, 'País Vasco', 1), (19, 'Región de Murcia', 1), (20, 'Andorra (Nacional)', 2)
ON CONFLICT (id) DO NOTHING;

-- 3. Insertar Provincias (Normalizadas con comunidad_id)
INSERT INTO "provincias" ("id", "nombre", "codigo_ine", "comunidad_id") VALUES
('1', 'A Coruña', '15', 13),
('2', 'Alacant/Alicante', '03', 10),
('3', 'Albacete', '02', 7),
('4', 'Almería', '04', 1),
('5', 'Araba/Álava', '01', 18),
('6', 'Asturias', '33', 3),
('7', 'Badajoz', '06', 12),
('8', 'Barcelona', '08', 8),
('9', 'Bizkaia/Vizcaya', '48', 18),
('10', 'Burgos', '09', 6),
('11', 'Cantabria', '39', 5),
('12', 'Castelló/Castellón', '12', 10),
('13', 'Ceuta', '51', 9),
('14', 'Ciudad Real', '13', 7),
('15', 'Cuenca', '16', 7),
('16', 'Cáceres', '10', 12),
('17', 'Cádiz', '11', 1),
('18', 'Córdoba', '14', 1),
('19', 'Gipuzkoa/Guipúzcoa', '20', 18),
('20', 'Girona', '17', 8),
('21', 'Granada', '18', 1),
('22', 'Guadalajara', '19', 7),
('23', 'Huelva', '21', 1),
('24', 'Huesca', '22', 2),
('25', 'Illes Balears', '07', 14),
('26', 'Jaén', '23', 1),
('27', 'La Rioja', '26', 15),
('28', 'Las Palmas', '35', 4),
('29', 'León', '24', 6),
('30', 'Lleida', '25', 8),
('31', 'Lugo', '27', 13),
('32', 'Madrid', '28', 11),
('33', 'Melilla', '52', 16),
('34', 'Murcia', '30', 19),
('35', 'Málaga', '29', 1),
('36', 'Navarra', '31', 17),
('37', 'Ourense', '32', 13),
('38', 'Palencia', '34', 6),
('39', 'Pontevedra', '36', 13),
('40', 'Salamanca', '37', 6),
('41', 'Santa Cruz De Tenerife', '38', 4),
('42', 'Segovia', '40', 6),
('43', 'Sevilla', '41', 1),
('44', 'Soria', '42', 6),
('45', 'Tarragona', '43', 8),
('46', 'Teruel', '44', 2),
('47', 'Toledo', '45', 7),
('48', 'Valladolid', '47', 6),
('49', 'València/Valencia', '46', 10),
('50', 'Zamora', '49', 6),
('51', 'Zaragoza', '50', 2),
('52', 'Ávila', '05', 6),
-- Contamos andorra como una "comunidad autónoma" con su única provincia para simplificar las cosas
(53, 'Andorra la Vella', 'AD-01', 20)
ON CONFLICT (id) DO NOTHING;

