# AdFlow Pro - Meta Advertising Campaign Management Platform

## Overview

AdFlow Pro is a comprehensive web application for managing Meta (Facebook/Instagram) advertising campaigns. The platform provides a unified dashboard for creating, monitoring, and optimizing social media advertising campaigns with features including campaign creation wizards, analytics dashboards, template management, and real-time performance metrics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and component-based development
- **Routing**: Wouter for lightweight client-side routing with minimal bundle size
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Radix UI primitives with shadcn/ui components for accessible, customizable design system
- **Styling**: Tailwind CSS with custom design tokens for Meta platform branding (Facebook blue, Instagram pink)
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API server
- **Database ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Session Management**: Connect-pg-simple for PostgreSQL-backed session storage
- **Development**: Custom Vite middleware integration for seamless full-stack development
- **API Design**: RESTful endpoints with consistent error handling and logging middleware

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless database for scalability
- **Schema Management**: Drizzle Kit for database migrations and schema synchronization
- **Development Storage**: In-memory storage implementation for rapid prototyping and testing
- **Session Storage**: PostgreSQL-backed sessions for user authentication state

### Key Features Architecture
- **Campaign Management**: Multi-step wizard for campaign creation with audience targeting and ad creative management
- **Payment Processing**: Stripe integration for secure campaign funding with real-time payment status tracking
- **Analytics Dashboard**: Real-time metrics visualization with Recharts for campaign performance tracking
- **Template System**: Pre-built ad templates categorized by platform (Facebook, Instagram, both) and campaign objectives
- **AI-Powered Tools**: OpenAI-powered ad copy generation and optimization for improved campaign performance
- **Platform Integration**: Designed for Meta advertising platforms with dedicated Facebook and Instagram campaign support
- **Real-Time Optimization**: AI-powered campaign performance analysis with automated optimization recommendations
- **Facebook Marketing API Integration**: Direct campaign publishing to Facebook Ads Manager with OAuth authentication
- **Campaign Optimization Dashboard**: Comprehensive optimization insights with performance scoring and actionable recommendations

### Authentication and Authorization
- **User Management**: User registration and authentication system with password-based authentication
- **Session Handling**: Secure session management with HTTP-only cookies
- **Demo Mode**: Mock user implementation for development and demonstration purposes

## External Dependencies

### API Services
- **Facebook Marketing API**: Direct campaign publishing with Facebook App ID and App Secret for OAuth authentication
- **OpenAI API**: AI-powered ad copy generation and optimization recommendations
- **Stripe API**: Payment processing for campaign funding with public and secret key authentication

### Database Services
- **Neon Database**: Serverless PostgreSQL database for production data storage
- **DATABASE_URL**: Environment variable for database connection string configuration

### UI and Component Libraries
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives including dialogs, dropdowns, navigation components
- **Recharts**: React charting library for analytics and performance visualization
- **Lucide React**: Icon library providing consistent iconography throughout the application
- **Embla Carousel**: Touch-friendly carousel component for template browsing

### Development and Build Tools
- **Replit Integration**: Custom Vite plugins for Replit development environment including runtime error overlay and cartographer
- **TypeScript**: Full TypeScript configuration for type safety across client, server, and shared code
- **ESBuild**: Fast bundling for server-side code in production builds

### Form and Validation
- **Zod**: Schema validation library for runtime type checking and form validation
- **React Hook Form**: Performance-optimized form library with minimal re-renders
- **Hookform Resolvers**: Integration between React Hook Form and Zod validation schemas

### Styling and Design
- **Tailwind CSS**: Utility-first CSS framework with custom design system configuration
- **Class Variance Authority**: Type-safe utility for creating component variants
- **CLSX**: Utility for constructing className strings conditionally