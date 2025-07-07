# WeSpark Certificate Platform

## Overview

WeSpark is a certificate management platform built with a modern full-stack architecture. The application serves three main user types: graduates who can view and download their certificates, verifiers who can validate certificates, and administrators who manage the entire system. The platform uses a React frontend with Express.js backend, PostgreSQL database via Drizzle ORM, and includes features like magic link authentication, PDF certificate generation, and CSV bulk import capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Magic link system with token-based verification
- **File Processing**: CSV parsing with multer for file uploads
- **PDF Generation**: PDF-lib for certificate generation with QR codes

### Database Schema
- **Users**: Email-based authentication with role-based access (graduate/admin)
- **Courses**: Course information with titles, descriptions, and duration
- **Certificates**: Links users to courses with unique certificate IDs
- **Magic Links**: Temporary authentication tokens with expiration

## Key Components

### Authentication System
- **Magic Links**: Passwordless authentication via email tokens
- **Session Management**: Token-based authentication with expiration handling
- **Role-Based Access**: Different permissions for graduates, verifiers, and admins

### Certificate Management
- **PDF Generation**: Dynamic certificate creation with QR codes for verification
- **Unique Identifiers**: Each certificate has a unique ID for verification
- **LinkedIn Integration**: Direct sharing capability to LinkedIn profiles

### Data Processing
- **CSV Import**: Bulk import of users and certificates via CSV files
- **File Upload**: Multer middleware for handling file uploads
- **Data Validation**: Zod schemas for input validation and type safety

### User Interface
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Component Library**: Comprehensive UI components from Shadcn/ui
- **Accessibility**: WCAG compliant components with proper ARIA attributes

## Data Flow

1. **Authentication Flow**:
   - User requests magic link via email
   - System generates temporary token and stores in database
   - User clicks link to verify token and establish session
   - Session maintained for subsequent requests

2. **Certificate Generation**:
   - Admin creates courses and assigns certificates to users
   - System generates unique certificate IDs
   - PDF certificates created on-demand with QR codes
   - Certificates stored with metadata linking users to courses

3. **Verification Process**:
   - Public verification endpoint accepts certificate ID
   - System validates certificate existence and returns details
   - QR codes on certificates link to verification page

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: TypeScript ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components
- **pdf-lib**: PDF generation and manipulation
- **qrcode**: QR code generation for certificates

### Development Tools
- **TypeScript**: Type safety across the entire stack
- **Vite**: Fast development server and build tool
- **Tailwind CSS**: Utility-first CSS framework
- **ESLint/Prettier**: Code formatting and linting

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured for Replit development environment
- **Hot Reload**: Vite HMR for fast development iteration
- **Environment Variables**: Database URL and other secrets via .env

### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: ESBuild bundles server code for production
- **Database**: Drizzle migrations for schema management

### Database Management
- **Schema**: Centralized in shared/schema.ts
- **Migrations**: Automated via Drizzle Kit
- **Connection**: Serverless PostgreSQL via Neon

## Changelog
- July 07, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.