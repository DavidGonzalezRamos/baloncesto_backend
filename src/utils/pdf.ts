import PDFDocument from "pdfkit";
import { IPlayer } from "../models/Player";
import { Writable } from "stream";
import fs from "fs"; // Para cargar imágenes

export const createTeamPDF = (teamName: string, players: IPlayer[]): Promise<Buffer> => {
  const doc = new PDFDocument({ margin: 30, size: "A4" });

  const buffers: Buffer[] = [];
  return new Promise((resolve, reject) => {
    const writableStream = new Writable({
      write(chunk, encoding, callback) {
        buffers.push(chunk);
        callback();
      },
    });

    writableStream.on("finish", () => {
      try {
        const resultBuffer = Buffer.concat(buffers);
        resolve(resultBuffer);
      } catch (error) {
        reject(new Error("Error al concatenar los buffers del PDF"));
      }
    });

    writableStream.on("error", (err) => {
      reject(new Error(`Error en el flujo de escritura: ${err.message}`));
    });

    doc.pipe(writableStream);

    try {
      // Encabezado principal
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("INSTITUTO POLITÉCNICO NACIONAL", { align: "center" })
        .moveDown(0.5)
        .fontSize(12)
        .text("Dirección de Actividades Deportivas", { align: "center" })
        .text("LVI Juegos Deportivos Interpolitécnicos 2025", { align: "center" })
        .moveDown();

      // Encabezado del equipo
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(`Equipo: ${teamName}`, { align: "left" })
        .moveDown(1);

      const cardWidth = 175; // Ancho reducido
      const cardHeight = 140; // Altura incrementada
      const marginX = 15; // Espaciado horizontal
      const startX = 20; // Posición inicial X
      const startY = doc.y; // Posición inicial Y
      const rowHeight = cardHeight + 20; // Espacio entre filas

      // Generar tarjetas de jugadores
      players.forEach((player, index) => {
        const col = index % 3; // Columna actual (0, 1, 2)
        const row = Math.floor(index / 3); // Fila actual
        const x = startX + col * (cardWidth + marginX);
        const y = startY + row * rowHeight;

        // Dibuja el marco de la tarjeta
        doc.rect(x, y, cardWidth, cardHeight).stroke();

        // Agregar foto
        if (player.photoPlayer && fs.existsSync(player.photoPlayer)) {
          doc.image(player.photoPlayer, x + 10, y + 10, { fit: [50, 50] });
        } else {
          doc.rect(x + 10, y + 10, 50, 50).stroke(); // Marco para la foto
        }

        // Información del jugador
        let textY = y + 10; // Posición inicial del texto
        doc
          .fontSize(10)
          .font("Helvetica-Bold")
          .text(`${player.name || "N/A"} ${player.lastName}`, x + 70, textY, {
            width: cardWidth - 80,
          });
        textY += 30; // Más espacio entre líneas

        doc
          .font("Helvetica")
          .text(`Boleta: ${player.numberIpn || "N/A"}`, x + 70, textY, {
            width: cardWidth - 80,
          });
        textY += 20;

        doc
          .text(`CURP: ${player.curp || "N/A"}`, x + 70, textY, {
            width: cardWidth - 80,
          });
        textY += 30;

        doc
          .text(`Posición: ${player.position || "N/A"}`, x + 70, textY, {
            width: cardWidth - 80,
          });
        textY += 20;

        doc
          .text(`Número: ${player.number}`, x + 70, textY, {
            width: cardWidth - 80,
          });
      });

      doc.end();
    } catch (error) {
      reject(new Error(`Error durante la generación del PDF: ${error.message}`));
    }
  });
};
