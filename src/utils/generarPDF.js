const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

function generarPDF(boleto, usuario, evento, detalles = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      let buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // COLORES
      const azul = "#2D3FBD";
      const negro = "#000000";

      // HEADER AZUL
      doc.roundedRect(50, 30, 495, 48, 16).fillAndStroke(azul, azul);
      doc
        .fillColor("white")
        .fontSize(30)
        .font("Helvetica-Bold")
        .text("TicketPlus", 65, 43, { align: "left" });

      // TÍTULO PRINCIPAL
      doc
        .fontSize(22)
        .fillColor(negro)
        .font("Helvetica-Bold")
        .text("Detalle de compra", 0, 95, { align: "center" });

      // LÍNEA DIVISORIA
      doc
        .moveTo(50, 125)
        .lineTo(545, 125)
        .strokeColor(negro)
        .lineWidth(1)
        .stroke();

      // BANNER DEL EVENTO Y DATOS
      let bannerY = 140;
      let bannerPath = path.join(
        __dirname,
        "..",
        "..",
        "public",
        "eventBanners",
        evento.banner_url
      );
      // Imagen más grande y menos espacio debajo
      if (fs.existsSync(bannerPath)) {
        doc.image(bannerPath, 65, bannerY, {
          width: 270,
          height: 110,
          fit: [270, 110],
        });
      }

      // DATOS DEL EVENTO
      const datosX = 350;
      doc
        .font("Helvetica-Bold")
        .fontSize(18)
        .fillColor(azul)
        .text(evento.titulo, datosX, bannerY + 5, {
          align: "left",
          width: 200,
        });

      doc
        .font("Helvetica")
        .fontSize(12)
        .fillColor(negro)
        .text(detalles.lugar || "Lugar no disponible", datosX, bannerY + 35, {
          width: 200,
        })
        .text(
          detalles.fecha
            ? new Date(detalles.fecha).toLocaleString("es-MX", {
                dateStyle: "full",
                timeStyle: "short",
              })
            : "Fecha no disponible",
          datosX,
          bannerY + 60,
          { width: 200 }
        );

      // LÍNEA DIVISORIA
      doc
        .moveTo(50, bannerY + 120)
        .lineTo(545, bannerY + 120)
        .strokeColor(negro)
        .lineWidth(1)
        .stroke();

      // "TU COMPRA"
      doc
        .font("Helvetica-Bold")
        .fontSize(15)
        .fillColor(negro)
        .text("Tu compra", 65, bannerY + 135);

      doc
        .font("Helvetica")
        .fontSize(13)
        .fillColor(negro)
        .text("1x boleto digital", 65, bannerY + 160);

      // TABLA DE SECCIÓN, FILA, ASIENTO
      const tablaY = bannerY + 190;
      const colWidth = 140;
      const rowHeight = 38;

      // Encabezados
      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .fillColor(azul)
        .text("Sección", 65, tablaY, { width: colWidth, align: "center" })
        .text("Fila", 65 + colWidth, tablaY, {
          width: colWidth,
          align: "center",
        })
        .text("Asiento", 65 + 2 * colWidth, tablaY, {
          width: colWidth,
          align: "center",
        });

      // Valores
      doc
        .font("Helvetica")
        .fontSize(16)
        .fillColor(negro)
        .text(detalles.seccion || boleto.seccion || "-", 65, tablaY + 20, {
          width: colWidth,
          align: "center",
        })
        .text(detalles.fila || boleto.fila || "-", 65 + colWidth, tablaY + 20, {
          width: colWidth,
          align: "center",
        })
        .text(
          detalles.asiento || boleto.asiento || "-",
          65 + 2 * colWidth,
          tablaY + 20,
          { width: colWidth, align: "center" }
        );

      // Bordes de la tabla
      doc
        .rect(65, tablaY - 2, colWidth, rowHeight)
        .stroke()
        .rect(65 + colWidth, tablaY - 2, colWidth, rowHeight)
        .stroke()
        .rect(65 + 2 * colWidth, tablaY - 2, colWidth, rowHeight)
        .stroke();

      // LÍNEA DIVISORIA
      doc
        .moveTo(50, tablaY + rowHeight + 18)
        .lineTo(545, tablaY + rowHeight + 18)
        .strokeColor(negro)
        .lineWidth(1)
        .stroke();

      // DETALLE DE COMPRA
      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .fillColor(negro)
        .text("Detalle de compra", 0, tablaY + rowHeight + 30, {
          align: "center",
        });

      // Precios
      doc
        .font("Helvetica")
        .fontSize(14)
        .fillColor(negro)
        .text("1 boleto digital", 65, tablaY + rowHeight + 60)
        .text(
          detalles.precio_boleto
            ? `MX $${Number(detalles.precio_boleto).toLocaleString("es-MX", {
                minimumFractionDigits: 2,
              })}`
            : "-",
          340,
          tablaY + rowHeight + 60
        )
        .text("Cargos por orden", 65, tablaY + rowHeight + 80)
        .text(
          detalles.cargos_por_orden
            ? `MX $${Number(detalles.cargos_por_orden).toLocaleString("es-MX", {
                minimumFractionDigits: 2,
              })}`
            : "-",
          340,
          tablaY + rowHeight + 80
        );

      // LÍNEA DIVISORIA
      doc
        .moveTo(50, tablaY + rowHeight + 110)
        .lineTo(545, tablaY + rowHeight + 110)
        .strokeColor(negro)
        .lineWidth(1)
        .stroke();

      // TOTAL
      doc
        .font("Helvetica-Bold")
        .fontSize(19)
        .fillColor(negro)
        .text("Total", 65, tablaY + rowHeight + 120)
        .text(
          detalles.total_devolucion
            ? `MX $${Number(detalles.total_devolucion).toLocaleString("es-MX", {
                minimumFractionDigits: 2,
              })}`
            : "-",
          340,
          tablaY + rowHeight + 120
        );

      // --- GENERAR Y AGREGAR QR ---
      const qrText = boleto.url_codigo || boleto.codigo_qr || "QR";
      const qrImageBuffer = await QRCode.toBuffer(qrText, { width: 320 });

      // Centrar el QR en la parte inferior y hacerlo más grande
      const qrY = tablaY + rowHeight + 180;
      doc.image(qrImageBuffer, 213, qrY, {
        width: 180,
        height: 180,
        align: "center",
      });

      // Leyenda de uso centrada debajo del QR
      doc
        .font("Helvetica")
        .fontSize(13)
        .fillColor("#888")
        .text(
          "Muestra este código QR en la entrada para validar tu boleto.",
          0,
          qrY + 190,
          { align: "center" }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = generarPDF;
