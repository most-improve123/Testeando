import { PDFDocument, rgb, StandardFonts, PDFPage } from 'pdf-lib';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { db } from '../db';
import { certificates, users, courses } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface CertificateData {
  name: string;
  courseName: string;
  completionDate: string;
  certificateId: string;
  hash: string;
}

// Generate unique certificate ID
export function generateCertificateId(): string {
  return `WS-${new Date().getFullYear()}-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
}

// Generate SHA-256 hash for verification
export function generateCertificateHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Generate QR code for verification
export async function generateQRCode(verificationUrl: string): Promise<string> {
  try {
    return await QRCode.toDataURL(verificationUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

// Create certificate PDF with background image and QR code
export async function generateCertificatePDF(data: CertificateData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 landscape
  
  // Load font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Add background (you can replace this with the actual background image)
  const { width, height } = page.getSize();
  
  // Background color
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.95, 0.95, 0.95),
  });
  
  // Title section
  page.drawText('CERTIFICATE OF COMPLETION', {
    x: width / 2 - 200,
    y: height - 100,
    size: 32,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  // Course name
  page.drawText(data.courseName, {
    x: width / 2 - (data.courseName.length * 8),
    y: height - 180,
    size: 28,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  // Student name
  page.drawText(data.name, {
    x: width / 2 - (data.name.length * 10),
    y: height - 240,
    size: 24,
    font: font,
    color: rgb(0.2, 0.2, 0.8),
  });
  
  // Description text
  const description = 'This certifies that the above named individual has successfully completed the requirements for this course and has demonstrated competency in the subject matter.';
  const lines = description.match(/.{1,80}/g) || [description];
  
  lines.forEach((line, index) => {
    page.drawText(line, {
      x: 80,
      y: height - 320 - (index * 20),
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });
  });
  
  // Date
  page.drawText(`Date: ${data.completionDate}`, {
    x: 80,
    y: 80,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  // Certificate ID
  page.drawText(`ID: ${data.certificateId}`, {
    x: 20,
    y: height - 20,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  // Hash
  page.drawText(`Hash: ${data.hash.substring(0, 32)}...`, {
    x: 300,
    y: 80,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  // Generate and embed QR code
  const verificationUrl = `${process.env.REPL_URL || 'http://localhost:5000'}/verifier?id=${data.certificateId}`;
  const qrDataUrl = await generateQRCode(verificationUrl);
  const qrImage = await pdfDoc.embedPng(qrDataUrl);
  
  page.drawImage(qrImage, {
    x: width - 150,
    y: 50,
    width: 100,
    height: 100,
  });
  
  return await pdfDoc.save();
}

// Get certificate with user and course details
export async function getCertificateWithDetails(certificateId: string) {
  const [certificate] = await db
    .select({
      certificate: certificates,
      user: users,
      course: courses,
    })
    .from(certificates)
    .innerJoin(users, eq(certificates.userId, users.id))
    .innerJoin(courses, eq(certificates.courseId, courses.id))
    .where(eq(certificates.certificateId, certificateId))
    .limit(1);
    
  return certificate;
}