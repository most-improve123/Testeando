import { apiRequest } from './queryClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface MagicLinkRequest {
  email: string;
}

export interface MagicLinkVerification {
  token: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'graduate' | 'admin';
  createdAt: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  duration: number;
  icon: string;
  createdAt: string;
}

export interface Certificate {
  id: number;
  certificateId: string;
  userId: number;
  courseId: number;
  issuedAt: string;
  completionDate: string;
  pdfPath?: string;
}

export interface CertificateWithDetails extends Certificate {
  user: User;
  course: Course;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalCertificates: number;
  totalCourses: number;
  totalEnrollments: number;
}

export const api = {
  // Authentication
  async login(credentials: LoginCredentials): Promise<{ user: User }> {
    const res = await apiRequest('POST', '/api/auth/login', credentials);
    return res.json();
  },

  async createMagicLink(data: MagicLinkRequest): Promise<{ success: boolean; token: string }> {
    const res = await apiRequest('POST', '/api/auth/magic-link', data);
    return res.json();
  },

  async verifyMagicLink(data: MagicLinkVerification): Promise<{ user: User }> {
    const res = await apiRequest('POST', '/api/auth/verify', data);
    return res.json();
  },

  // Users
  async getUsers(): Promise<User[]> {
    const res = await apiRequest('GET', '/api/users');
    return res.json();
  },

  async getUser(id: number): Promise<User> {
    const res = await apiRequest('GET', `/api/users/${id}`);
    return res.json();
  },

  async createUser(userData: Partial<User>): Promise<User> {
    const res = await apiRequest('POST', '/api/users', userData);
    return res.json();
  },

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const res = await apiRequest('PUT', `/api/users/${id}`, userData);
    return res.json();
  },

  async deleteUser(id: number): Promise<{ success: boolean }> {
    const res = await apiRequest('DELETE', `/api/users/${id}`);
    return res.json();
  },

  // Courses
  async getCourses(): Promise<Course[]> {
    const res = await apiRequest('GET', '/api/courses');
    return res.json();
  },

  async getCourse(id: number): Promise<Course> {
    const res = await apiRequest('GET', `/api/courses/${id}`);
    return res.json();
  },

  async createCourse(courseData: Partial<Course>): Promise<Course> {
    const res = await apiRequest('POST', '/api/courses', courseData);
    return res.json();
  },

  async updateCourse(id: number, courseData: Partial<Course>): Promise<Course> {
    const res = await apiRequest('PUT', `/api/courses/${id}`, courseData);
    return res.json();
  },

  async deleteCourse(id: number): Promise<{ success: boolean }> {
    const res = await apiRequest('DELETE', `/api/courses/${id}`);
    return res.json();
  },

  // Certificates
  async getCertificates(): Promise<CertificateWithDetails[]> {
    const res = await apiRequest('GET', '/api/certificates');
    return res.json();
  },

  async getUserCertificates(userId: number): Promise<CertificateWithDetails[]> {
    const res = await apiRequest('GET', `/api/certificates/user/${userId}`);
    return res.json();
  },

  async createCertificate(certificateData: Partial<Certificate>): Promise<Certificate> {
    const res = await apiRequest('POST', '/api/certificates', certificateData);
    return res.json();
  },

  async verifyCertificate(certificateId: string): Promise<CertificateWithDetails> {
    const res = await apiRequest('GET', `/api/verify/${certificateId}`);
    return res.json();
  },

  async downloadCertificate(certificateId: number): Promise<Blob> {
    const res = await apiRequest('GET', `/api/certificates/${certificateId}/download`);
    return res.blob();
  },

  // Admin
  async getAdminStats(): Promise<AdminStats> {
    const res = await apiRequest('GET', '/api/admin/stats');
    return res.json();
  },

  async importCsv(file: File): Promise<{ success: boolean; imported: any }> {
    const formData = new FormData();
    formData.append('csvFile', file);
    
    const res = await fetch('/api/admin/import-csv', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    if (!res.ok) {
      throw new Error('Failed to import CSV');
    }
    
    return res.json();
  },

  // LinkedIn integration
  generateLinkedInUrl(certificate: CertificateWithDetails): string {
    const baseUrl = 'https://www.linkedin.com/profile/add';
    const params = new URLSearchParams({
      startTask: 'CERTIFICATION_NAME',
      name: certificate.course.title,
      organizationName: 'WeSpark',
      issueYear: new Date(certificate.completionDate).getFullYear().toString(),
      issueMonth: (new Date(certificate.completionDate).getMonth() + 1).toString(),
      certUrl: `${window.location.origin}/verify/${certificate.certificateId}`,
      certId: certificate.certificateId,
    });
    
    return `${baseUrl}?${params.toString()}`;
  },
};
