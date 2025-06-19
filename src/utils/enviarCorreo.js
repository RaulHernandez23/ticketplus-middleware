const nodemailer = require("nodemailer");

async function enviarCorreo(destinatario, asunto, texto, pdfBuffer) {
	let transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: "ticketplusv@gmail.com",
			pass: "gmlb jerj lutu znuh",
		},
		tls: {
			rejectUnauthorized: false, // Permite conexiones TLS sin certificado válido
		},
	});

	let mailOptions = {
		from: '"TicketPlus" <ticketplusv@gmail.com>',
		to: destinatario,
		subject: asunto,
		text: texto,
		attachments: [
			{
				filename: "boleto.pdf",
				content: pdfBuffer,
			},
		],
	};

	await transporter.sendMail(mailOptions);
}

async function enviarCorreoRecuperacion(destinatario, asunto, texto) {
	let transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: "ticketplusv@gmail.com",
			pass: "gmlb jerj lutu znuh",
		},
		tls: {
			rejectUnauthorized: false, // Permite conexiones TLS sin certificado válido
		},
	});

	let mailOptions = {
		from: '"TicketPlus" <ticketplusv@gmail.com>',
		to: destinatario,
		subject: asunto,
		text: texto,
	};

	await transporter.sendMail(mailOptions);
}

module.exports = {
	enviarCorreo,
	enviarCorreoRecuperacion,
};
