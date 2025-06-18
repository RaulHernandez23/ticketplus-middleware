const PDFDocument = require("pdfkit");

function generarPDF(boleto, usuario, evento) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      let buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      doc.fontSize(20).text("TicketPlus - Boleto Digital", { align: "center" });
      doc.moveDown();
      doc.fontSize(14).text(`Evento: ${evento.titulo}`);
      doc.text(`Usuario: ${usuario.nombre} ${usuario.apellido_paterno}`);
      doc.text(`Correo: ${usuario.correo}`);
      doc.text(`Fecha de compra: ${boleto.fecha_compra}`);
      doc.text(`Código QR: ${boleto.codigo_qr}`);
      doc.text(`URL QR: ${boleto.url_codigo}`);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = generarPDF;
