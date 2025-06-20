USE ticketplus;
SET NAMES utf8mb4;

INSERT INTO pais (pais, codigo_iso_2, url_bandera) VALUES
('México', 'MX', '/flags/mx.png'),
('Estados Unidos', 'US', '/flags/us.png');

INSERT INTO usuario (nombre, apellido_paterno, apellido_materno, correo, contrasena, fecha_registro, estado, codigo_postal, id_pais) VALUES
('Carlos', 'Ramírez', 'López', 'carlos@example.com', SHA2('pass1', 256), NOW(), 'activo', '01000', 1),
('Ana', 'González', 'Martínez', 'ana@example.com', SHA2('pass2', 256), NOW(), 'activo', '02800', 1);

INSERT INTO categoria (categoria) VALUES
('Concierto'),
('Teatro'),
('Festival'),
('Danza'),
('Exposición');

INSERT INTO artista (nombre, banner_url) VALUES
('Grupo Firme', 'https://img.com/gf.png'),
('Alejandro Sanz', 'https://img.com/as.png'),
('Shakira', 'https://img.com/s.png'),
('Britney Spears', 'https://img.com/bs.png'),
('Aurora', 'https://img.com/a.png'),
('Morning Musume', 'https://img.com/mm.png'),
('Imagine Dragons', 'https://img.com/id.png'),
('K/DA', 'https://img.com/k.png'),
('And One', 'https://img.com/ao.png'),
('Chayanne', 'https://img.com/c.png');

INSERT INTO evento (titulo, descripcion, banner_url, id_artista, id_categoria) VALUES
('Grupo Firme en Vivo',
'Una noche explosiva llena de música regional mexicana con Grupo Firme, interpretando sus más grandes éxitos en un concierto lleno de energía, fiesta y emociones.',
'bannerGrupoFirme.png', 1, 1),
('Sanz Tour 2025',
'Disfruta de una velada inolvidable con Alejandro Sanz en su gira 2025, donde presentará sus clásicos y nuevos temas en un show cargado de emoción y talento.',
'bannerSanz.png', 2, 1),
('El Dorado Tour', 'Revive los mayores hits de Shakira en un espectáculo inolvidable.', 'bannerShakira.png', 3, 1),
('Live in Vegas', 'Britney regresa al escenario con un show lleno de energía y nostalgia pop.', 'bannerBritneySpears.png', 4, 1),
('Experiencia Celestial', 'Aurora presenta una noche mágica de sonidos etéreos y visuales envolventes.', 'bannerAurora.png', 5, 1),
('Festival J-Pop', 'El mejor pop japonés llega con el icónico grupo Morning Musume.', 'bannerMorningMusume.png', 6, 3),
('Mercury World Tour', 'Una experiencia poderosa y explosiva con Imagine Dragons en concierto.', 'bannerImagineDragons.png', 7, 1),
('Pop Virtual Show', 'Las estrellas virtuales de K/DA deslumbran con su show lleno de ritmo y luces.', 'bannerKDA.png', 8, 3),
('Synthpop en Vivo', 'Vive el synthpop oscuro y potente de la banda alemana And One.', 'bannerAndOne.png', 9, 1),
('Baile Total', 'Chayanne conquista el escenario con su carisma y éxitos bailables.', 'bannerChayanne.png', 10, 1);

INSERT INTO recinto (nombre, calle, numero, ciudad, estado) VALUES
('Mcbride-Rogers', 'Michael Squares', '2512', 'Monterrey', 'activo'),
('Banks, Allen and Brown', 'Lopez Hills', '21926', 'Ciudad de México', 'activo'),
('Hernandez and Sons', 'Gordon Prairie', '62257', 'Guadalajara', 'activo'),
('Mckee, Alvarado and Bird', 'Allen Canyon', '2648', 'Querétaro', 'activo'),
('Morrison-Robinson', 'Anthony Locks', '70438', 'Mérida', 'activo'),
('Hamilton-Thompson', 'Elizabeth Light', '987', 'San Pedro Garza García', 'activo'),
('Palmer and Sons', 'Nathan Flats', '84861', 'Puebla', 'inactivo'),
('Orozco Group', 'Nicole Rapid', '2318', 'León', 'activo'),
('Graham, Brown and Reid', 'Erickson Trail', '122', 'Cancún', 'activo'),
('Ferguson Ltd', 'Karen Rapid', '8667', 'Tijuana', 'activo');

INSERT INTO funcion (id_evento, fecha, id_recinto, fecha_inicio_venta, fecha_fin_venta, disponibilidad) VALUES
(1, '2025-09-08 07:22:04', 1, '2025-08-09 07:22:04', '2025-09-07 07:22:04', 0),
(2, '2025-07-07 07:22:04', 2, '2025-06-07 07:22:04', '2025-07-06 07:22:04', 0),
(3, '2025-11-28 07:22:04', 3, '2025-10-29 07:22:04', '2025-11-27 07:22:04', 1),
(4, '2025-08-08 07:22:04', 4, '2025-07-09 07:22:04', '2025-08-07 07:22:04', 0),
(5, '2025-07-31 07:22:04', 5, '2025-07-01 07:22:04', '2025-07-30 07:22:04', 1),
(6, '2025-12-17 07:22:04', 6, '2025-11-17 07:22:04', '2025-12-16 07:22:04', 0),
(7, '2025-11-17 07:22:04', 7, '2025-10-18 07:22:04', '2025-11-16 07:22:04', 1),
(8, '2025-11-27 07:22:04', 8, '2025-10-28 07:22:04', '2025-11-26 07:22:04', 1),
(9, '2025-10-16 07:22:04', 9, '2025-09-16 07:22:04', '2025-10-15 07:22:04', 1),
(10, '2025-08-15 07:22:04', 10, '2025-07-16 07:22:04', '2025-08-14 07:22:04', 1);

INSERT INTO zona (nombre) VALUES
('+ VIP'),
('VIP'),
('General');

INSERT INTO asiento (numero, fila, id_zona) VALUES
(1, 'A', 1),
(2, 'A', 1),
(3, 'A', 1),
(4, 'A', 1),
(5, 'A', 1),
(6, 'A', 1),
(7, 'A', 1),
(8, 'A', 1),
(1, 'B', 2),
(2, 'B', 2),
(3, 'B', 2),
(4, 'B', 2),
(5, 'B', 2),
(6, 'B', 2),
(7, 'B', 2),
(8, 'B', 2),
(1, 'C', 3),
(2, 'C', 3),
(3, 'C', 3),
(4, 'C', 3),
(5, 'C', 3),
(6, 'C', 3),
(7, 'C', 3),
(8, 'C', 3);

INSERT INTO funcion_precio (id_funcion, id_zona, precio) VALUES
(1, 1, 983.00),
(1, 2, 723.99),
(1, 3, 500.00),
(2, 1, 1123.00),
(2, 2, 900.50),
(2, 3, 601.99),
(3, 1, 1012.99),
(3, 2, 980.00),
(3, 3, 732.00),
(4, 1, 2780.99),
(4, 2, 2192.00),
(4, 3, 1705.99),
(5, 1, 1800.00),
(5, 2, 1549.99),
(5, 3, 1145.00),
(6, 1, 1500.00),
(6, 2, 1200.99),
(6, 3, 999.99),
(7, 1, 3400.00),
(7, 2, 3100.99),
(7, 3, 2800.00),
(8, 1, 1400.00),
(8, 2, 1200.00),
(8, 3, 1000.00),
(9, 1, 1600.99),
(9, 2, 1424.99),
(9, 3, 1119.00),
(10, 1, 1549.99),
(10, 2, 1235.00),
(10, 3, 999.99);

INSERT INTO descuento (nombre, tipo, valor, codigo, max_usos, usos, fecha_inicio, fecha_fin, estado) VALUES
('Promo 1', 'fijo', 40.54, 'MZULOK', 100, 33, '2025-05-21 07:22:04', '2025-07-20 07:22:04', 'inactivo'),
('Promo 2', 'porcentaje', 48.51, 'AAXHOC', 200, 33, '2025-05-21 07:22:04', '2025-07-20 07:22:04', 'activo'),
('Promo 3', 'fijo', 39.13, 'EFUFYZ', 100, 27, '2025-05-21 07:22:04', '2025-07-20 07:22:04', 'activo'),
('Promo 4', 'fijo', 11.39, 'UZVRNY', 100, 48, '2025-05-21 07:22:04', '2025-07-20 07:22:04', 'activo'),
('Promo 5', 'fijo', 14.12, 'YLCOLX', 100, 19, '2025-05-21 07:22:04', '2025-07-20 07:22:04', 'activo');



