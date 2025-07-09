import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password"),
  role: text("role").notNull().default("graduate"), // graduate, admin
  createdAt: timestamp("created_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: integer("duration").notNull(), // in hours
  icon: text("icon").notNull().default("fas fa-book"),
  thumbnail: text("thumbnail"),
  certificateBackground: text("certificate_background"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  certificateId: varchar("certificate_id", { length: 20 }).notNull().unique(),
  userId: integer("user_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  issuedAt: timestamp("issued_at").defaultNow(),
  completionDate: timestamp("completion_date").notNull(),
  pdfPath: text("pdf_path"),
  city: text("city"),
});

export const magicLinks = pgTable("magic_links", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  issuedAt: true,
});

export const insertMagicLinkSchema = createInsertSchema(magicLinks).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type MagicLink = typeof magicLinks.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type InsertMagicLink = z.infer<typeof insertMagicLinkSchema>;

// Additional types for API responses
export type CertificateWithDetails = Certificate & {
  user: User;
  course: Course;
};

export type UserWithCertificates = User & {
  certificates: CertificateWithDetails[];
};
