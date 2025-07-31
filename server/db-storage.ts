import { eq, and, count } from 'drizzle-orm';
import { db } from './db';
import { users, courses, certificates, magicLinks, type User, type Course, type Certificate, type MagicLink, type InsertUser, type InsertCourse, type InsertCertificate, type InsertMagicLink, type CertificateWithDetails } from '@shared/schema';
import { IStorage } from './storage';

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const [result] = await db.insert(users).values(user).returning();
    return result;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const [result] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    if (!result) throw new Error('User not found');
    return result;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  // Course operations
  async getCourse(id: number): Promise<Course | undefined> {
    const result = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
    return result[0];
  }

  async getAllCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [result] = await db.insert(courses).values(course).returning();
    return result;
  }

  async updateCourse(id: number, courseData: Partial<InsertCourse>): Promise<Course> {
    const [result] = await db.update(courses).set(courseData).where(eq(courses.id, id)).returning();
    if (!result) throw new Error('Course not found');
    return result;
  }

  async deleteCourse(id: number): Promise<boolean> {
    const result = await db.delete(courses).where(eq(courses.id, id));
    return result.rowCount > 0;
  }

  // Certificate operations
  async getCertificate(id: number): Promise<Certificate | undefined> {
    const result = await db.select().from(certificates).where(eq(certificates.id, id)).limit(1);
    return result[0];
  }

  async getCertificateByCertificateId(certificateId: string): Promise<CertificateWithDetails | undefined> {
    const result = await db
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

    if (result.length === 0) return undefined;

    const { certificate, user, course } = result[0];
    return {
      ...certificate,
      user,
      course,
    };
  }

  async getCertificatesByUserId(userId: number): Promise<CertificateWithDetails[]> {
    const result = await db
      .select({
        certificate: certificates,
        user: users,
        course: courses,
      })
      .from(certificates)
      .innerJoin(users, eq(certificates.userId, users.id))
      .innerJoin(courses, eq(certificates.courseId, courses.id))
      .where(eq(certificates.userId, userId));

    return result.map(({ certificate, user, course }) => ({
      ...certificate,
      user,
      course,
    }));
  }

  async getAllCertificates(): Promise<CertificateWithDetails[]> {
    const result = await db
      .select({
        certificate: certificates,
        user: users,
        course: courses,
      })
      .from(certificates)
      .innerJoin(users, eq(certificates.userId, users.id))
      .innerJoin(courses, eq(certificates.courseId, courses.id));

    return result.map(({ certificate, user, course }) => ({
      ...certificate,
      user,
      course,
    }));
  }

  async createCertificate(certificate: InsertCertificate): Promise<Certificate> {
    const [result] = await db.insert(certificates).values(certificate).returning();
    return result;
  }

  async updateCertificate(id: number, certificateData: Partial<InsertCertificate>): Promise<Certificate> {
    const [result] = await db.update(certificates).set(certificateData).where(eq(certificates.id, id)).returning();
    if (!result) throw new Error('Certificate not found');
    return result;
  }

  async updateCertificateHash(id: number, hash: string): Promise<boolean> {
    const result = await db.update(certificates).set({ hash }).where(eq(certificates.id, id));
    return result.rowCount > 0;
  }

  async deleteCertificate(id: number): Promise<boolean> {
    const result = await db.delete(certificates).where(eq(certificates.id, id));
    return result.rowCount > 0;
  }

  // Magic Link operations
  async createMagicLink(magicLink: InsertMagicLink): Promise<MagicLink> {
    const [result] = await db.insert(magicLinks).values(magicLink).returning();
    return result;
  }

  async getMagicLink(token: string): Promise<MagicLink | undefined> {
    const result = await db.select().from(magicLinks).where(eq(magicLinks.token, token)).limit(1);
    return result[0];
  }

  async useMagicLink(token: string): Promise<boolean> {
    const result = await db.update(magicLinks).set({ used: true }).where(eq(magicLinks.token, token));
    return result.rowCount > 0;
  }

  async cleanExpiredMagicLinks(): Promise<void> {
    await db.delete(magicLinks).where(eq(magicLinks.used, true));
  }

  // Statistics
  async getUserStats(): Promise<{ totalUsers: number; activeUsers: number; totalCertificates: number; }> {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [graduateCount] = await db.select({ count: count() }).from(users).where(eq(users.role, 'graduate'));
    const [certificateCount] = await db.select({ count: count() }).from(certificates);
    
    return {
      totalUsers: userCount?.count || 0,
      activeUsers: graduateCount?.count || 0,
      totalCertificates: certificateCount?.count || 0,
    };
  }

  async getCourseStats(): Promise<{ totalCourses: number; totalEnrollments: number; }> {
    const [courseCount] = await db.select({ count: count() }).from(courses);
    const [enrollmentCount] = await db.select({ count: count() }).from(certificates);
    
    return {
      totalCourses: courseCount?.count || 0,
      totalEnrollments: enrollmentCount?.count || 0,
    };
  }
}