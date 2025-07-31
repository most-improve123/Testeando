import { users, courses, certificates, magicLinks, type User, type Course, type Certificate, type MagicLink, type InsertUser, type InsertCourse, type InsertCertificate, type InsertMagicLink, type CertificateWithDetails } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<boolean>;

  // Course operations
  getCourse(id: number): Promise<Course | undefined>;
  getAllCourses(): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: number): Promise<boolean>;

  // Certificate operations
  getCertificate(id: number): Promise<Certificate | undefined>;
  getCertificateByCertificateId(certificateId: string): Promise<CertificateWithDetails | undefined>;
  getCertificatesByUserId(userId: number): Promise<CertificateWithDetails[]>;
  getAllCertificates(): Promise<CertificateWithDetails[]>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  updateCertificate(id: number, certificate: Partial<InsertCertificate>): Promise<Certificate>;
  updateCertificateHash(id: number, hash: string): Promise<boolean>;
  deleteCertificate(id: number): Promise<boolean>;

  // Magic Link operations
  createMagicLink(magicLink: InsertMagicLink): Promise<MagicLink>;
  getMagicLink(token: string): Promise<MagicLink | undefined>;
  useMagicLink(token: string): Promise<boolean>;
  cleanExpiredMagicLinks(): Promise<void>;

  // Statistics
  getUserStats(): Promise<{ totalUsers: number; activeUsers: number; totalCertificates: number; }>;
  getCourseStats(): Promise<{ totalCourses: number; totalEnrollments: number; }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private courses: Map<number, Course> = new Map();
  private certificates: Map<number, Certificate> = new Map();
  private magicLinks: Map<string, MagicLink> = new Map();
  private currentUserId = 1;
  private currentCourseId = 1;
  private currentCertificateId = 1;
  private currentMagicLinkId = 1;

  constructor() {
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample admin user
    const adminUser: User = {
      id: this.currentUserId++,
      email: "admin@wespark.io",
      name: "Admin User",
      password: "admin123",
      role: "admin",
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Create sample courses
    const courses: Course[] = [
      {
        id: this.currentCourseId++,
        title: "AI Design Sprint Bootcamp",
        description: "Advanced AI design methodologies and sprint techniques",
        duration: 16,
        icon: "fas fa-code",
        thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop",
        certificateBackground: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=842&h=595&fit=crop",
        createdAt: new Date(),
      },
      {
        id: this.currentCourseId++,
        title: "Machine Learning Fundamentals",
        description: "Core concepts and practical applications of ML",
        duration: 24,
        icon: "fas fa-brain",
        thumbnail: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&h=200&fit=crop",
        certificateBackground: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=842&h=595&fit=crop",
        createdAt: new Date(),
      },
      {
        id: this.currentCourseId++,
        title: "UX Design Principles",
        description: "User-centered design methodologies and best practices",
        duration: 8,
        icon: "fas fa-palette",
        thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=200&fit=crop",
        certificateBackground: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=842&h=595&fit=crop",
        createdAt: new Date(),
      },
    ];

    courses.forEach(course => {
      this.courses.set(course.id, course);
    });

    // Create sample certificate
    const sampleCertificate: Certificate = {
      id: this.currentCertificateId++,
      certificateId: "WSP-2025-001",
      userId: adminUser.id,
      courseId: 1,
      completionDate: new Date('2025-01-15'),
      city: "Berlin",
      issuedAt: new Date(),
      pdfPath: null,
    };
    this.certificates.set(sampleCertificate.id, sampleCertificate);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      createdAt: new Date(),
      role: insertUser.role || 'graduate',
      password: insertUser.password || null,
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Course operations
  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const course: Course = {
      ...insertCourse,
      id: this.currentCourseId++,
      createdAt: new Date(),
      icon: insertCourse.icon || 'fas fa-book',
      thumbnail: insertCourse.thumbnail || null,
      certificateBackground: insertCourse.certificateBackground || null,
    };
    this.courses.set(course.id, course);
    return course;
  }

  async updateCourse(id: number, updateData: Partial<InsertCourse>): Promise<Course> {
    const course = this.courses.get(id);
    if (!course) throw new Error('Course not found');
    
    const updatedCourse = { ...course, ...updateData };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<boolean> {
    return this.courses.delete(id);
  }

  // Certificate operations
  async getCertificate(id: number): Promise<Certificate | undefined> {
    return this.certificates.get(id);
  }

  async getCertificateByCertificateId(certificateId: string): Promise<CertificateWithDetails | undefined> {
    const certificate = Array.from(this.certificates.values()).find(cert => cert.certificateId === certificateId);
    if (!certificate) return undefined;

    const user = this.users.get(certificate.userId);
    const course = this.courses.get(certificate.courseId);
    
    if (!user || !course) return undefined;

    return {
      ...certificate,
      user,
      course,
    };
  }

  async getCertificatesByUserId(userId: number): Promise<CertificateWithDetails[]> {
    const userCertificates = Array.from(this.certificates.values())
      .filter(cert => cert.userId === userId);

    const result: CertificateWithDetails[] = [];
    for (const cert of userCertificates) {
      const user = this.users.get(cert.userId);
      const course = this.courses.get(cert.courseId);
      if (user && course) {
        result.push({
          ...cert,
          user,
          course,
        });
      }
    }
    return result;
  }

  async getAllCertificates(): Promise<CertificateWithDetails[]> {
    const result: CertificateWithDetails[] = [];
    for (const cert of Array.from(this.certificates.values())) {
      const user = this.users.get(cert.userId);
      const course = this.courses.get(cert.courseId);
      if (user && course) {
        result.push({
          ...cert,
          user,
          course,
        });
      }
    }
    return result;
  }

  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    const certificate: Certificate = {
      ...insertCertificate,
      id: this.currentCertificateId++,
      issuedAt: new Date(),
      pdfPath: insertCertificate.pdfPath || null,
    };
    this.certificates.set(certificate.id, certificate);
    return certificate;
  }

  async updateCertificate(id: number, updateData: Partial<InsertCertificate>): Promise<Certificate> {
    const certificate = this.certificates.get(id);
    if (!certificate) throw new Error('Certificate not found');
    
    const updatedCertificate = { ...certificate, ...updateData };
    this.certificates.set(id, updatedCertificate);
    return updatedCertificate;
  }

  async deleteCertificate(id: number): Promise<boolean> {
    return this.certificates.delete(id);
  }

  // Magic Link operations
  async createMagicLink(insertMagicLink: InsertMagicLink): Promise<MagicLink> {
    const magicLink: MagicLink = {
      ...insertMagicLink,
      id: this.currentMagicLinkId++,
      createdAt: new Date(),
      used: insertMagicLink.used || false,
    };
    this.magicLinks.set(magicLink.token, magicLink);
    return magicLink;
  }

  async getMagicLink(token: string): Promise<MagicLink | undefined> {
    return this.magicLinks.get(token);
  }

  async useMagicLink(token: string): Promise<boolean> {
    const magicLink = this.magicLinks.get(token);
    if (!magicLink) return false;
    
    magicLink.used = true;
    this.magicLinks.set(token, magicLink);
    return true;
  }

  async cleanExpiredMagicLinks(): Promise<void> {
    const now = new Date();
    for (const [token, magicLink] of Array.from(this.magicLinks.entries())) {
      if (magicLink.expiresAt < now) {
        this.magicLinks.delete(token);
      }
    }
  }

  // Statistics
  async getUserStats(): Promise<{ totalUsers: number; activeUsers: number; totalCertificates: number; }> {
    const totalUsers = this.users.size;
    const activeUsers = Array.from(this.users.values()).filter(user => user.role === 'graduate').length;
    const totalCertificates = this.certificates.size;
    
    return {
      totalUsers,
      activeUsers,
      totalCertificates,
    };
  }

  async getCourseStats(): Promise<{ totalCourses: number; totalEnrollments: number; }> {
    const totalCourses = this.courses.size;
    const totalEnrollments = this.certificates.size;
    
    return {
      totalCourses,
      totalEnrollments,
    };
  }
}

import { DatabaseStorage } from './db-storage';

// Use DatabaseStorage for production, MemStorage for development/testing
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
