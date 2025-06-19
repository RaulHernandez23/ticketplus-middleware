USE ticketplus;
SET NAMES utf8mb4;

INSERT INTO pais (pais, codigo_iso_2, url_bandera) VALUES
('México', 'MX', '/flags/mx.png'),
('Estados Unidos', 'US', '/flags/us.png');

INSERT INTO usuario (nombre, apellido_paterno, apellido_materno, correo, contrasena, fecha_registro, estado, codigo_postal, id_pais) VALUES
('Carlos', 'Ramírez', 'López', 'carlos@example.com', SHA2('pass1', 256), NOW(), 'activo', '01000', 1),
('Ana', 'González', 'Martínez', 'ana@example.com', SHA2('pass2', 256), NOW(), 'activo', '02800', 1);

INSERT INTO categoria (categoria) VALUES
('Música'), ('Teatro');

INSERT INTO artista (nombre, banner_url) VALUES
('Grupo Firme', 'https://img.com/gf.png'),
('Alejandro Sanz', 'https://img.com/as.png');

INSERT INTO evento (titulo, descripcion, banner_url, id_artista, id_categoria) VALUES
('Grupo Firme en Vivo',
'Una noche explosiva llena de música regional mexicana con Grupo Firme, interpretando sus más grandes éxitos en un concierto lleno de energía, fiesta y emociones.',
'bannerGrupoFirme.png', 1, 1),
('Sanz Tour 2025',
'Disfruta de una velada inolvidable con Alejandro Sanz en su gira 2025, donde presentará sus clásicos y nuevos temas en un show cargado de emoción y talento.',
'bannerSanz.png', 2, 1);

INSERT INTO recinto (nombre, calle, numero, ciudad, estado) VALUES
('Auditorio Nacional', 'Reforma', '50', 'CDMX', 'activo');

INSERT INTO funcion (id_evento, fecha, id_recinto, fecha_inicio_venta, fecha_fin_venta, disponibilidad) VALUES
(1, '2025-07-15 20:00:00', 1, '2025-06-01', '2025-07-14', true);

INSERT INTO zona (nombre) VALUES
('VIP'), ('General');

INSERT INTO asiento (numero, fila, id_zona) VALUES
(1, 'A', 1),
(2, 'A', 1),
(1, 'B', 2);

INSERT INTO funcion_precio (id_funcion, id_zona, precio) VALUES
(1, 1, 1500.00),
(1, 2, 800.00);

INSERT INTO descuento (nombre, tipo, valor, codigo, max_usos, usos, fecha_inicio, fecha_fin, estado) VALUES
('Promo10', 'porcentaje', 10.0, 'PRM10', NULL, 0, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'activo');

INSERT INTO metodo_pago (alias, fecha_registro, estado, tipo_metodo, id_usuario) VALUES
('Visa Carlos', NOW(), 1, 'tarjeta', 1),
('PayPal Ana', NOW(), 1, 'paypal', 2);

INSERT INTO tarjeta (id_metodo_pago, numero_tarjeta_cifrado, titular_tarjeta, vencimiento_mes, vencimiento_ano, ultimos_cuatro) VALUES
(1, 'CIFRADO1234567812345678', 'Carlos Ramírez', 12, 2026, '1234');

INSERT INTO paypal (id_metodo_pago, correo_paypal) VALUES
(2, 'ana@paypal.com');

INSERT INTO pago (costo_servicio, monto_total, fecha_pago, estado, id_descuento, id_metodo_pago) VALUES
(50.00, 1350.00, NOW(), 'pendiente', 1, 1);

INSERT INTO boleto (id_evento_precio, id_pago, id_usuario, fecha_compra, estado, id_asiento, id_funcion, codigo_qr, url_codigo) VALUES
(1, 1, 1, NOW(), 'pagado', 1, 1, 'QR123ABC', 'https://qr.com/QR123ABC');

INSERT INTO recuperacion_contrasena (id_usuario, token, fecha_expiracion) VALUES
(1, 'TOKEN123', DATE_ADD(NOW(), INTERVAL 1 DAY));

INSERT INTO evento_favorito (id_evento, id_usuario) VALUES (1, 1);
INSERT INTO recinto_favorito (id_recinto, id_usuario) VALUES (1, 2);
INSERT INTO artista_favorito (id_artista, id_usuario) VALUES (1, 2);

INSERT INTO valoracion_evento (id_usuario, id_evento, calificacion, comentario) VALUES
(1, 1, 5, 'Excelente evento!');

INSERT INTO solicitud_reembolso (id_boleto, motivo, estado) VALUES
(1, 'No podré asistir', 'pendiente');

INSERT INTO notificacion (id_usuario, id_funcion, tipo_notificacion, mensaje, enviada, fecha_envio) VALUES
(1, 1, 'funcion nueva', '¡Nuevo evento disponible!', true, NOW());

INSERT INTO transferencia_boleto (id_boleto, id_usuario_origen, id_usuario_destino, fecha_transferencia, tipo_transferencia) VALUES
(1, 1, 2, NOW(), 'venta');
