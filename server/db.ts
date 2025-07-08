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
        thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop",
      },
      {
        title: "Machine Learning Fundamentals",
        description: "Core concepts and practical applications of ML",
        duration: 24,
        icon: "fas fa-brain",
        thumbnail: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&h=200&fit=crop",
      },
      {
        title: "UX Design Principles",
        description: "User-centered design methodologies and best practices",
        duration: 8,
        icon: "fas fa-palette",
        thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=200&fit=crop",
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