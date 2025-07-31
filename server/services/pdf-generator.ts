import { PDFDocument, rgb, StandardFonts, PDFFont } from "pdf-lib";
import QRCode from "qrcode";
import { Certificate, Course, User } from "@shared/schema";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

export interface CertificateData {
  certificate: Certificate;
  user: User;
  course: Course;
}

export class PDFGenerator {
  private splitTextIntoLines(
    text: string,
    maxWidth: number,
    font: PDFFont,
    fontSize: number,
  ): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (textWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          lines.push(word);
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  private async generateQRCode(certificateId: string): Promise<Buffer> {
    const qrCodeUrl = `https://wespark.io/verify/${certificateId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
      type: "image/png",
    });

    return Buffer.from(qrCodeDataUrl.split(",")[1], "base64");
  }

  private async generarHash(texto: string): Promise<string> {
    const buffer = new TextEncoder().encode(texto);
    const digest = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  async generateCertificate(data: CertificateData): Promise<Buffer> {
    const { certificate, user, course } = data;

    // Crear un nuevo documento PDF
    const pdfDoc = await PDFDocument.create();

    // Añadir una página con dimensiones de certificado (A4 horizontal)
    const page = pdfDoc.addPage([842, 595]);
    const { width, height } = page.getSize();

    // Incrustar fuentes
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Cargar imagen de fondo si está disponible
    if (course.certificateBackground) {
      try {
        // Por ahora, usaremos un fondo predeterminado ya que no podemos cargar desde URL en este entorno
        // En producción, obtendrías la imagen desde la URL
        page.drawRectangle({
          x: 0,
          y: 0,
          width: width,
          height: height,
          color: rgb(0.992, 0.816, 0.027), // #FCD307 amarillo
        });
      } catch (error) {
        console.error("Error al cargar la imagen de fondo:", error);
        // Volver a un fondo amarillo predeterminado
        page.drawRectangle({
          x: 0,
          y: 0,
          width: width,
          height: height,
          color: rgb(0.992, 0.816, 0.027), // #FCD307 amarillo
        });
      }
    } else {
      // Fondo amarillo predeterminado
      page.drawRectangle({
        x: 0,
        y: 0,
        width: width,
        height: height,
        color: rgb(0.992, 0.816, 0.027), // #FCD307 amarillo
      });
    }

    // Nombre del curso (centrado, 1-2 líneas)
    const courseLines = this.splitTextIntoLines(
      course.title,
      600,
      boldFont,
      28,
    );
    const courseStartY = height - 180;

    courseLines.forEach((line, index) => {
      const lineWidth = boldFont.widthOfTextAtSize(line, 28);
      page.drawText(line, {
        x: (width - lineWidth) / 2,
        y: courseStartY - index * 35,
        size: 28,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
    });

    // Nombre del usuario (centrado, 1-2 líneas)
    const userLines = this.splitTextIntoLines(user.name, 600, boldFont, 32);
    const userStartY = height - 280;

    userLines.forEach((line, index) => {
      const lineWidth = boldFont.widthOfTextAtSize(line, 32);
      page.drawText(line, {
        x: (width - lineWidth) / 2,
        y: userStartY - index * 40,
        size: 32,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
    });

    // Texto estático del certificado
    const certificateText =
      "WeSpark certifies that you have completed our future-ready learning experience designed to build practical skills for real-world impact. This certificate celebrates your participation in our interactive, innovation-focused training. Now go out there and release your inner genius !";
    const textLines = this.splitTextIntoLines(certificateText, 700, font, 14);
    let textStartY = height - 380;

    textLines.forEach((line, index) => {
      const lineWidth = font.widthOfTextAtSize(line, 14);
      page.drawText(line, {
        x: (width - lineWidth) / 2,
        y: textStartY - index * 18,
        size: 14,
        font: font,
        color: rgb(0, 0, 0),
      });
    });

    // Ciudad y fecha
    const completionDate = new Date(certificate.completionDate);
    const dateString = completionDate.toLocaleDateString("de-DE"); // Formato DD.MM.AAAA
    const cityDateText = certificate.city
      ? `${certificate.city}, ${dateString}`
      : dateString;

    const cityDateWidth = font.widthOfTextAtSize(cityDateText, 16);
    page.drawText(cityDateText, {
      x: (width - cityDateWidth) / 2,
      y: height - 480,
      size: 16,
      font: font,
      color: rgb(0, 0, 0),
    });

    // Firmas
    page.drawText("Nelson Inno", {
      x: width / 2 - 150,
      y: height - 520,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    page.drawText("Co-Founder & CVO", {
      x: width / 2 - 150,
      y: height - 535,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });

    page.drawText("WeSpark", {
      x: width / 2 - 150,
      y: height - 550,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });

    page.drawText("Adam Nili", {
      x: width / 2 + 50,
      y: height - 520,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    page.drawText("Co-Founder & CSO", {
      x: width / 2 + 50,
      y: height - 535,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });

    page.drawText("WeSpark", {
      x: width / 2 + 50,
      y: height - 550,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });

    // Generar y añadir código QR (abajo a la izquierda)
    try {
      const qrCodeBuffer = await this.generateQRCode(certificate.certificateId);
      const qrCodeImage = await pdfDoc.embedPng(qrCodeBuffer);

      page.drawImage(qrCodeImage, {
        x: 50,
        y: 50,
        width: 100,
        height: 100,
      });
    } catch (error) {
      console.error("Error al generar el código QR:", error);
    }

    // Cargar y añadir el logo de WeSpark (centro)
    try {
      const logoPath = path.join(
        process.cwd(),
        "attached_assets",
        "Logo Only with White Border_1752094039667.png",
      );
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        const logoImage = await pdfDoc.embedPng(logoBuffer);

        page.drawImage(logoImage, {
          x: (width - 80) / 2,
          y: height - 420,
          width: 80,
          height: 80,
        });
      }
    } catch (error) {
      console.error("Error al cargar el logo:", error);
    }

    // Serializar el PDF
    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    return pdfBuffer;
  }
}

export const pdfGenerator = new PDFGenerator();
