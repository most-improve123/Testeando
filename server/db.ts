import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, courses, certificates, magicLinks } from '@shared/schema';

// Create the postgres client
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const client = postgres(connectionString);
export const db = drizzle(client);

// Initialize database with sample data
export async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Check if we already have sample data
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log('Database already initialized');
      return;
    }

    // Create sample admin user
    const [adminUser] = await db.insert(users).values({
      email: "admin@wespark.io",
      name: "Admin User",
      password: "admin123",
      role: "admin",
    }).returning();

    // Create sample courses
    const sampleCourses = await db.insert(courses).values([
      {
        title: "AI Design Sprint Bootcamp",
        description: "Advanced AI design methodologies and sprint techniques",
        duration: 16,
        icon: "fas fa-code",
      },
      {
        title: "Machine Learning Fundamentals",
        description: "Core concepts and practical applications of ML",
        duration: 24,
        icon: "fas fa-brain",
      },
      {
        title: "UX Design Principles",
        description: "User-centered design methodologies and best practices",
        duration: 8,
        icon: "fas fa-palette",
      },
    ]).returning();

    // Create a sample graduate user
    const [graduateUser] = await db.insert(users).values({
      email: "john.doe@example.com",
      name: "John Doe",
      role: "graduate",
    }).returning();

    // Create sample certificates for the graduate
    const sampleCertificates = await db.insert(certificates).values([
      {
        certificateId: "WS-2025-ABC123",
        userId: graduateUser.id,
        courseId: sampleCourses[0].id,
        completionDate: new Date('2024-12-15'),
      },
      {
        certificateId: "WS-2025-DEF456",
        userId: graduateUser.id,
        courseId: sampleCourses[1].id,
        completionDate: new Date('2024-11-20'),
      },
    ]).returning();

    console.log(`Database initialized with ${sampleCourses.length} courses, ${sampleCertificates.length} certificates, and sample users`);
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}