import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { Certificate, Course, User } from '@shared/schema';

export interface CertificateData {
  certificate: Certificate;
  user: User;
  course: Course;
}

export class PDFGenerator {
  async generateCertificate(data: CertificateData): Promise<Buffer> {
    const { certificate, user, course } = data;
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([792, 612]); // Letter size landscape
    
    // Get fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Colors
    const primaryColor = rgb(0.098, 0.463, 0.824); // #1976D2
    const textColor = rgb(0.2, 0.2, 0.2);
    const accentColor = rgb(0.961, 0.486, 0); // #F57C00
    
    // Page dimensions
    const { width, height } = page.getSize();
    const centerX = width / 2;
    
    // Header
    page.drawText('WeSpark', {
      x: centerX - 50,
      y: height - 80,
      size: 36,
      font: helveticaBold,
      color: primaryColor,
    });
    
    page.drawText('Certificate of Completion', {
      x: centerX - 120,
      y: height - 130,
      size: 24,
      font: helveticaFont,
      color: textColor,
    });
    
    // Main content
    page.drawText('This is to certify that', {
      x: centerX - 80,
      y: height - 200,
      size: 16,
      font: helveticaFont,
      color: textColor,
    });
    
    page.drawText(user.name, {
      x: centerX - (user.name.length * 7),
      y: height - 240,
      size: 28,
      font: helveticaBold,
      color: primaryColor,
    });
    
    page.drawText('has successfully completed', {
      x: centerX - 100,
      y: height - 280,
      size: 16,
      font: helveticaFont,
      color: textColor,
    });
    
    page.drawText(course.title, {
      x: centerX - (course.title.length * 5),
      y: height - 320,
      size: 20,
      font: helveticaBold,
      color: accentColor,
    });
    
    page.drawText(course.description, {
      x: centerX - (course.description.length * 3),
      y: height - 350,
      size: 14,
      font: helveticaFont,
      color: textColor,
    });
    
    // Duration and date
    page.drawText(`Duration: ${course.duration} hours`, {
      x: centerX - 200,
      y: height - 400,
      size: 12,
      font: helveticaFont,
      color: textColor,
    });
    
    const completionDate = new Date(certificate.completionDate).toLocaleDateString();
    page.drawText(`Date of Completion: ${completionDate}`, {
      x: centerX + 50,
      y: height - 400,
      size: 12,
      font: helveticaFont,
      color: textColor,
    });
    
    // Certificate ID
    page.drawText(`Certificate ID: ${certificate.certificateId}`, {
      x: centerX - 60,
      y: height - 450,
      size: 12,
      font: helveticaFont,
      color: textColor,
    });
    
    // Generate QR code
    const verificationUrl = `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/verify/${certificate.certificateId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 100,
    });
    
    // Convert QR code to buffer and embed
    const qrCodeBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
    const qrCodeImage = await pdfDoc.embedPng(qrCodeBuffer);
    
    // Add QR code to PDF
    page.drawImage(qrCodeImage, {
      x: width - 150,
      y: height - 200,
      width: 100,
      height: 100,
    });
    
    page.drawText('Scan to verify', {
      x: width - 140,
      y: height - 220,
      size: 10,
      font: helveticaFont,
      color: textColor,
    });
    
    // Footer
    page.drawText('WeSpark Certificate Authority', {
      x: centerX - 80,
      y: 50,
      size: 12,
      font: helveticaFont,
      color: textColor,
    });
    
    // Decorative border
    page.drawRectangle({
      x: 30,
      y: 30,
      width: width - 60,
      height: height - 60,
      borderColor: primaryColor,
      borderWidth: 2,
    });
    
    // Serialize the PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}

export const pdfGenerator = new PDFGenerator();
