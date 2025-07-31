import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authService } from "./services/auth";
import { pdfGenerator } from "./services/pdf-generator";
import { insertUserSchema, insertCourseSchema, insertCertificateSchema } from "@shared/schema";
import { z } from "zod";
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import csv from 'csv-parser';
import crypto from 'crypto';

const upload = multer({ dest: 'uploads/' });

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/magic-link", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      const token = await authService.createMagicLink(email);
      
      // In a real app, you'd send this via email
      // For now, we'll return it for testing
      res.json({ 
        success: true, 
        message: "Magic link created",
        token: token // Remove this in production
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create magic link" });
    }
  });

  app.post("/api/auth/verify", async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: "Token is required" });
      }
      
      const user = await authService.verifyMagicLink(token);
      if (!user) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }
      
      // In a real app, you'd set up a session here
      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: "Failed to verify token" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const isValidPassword = authService.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      if (userData.password) {
        userData.password = authService.hashPassword(userData.password);
      }
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      if (updateData.password) {
        updateData.password = authService.hashPassword(updateData.password);
      }
      const user = await storage.updateUser(id, updateData);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Course routes
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error getting courses:", error);
      res.status(500).json({ error: "Failed to get courses" });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const course = await storage.getCourse(id);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ error: "Failed to get course" });
    }
  });

  app.post("/api/courses", async (req, res) => {
    try {
      console.log("Creating course with data:", req.body);
      const courseData = {
        ...req.body,
        duration: parseInt(req.body.duration),
        certificateBackground: req.body.certificateBackground || null,
      };
      const validatedData = insertCourseSchema.parse(courseData);
      const course = await storage.createCourse(validatedData);
      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create course" });
    }
  });

  app.put("/api/courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = {
        ...req.body,
        duration: req.body.duration ? parseInt(req.body.duration) : undefined,
        certificateBackground: req.body.certificateBackground || null,
      };
      const course = await storage.updateCourse(id, updateData);
      res.json(course);
    } catch (error) {
      res.status(500).json({ error: "Failed to update course" });
    }
  });

  app.delete("/api/courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCourse(id);
      if (!deleted) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete course" });
    }
  });

  // Certificate routes
  app.get("/api/certificates", async (req, res) => {
    try {
      const certificates = await storage.getAllCertificates();
      res.json(certificates);
    } catch (error) {
      console.error("Error getting certificates:", error);
      res.status(500).json({ error: "Failed to get certificates" });
    }
  });

  app.get("/api/certificates/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const certificates = await storage.getCertificatesByUserId(userId);
      res.json(certificates);
    } catch (error) {
      console.error("Error getting user certificates:", error);
      res.status(500).json({ error: "Failed to get user certificates" });
    }
  });

  app.get("/api/verify/:certificateId", async (req, res) => {
    try {
      const certificateId = req.params.certificateId;
      const certificate = await storage.getCertificateByCertificateId(certificateId);
      if (!certificate) {
        return res.status(404).json({ error: "Certificate not found" });
      }
      res.json(certificate);
    } catch (error) {
      res.status(500).json({ error: "Failed to verify certificate" });
    }
  });

  app.post("/api/certificates", async (req, res) => {
    try {
      const certificateId = authService.generateCertificateId();
      const hashData = `${req.body.name || ''}|${req.body.course || ''}|${req.body.completionDate}|${certificateId}`;
      const hash = crypto.createHash('sha256').update(hashData).digest('hex');
      
      const certificateData = {
        ...req.body,
        certificateId,
        completionDate: new Date(req.body.completionDate),
        hash,
      };
      const validatedData = insertCertificateSchema.parse(certificateData);
      const certificate = await storage.createCertificate(validatedData);
      res.status(201).json(certificate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create certificate" });
    }
  });

  app.get("/api/certificates/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const certificate = await storage.getCertificate(id);
      if (!certificate) {
        return res.status(404).json({ error: "Certificate not found" });
      }

      const user = await storage.getUser(certificate.userId);
      const course = await storage.getCourse(certificate.courseId);
      
      if (!user || !course) {
        return res.status(404).json({ error: "Certificate data incomplete" });
      }

      // Save to Firebase when PDF is downloaded
      try {
        // Generate hash if not exists
        let certHash = certificate.hash;
        if (!certHash || certHash.startsWith('temp_hash_')) {
          const hashData = `${user.name}|${course.title}|${certificate.completionDate.toISOString().split('T')[0]}|${certificate.certificateId}`;
          certHash = crypto.createHash('sha256').update(hashData).digest('hex');
          
          // Update the database with the real hash
          await storage.updateCertificate(certificate.id, { hash: certHash });
        }

        // Generate unique Firebase ID
        const firebaseId = `FB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const firebaseCertificate = {
          id: firebaseId,
          certificateId: certificate.certificateId,
          nombre: user.name,
          curso: course.title,
          fecha: certificate.completionDate.toISOString().split('T')[0],
          hash: certHash,
          userId: certificate.userId,
          courseId: certificate.courseId,
        };

        // Update the certificate with Firebase ID
        await storage.updateCertificate(certificate.id, { firebaseId: firebaseId });

        const { saveCertificateToFirebase } = await import('./services/firebase-service.js');
        await saveCertificateToFirebase(firebaseCertificate);
        console.log(`Certificate ${certificate.certificateId} saved to Firebase on download`);
      } catch (firebaseError) {
        console.error('Failed to save to Firebase:', firebaseError);
        // Continue with PDF generation even if Firebase fails
      }

      const pdfBuffer = await pdfGenerator.generateCertificate({
        certificate,
        user,
        course,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="certificate-${certificate.certificateId}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ error: "Failed to generate certificate" });
    }
  });

  // CSV Import route
  app.post("/api/admin/import-csv", upload.single('csvFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const results: any[] = [];
      const errors: string[] = [];

      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            const imported = {
              users: 0,
              certificates: 0,
              errors: [] as string[],
            };

            for (const row of results) {
              try {
                const { name, email, course, completion_date, city } = row;
                
                if (!name || !email || !course || !completion_date) {
                  imported.errors.push(`Missing required fields in row: ${JSON.stringify(row)}`);
                  continue;
                }

                // Find or create user
                let user = await storage.getUserByEmail(email);
                if (!user) {
                  user = await storage.createUser({
                    name,
                    email,
                    role: 'graduate',
                  });
                  imported.users++;
                }

                // Find course by title
                const courses = await storage.getAllCourses();
                const foundCourse = courses.find(c => c.title.toLowerCase() === course.toLowerCase());
                if (!foundCourse) {
                  imported.errors.push(`Course not found: ${course}`);
                  continue;
                }

                // Create certificate with hash
                const certificateId = authService.generateCertificateId();
                const hashData = `${name}|${course}|${completion_date}|${certificateId}`;
                const hash = crypto.createHash('sha256').update(hashData).digest('hex');
                
                const certificate = await storage.createCertificate({
                  certificateId,
                  userId: user.id,
                  courseId: foundCourse.id,
                  completionDate: new Date(completion_date),
                  city: city || null,
                  hash,
                });
                imported.certificates++;

              } catch (error) {
                imported.errors.push(`Error processing row: ${JSON.stringify(row)} - ${error}`);
              }
            }

            // Clean up uploaded file
            if (req.file) {
              fs.unlinkSync(req.file.path);
            }

            res.json({
              success: true,
              imported,
            });
          } catch (error) {
            res.status(500).json({ error: "Failed to process CSV" });
          }
        });
    } catch (error) {
      res.status(500).json({ error: "Failed to import CSV" });
    }
  });

  // Firebase verification route
  app.get('/api/verify-firebase/:idOrHash', async (req, res) => {
    try {
      const { idOrHash } = req.params;
      
      // Try Firebase verification first
      try {
        const { verifyCertificateFromFirebase } = await import('./services/firebase-service.js');
        const firebaseCertificate = await verifyCertificateFromFirebase(idOrHash);
        
        if (firebaseCertificate) {
          return res.json({
            valid: true,
            source: 'firebase',
            certificate: firebaseCertificate
          });
        }
      } catch (firebaseError) {
        console.error('Firebase verification failed:', firebaseError);
      }

      // Fallback to database verification by hash or firebaseId
      const allCertificates = await storage.getAllCertificates();
      const certificate = allCertificates.find(cert => 
        cert.hash === idOrHash || 
        cert.firebaseId === idOrHash ||
        cert.certificateId === idOrHash
      );
      
      if (certificate) {
        return res.json({
          valid: true,
          source: 'database',
          certificate: {
            id: certificate.firebaseId || certificate.certificateId,
            certificateId: certificate.certificateId,
            nombre: certificate.user.name,
            curso: certificate.course.title,
            fecha: certificate.completionDate.toISOString().split('T')[0],
            hash: certificate.hash,
            firebaseId: certificate.firebaseId,
          }
        });
      }

      res.status(404).json({ valid: false, error: "Certificate not found" });
    } catch (error) {
      console.error('Firebase verification error:', error);
      res.status(500).json({ error: "Verification failed" });
    }
  });

  // Statistics routes
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const userStats = await storage.getUserStats();
      const courseStats = await storage.getCourseStats();
      
      res.json({
        totalUsers: userStats.totalUsers,
        activeUsers: userStats.activeUsers,
        totalCertificates: userStats.totalCertificates,
        totalCourses: courseStats.totalCourses,
        totalEnrollments: courseStats.totalEnrollments,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
