ALTER DATABASE ticketplus CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

USE ticketplus;

CREATE TABLE `usuario` (
	`id_usuario` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`nombre` VARCHAR(255) NOT NULL,
	`apellido_paterno` VARCHAR(255) NOT NULL,
	`apellido_materno` VARCHAR(255),
	`correo` VARCHAR(255) NOT NULL UNIQUE,
	`contrasena` VARCHAR(255) NOT NULL,
	`fecha_registro` DATETIME NOT NULL,
	`estado` ENUM('activo', 'inactivo') NOT NULL,
	`codigo_postal` VARCHAR(255) NOT NULL,
	`id_pais` INTEGER NOT NULL,
	PRIMARY KEY(`id_usuario`)
);


CREATE INDEX `usuario_index_correo`
ON `usuario` (`correo`);
CREATE TABLE `evento` (
	`id_evento` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`titulo` VARCHAR(255) NOT NULL,
	`banner_url` VARCHAR(255) NOT NULL,
	`id_artista` INTEGER NOT NULL,
	`id_categoria` INTEGER NOT NULL,
	PRIMARY KEY(`id_evento`)
);


CREATE INDEX `evento_index_categoria`
ON `evento` (`id_categoria`);
CREATE INDEX `evento_index_artista`
ON `evento` (`id_artista`);
CREATE TABLE `categoria` (
	`id_categoria` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`categoria` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`id_categoria`)
);


CREATE TABLE `boleto` (
	`id_boleto` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`id_evento_precio` INTEGER NOT NULL,
	`id_pago` INTEGER,
	`id_usuario` INTEGER NOT NULL,
	`fecha_compra` DATETIME NOT NULL,
	`estado` ENUM('disponible', 'reservado', 'pagado', 'reembolsado', 'cancelado', 'transferido', 'usado', 'expirado') NOT NULL,
	`id_asiento` INTEGER NOT NULL,
	`codigo_qr` VARCHAR(510) NOT NULL UNIQUE,
	`url_codigo` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`id_boleto`)
);


CREATE INDEX `boleto_index_usuario`
ON `boleto` (`id_usuario`);
CREATE INDEX `boleto_index_estado`
ON `boleto` (`estado`);
CREATE INDEX `boleto_index_usuario_estado`
ON `boleto` (`id_usuario`, `estado`);
CREATE TABLE `zona` (
	`id_zona` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`nombre` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`id_zona`)
);


CREATE TABLE `funcion_precio` (
	`id_funcion_precio` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`id_funcion` INTEGER NOT NULL,
	`id_zona` INTEGER NOT NULL,
	`precio` DECIMAL NOT NULL,
	PRIMARY KEY(`id_funcion_precio`)
);


CREATE INDEX `funcion_precio_index_funcion`
ON `funcion_precio` (`id_funcion`);
CREATE INDEX `funcion_precio_index_zona`
ON `funcion_precio` (`id_zona`);
CREATE TABLE `asiento` (
	`id_asiento` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`numero` INTEGER NOT NULL,
	`fila` VARCHAR(255) NOT NULL,
	`id_zona` INTEGER NOT NULL,
	PRIMARY KEY(`id_asiento`)
);


CREATE INDEX `asiento_index_zona`
ON `asiento` (`id_zona`);
CREATE INDEX `asiento_index_numero_fila_zona`
ON `asiento` (`numero`, `fila`, `id_zona`);
CREATE TABLE `pago` (
	`id_pago` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`costo_servicio` DECIMAL NOT NULL,
	`monto_total` DECIMAL NOT NULL,
	`fecha_pago` DATETIME NOT NULL,
	`estado` ENUM('pendiente', 'procesando', 'fallido', 'cancelado', 'reembolsado') NOT NULL,
	`id_descuento` INTEGER,
	`id_metodo_pago` INTEGER NOT NULL,
	PRIMARY KEY(`id_pago`)
);


CREATE INDEX `pago_index_metodo_pago`
ON `pago` (`id_metodo_pago`);
CREATE INDEX `pago_index_fecha_pago`
ON `pago` (`fecha_pago`);
CREATE TABLE `metodo_pago` (
	`id_metodo_pago` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`alias` VARCHAR(255) NOT NULL,
	`fecha_registro` DATETIME NOT NULL,
	`estado` BIT NOT NULL,
	`tipo_metodo` ENUM('paypal', 'tarjeta', 'criptomoneda') NOT NULL,
	`id_usuario` INTEGER NOT NULL,
	PRIMARY KEY(`id_metodo_pago`)
);


CREATE INDEX `metodo_pago_index_usuario_estado`
ON `metodo_pago` (`id_usuario`, `estado`);
CREATE TABLE `tarjeta` (
	`id_metodo_pago` INTEGER NOT NULL UNIQUE,
	`numero_tarjeta_cifrado` TEXT(65535) NOT NULL,
	`titular_tarjeta` VARCHAR(255) NOT NULL,
	`vencimiento_mes` INTEGER NOT NULL,
	`vencimiento_ano` INTEGER NOT NULL,
	`ultimos_cuatro` VARCHAR(4) NOT NULL,
	PRIMARY KEY(`id_metodo_pago`)
);


CREATE TABLE `paypal` (
	`id_metodo_pago` INTEGER NOT NULL UNIQUE,
	`correo_paypal` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`id_metodo_pago`)
);


CREATE TABLE `criptomoneda` (
	`id_metodo_pago` INTEGER NOT NULL UNIQUE,
	`direccion_wallet` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`id_metodo_pago`)
);


CREATE TABLE `recuperacion_contrasena` (
	`id_recuperacion` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`id_usuario` INTEGER NOT NULL,
	`token` VARCHAR(255) NOT NULL,
	`fecha_expiracion` DATETIME NOT NULL,
	PRIMARY KEY(`id_recuperacion`)
);


CREATE TABLE `recinto` (
	`id_recinto` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`nombre` VARCHAR(255) NOT NULL,
	`calle` VARCHAR(255) NOT NULL,
	`numero` VARCHAR(255),
	`ciudad` VARCHAR(255) NOT NULL,
	`estado` ENUM('activo', 'inactivo') NOT NULL,
	PRIMARY KEY(`id_recinto`)
);


CREATE TABLE `evento_favorito` (
	`id_evento_favorito` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`id_evento` INTEGER NOT NULL,
	`id_usuario` INTEGER NOT NULL,
	PRIMARY KEY(`id_evento_favorito`)
);


CREATE INDEX `evento_favorito_index_usuario`
ON `evento_favorito` (`id_usuario`);
CREATE TABLE `recinto_favorito` (
	`id_recinto_favorito` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`id_recinto` INTEGER NOT NULL,
	`id_usuario` INTEGER NOT NULL,
	PRIMARY KEY(`id_recinto_favorito`)
);


CREATE INDEX `recinto_favorito_index_usuario`
ON `recinto_favorito` (`id_usuario`);
CREATE TABLE `valoracion_evento` (
	`id_valoracion` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`id_usuario` INTEGER NOT NULL,
	`id_evento` INTEGER NOT NULL,
	`calificacion` INTEGER NOT NULL,
	`comentario` VARCHAR(510),
	PRIMARY KEY(`id_valoracion`)
);


CREATE TABLE `solicitud_reembolso` (
	`id_solicitud` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`id_boleto` INTEGER NOT NULL,
	`motivo` VARCHAR(510) NOT NULL,
	`estado` ENUM('pendiente', 'aceptado', 'rechazado') NOT NULL,
	PRIMARY KEY(`id_solicitud`)
);


CREATE TABLE `descuento` (
	`id_descuento` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`nombre` VARCHAR(255) NOT NULL,
	`tipo` ENUM('porcentaje', 'fijo') NOT NULL,
	`valor` DECIMAL NOT NULL,
	`codigo` VARCHAR(6) NOT NULL,
	`max_usos` INTEGER DEFAULT null COMMENT 'NULL = Ilimitado',
	`usos` INTEGER NOT NULL DEFAULT 0,
	`fecha_inicio` DATETIME NOT NULL,
	`fecha_fin` DATETIME NOT NULL,
	`estado` ENUM('activo', 'inactivo') NOT NULL,
	PRIMARY KEY(`id_descuento`)
);


CREATE INDEX `descuento_index_codigo`
ON `descuento` (`codigo`);
CREATE TABLE `artista` (
	`id_artista` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`nombre` VARCHAR(255) NOT NULL UNIQUE,
	`banner_url` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`id_artista`)
);


CREATE TABLE `artista_favorito` (
	`id_artista_favorito` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`id_artista` INTEGER NOT NULL,
	`id_usuario` INTEGER NOT NULL,
	PRIMARY KEY(`id_artista_favorito`)
);


CREATE INDEX `artista_favorito_index_usuario`
ON `artista_favorito` (`id_usuario`);
CREATE TABLE `notificacion` (
	`id_notificacion` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`id_usuario` INTEGER NOT NULL,
	`id_funcion` INTEGER NOT NULL,
	`tipo_notificacion` ENUM('funcion nueva', 'funcion cancelada') NOT NULL,
	`mensaje` VARCHAR(510) NOT NULL,
	`enviada` BOOLEAN NOT NULL,
	`fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`fecha_envio` DATETIME,
	PRIMARY KEY(`id_notificacion`)
);


CREATE TABLE `funcion` (
	`id_funcion` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`id_evento` INTEGER NOT NULL,
	`fecha` DATETIME NOT NULL,
	`id_recinto` INTEGER NOT NULL,
	`fecha_inicio_venta` DATETIME NOT NULL,
	`fecha_fin_venta` DATETIME NOT NULL,
	`disponibilidad` BOOLEAN NOT NULL DEFAULT true,
	PRIMARY KEY(`id_funcion`)
);


CREATE INDEX `funcion_index_evento`
ON `funcion` (`id_evento`);
CREATE INDEX `funcion_index_recinto`
ON `funcion` (`id_recinto`);
CREATE INDEX `funcion_index_fecha_evento`
ON `funcion` (`fecha`, `id_evento`);
CREATE TABLE `transferencia_boleto` (
	`id_transferencia` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`id_boleto` INTEGER NOT NULL UNIQUE,
	`id_usuario_origen` INTEGER NOT NULL,
	`id_usuario_destino` INTEGER NOT NULL,
	`fecha_transferencia` INTEGER NOT NULL,
	`tipo_transferencia` ENUM('venta', 'regalo') NOT NULL,
	PRIMARY KEY(`id_transferencia`)
);


CREATE TABLE `pais` (
	`id_pais` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`pais` VARCHAR(255) NOT NULL,
	`codigo_iso_2` CHAR(2) NOT NULL,
	`url_bandera` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`id_pais`)
);


ALTER TABLE `evento`
ADD FOREIGN KEY(`id_categoria`) REFERENCES `categoria`(`id_categoria`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `boleto`
ADD FOREIGN KEY(`id_usuario`) REFERENCES `usuario`(`id_usuario`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `funcion_precio`
ADD FOREIGN KEY(`id_zona`) REFERENCES `zona`(`id_zona`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `asiento`
ADD FOREIGN KEY(`id_zona`) REFERENCES `zona`(`id_zona`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `boleto`
ADD FOREIGN KEY(`id_evento_precio`) REFERENCES `funcion_precio`(`id_funcion_precio`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `boleto`
ADD FOREIGN KEY(`id_asiento`) REFERENCES `asiento`(`id_asiento`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `pago`
ADD FOREIGN KEY(`id_metodo_pago`) REFERENCES `metodo_pago`(`id_metodo_pago`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `metodo_pago`
ADD FOREIGN KEY(`id_usuario`) REFERENCES `usuario`(`id_usuario`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `tarjeta`
ADD FOREIGN KEY(`id_metodo_pago`) REFERENCES `metodo_pago`(`id_metodo_pago`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `paypal`
ADD FOREIGN KEY(`id_metodo_pago`) REFERENCES `metodo_pago`(`id_metodo_pago`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `criptomoneda`
ADD FOREIGN KEY(`id_metodo_pago`) REFERENCES `metodo_pago`(`id_metodo_pago`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `boleto`
ADD FOREIGN KEY(`id_pago`) REFERENCES `pago`(`id_pago`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `recuperacion_contrasena`
ADD FOREIGN KEY(`id_usuario`) REFERENCES `usuario`(`id_usuario`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `evento_favorito`
ADD FOREIGN KEY(`id_usuario`) REFERENCES `usuario`(`id_usuario`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `evento_favorito`
ADD FOREIGN KEY(`id_evento`) REFERENCES `evento`(`id_evento`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `recinto_favorito`
ADD FOREIGN KEY(`id_usuario`) REFERENCES `usuario`(`id_usuario`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `recinto_favorito`
ADD FOREIGN KEY(`id_recinto`) REFERENCES `recinto`(`id_recinto`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `valoracion_evento`
ADD FOREIGN KEY(`id_usuario`) REFERENCES `usuario`(`id_usuario`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `valoracion_evento`
ADD FOREIGN KEY(`id_evento`) REFERENCES `evento`(`id_evento`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `solicitud_reembolso`
ADD FOREIGN KEY(`id_boleto`) REFERENCES `boleto`(`id_boleto`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `pago`
ADD FOREIGN KEY(`id_descuento`) REFERENCES `descuento`(`id_descuento`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `evento`
ADD FOREIGN KEY(`id_artista`) REFERENCES `artista`(`id_artista`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `artista_favorito`
ADD FOREIGN KEY(`id_artista`) REFERENCES `artista`(`id_artista`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `artista_favorito`
ADD FOREIGN KEY(`id_usuario`) REFERENCES `usuario`(`id_usuario`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `notificacion`
ADD FOREIGN KEY(`id_usuario`) REFERENCES `usuario`(`id_usuario`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `funcion`
ADD FOREIGN KEY(`id_recinto`) REFERENCES `recinto`(`id_recinto`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `funcion`
ADD FOREIGN KEY(`id_evento`) REFERENCES `evento`(`id_evento`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `funcion_precio`
ADD FOREIGN KEY(`id_funcion`) REFERENCES `funcion`(`id_funcion`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `notificacion`
ADD FOREIGN KEY(`id_funcion`) REFERENCES `funcion`(`id_funcion`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `transferencia_boleto`
ADD FOREIGN KEY(`id_boleto`) REFERENCES `boleto`(`id_boleto`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `transferencia_boleto`
ADD FOREIGN KEY(`id_usuario_origen`) REFERENCES `usuario`(`id_usuario`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `transferencia_boleto`
ADD FOREIGN KEY(`id_usuario_destino`) REFERENCES `usuario`(`id_usuario`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `usuario`
ADD FOREIGN KEY(`id_pais`) REFERENCES `pais`(`id_pais`)
ON UPDATE NO ACTION ON DELETE NO ACTION;