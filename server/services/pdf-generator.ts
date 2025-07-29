import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib';
import QRCode from 'qrcode';
import { Certificate, Course, User } from '@shared/schema';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface CertificateData {
  certificate: Certificate;
  user: User;
  course: Course;
}

export class PDFGenerator {
  private splitTextIntoLines(text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
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
    
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 150
      });
      
      const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
      return Buffer.from(base64Data, 'base64');
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  private async generarHash(texto: string): Promise<string> {
    return crypto.createHash('sha256').update(texto).digest('hex');
  }

  async generateCertificate(data: CertificateData): Promise<Buffer> {
    const { certificate, user, course } = data;

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Add a page with certificate dimensions (A4 landscape)
    const page = pdfDoc.addPage([842, 595]);
    const { width, height } = page.getSize();

    // Embed fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Load background image if available
    if (course.certificateBackground) {
      try {
        // For now, use a default background since we can't load from URL in this environment
        // In production, you would fetch the image from the URL
        page.drawRectangle({
          x: 0,
          y: 0,
          width: width,
          height: height,
          color: rgb(0.992, 0.816, 0.027), // #FCD307 yellow
        });
      } catch (error) {
        console.error('Error loading background image:', error);
        // Fallback to default yellow background
        page.drawRectangle({
          x: 0,
          y: 0,
          width: width,
          height: height,
          color: rgb(0.992, 0.816, 0.027), // #FCD307 yellow
        });
      }
    } else {
      // Default yellow background
      page.drawRectangle({
        x: 0,
        y: 0,
        width: width,
        height: height,
        color: rgb(0.992, 0.816, 0.027), // #FCD307 yellow
      });
    }

    // Course name (centered, 1-2 lines)
    const courseLines = this.splitTextIntoLines(course.title, 600, boldFont, 28);
    const courseStartY = height - 180;

    courseLines.forEach((line, index) => {
      const lineWidth = boldFont.widthOfTextAtSize(line, 28);
      page.drawText(line, {
        x: (width - lineWidth) / 2,
        y: courseStartY - (index * 35),
        size: 28,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
    });

    // User name (centered, 1-2 lines)
    const userLines = this.splitTextIntoLines(user.name, 600, boldFont, 32);
    const userStartY = height - 280;

    userLines.forEach((line, index) => {
      const lineWidth = boldFont.widthOfTextAtSize(line, 32);
      page.drawText(line, {
        x: (width - lineWidth) / 2,
        y: userStartY - (index * 40),
        size: 32,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
    });

    // Static certificate text
    const certificateText = "WeSpark certifies that you have completed our future-ready learning experience designed to build practical skills for real-world impact. This certificate celebrates your participation in our interactive, innovation-focused training. Now go out there and release your inner genius!";
    const textLines = this.splitTextIntoLines(certificateText, 700, font, 14);
    let textStartY = height - 380;

    textLines.forEach((line, index) => {
      const lineWidth = font.widthOfTextAtSize(line, 14);
      page.drawText(line, {
        x: (width - lineWidth) / 2,
        y: textStartY - (index * 18),
        size: 14,
        font: font,
        color: rgb(0, 0, 0),
      });
    });

    // City and date
    const completionDate = new Date(certificate.completionDate);
    const dateString = completionDate.toLocaleDateString('de-DE'); // Format DD.MM.YYYY
    const cityDateText = certificate.city ? `${certificate.city}, ${dateString}` : dateString;

    const cityDateWidth = font.widthOfTextAtSize(cityDateText, 16);
    page.drawText(cityDateText, {
      x: (width - cityDateWidth) / 2,
      y: height - 480,
      size: 16,
      font: font,
      color: rgb(0, 0, 0),
    });

    // Signatures
    page.drawText('Nelson Inno', {
      x: width / 2 - 150,
      y: height - 520,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    page.drawText('Co-Founder & CVO', {
      x: width / 2 - 150,
      y: height - 535,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });

    page.drawText('WeSpark', {
      x: width / 2 - 150,
      y: height - 550,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });

    page.drawText('Adam Nili', {
      x: width / 2 + 50,
      y: height - 520,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    page.drawText('Co-Founder & CSO', {
      x: width / 2 + 50,
      y: height - 535,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });

    page.drawText('WeSpark', {
      x: width / 2 + 50,
      y: height - 550,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });

    // Certificate ID
    page.drawText(`Certificate ID: ${certificate.certificateId}`, {
      x: width - 200,
      y: 30,
      size: 10,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Generate and add QR code
    try {
      const qrCodeBuffer = await this.generateQRCode(certificate.certificateId);
      const qrCodeImage = await pdfDoc.embedPng(qrCodeBuffer);

      page.drawImage(qrCodeImage, {
        x: 50,
        y: 30,
        width: 80,
        height: 80,
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }

    // Load and add WeSpark logo (center)
    try {
      const logoPath = path.join(process.cwd(), 'attached_assets', 'Logo Only with White Border_1752094039667.png');
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
      console.error('Error loading logo:', error);
    }

    // Serialize the PDF
    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    return pdfBuffer;
  }
}

export const pdfGenerator = new PDFGenerator();