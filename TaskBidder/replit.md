# Trade My Time - Task Marketplace Platform

## Overview

Trade My Time is a full-stack task marketplace application that connects customers who need help with everyday tasks to local workers who can complete them. The platform enables users to post tasks (like grocery shopping, document pickup, queue standing, delivery, and cleaning), while workers can browse and bid on these tasks. The system includes secure payment processing through Stripe, real-time communication via WebSockets, and a comprehensive bidding system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent UI patterns
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **UI Components**: Radix UI primitives wrapped in custom components for accessibility

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Real-time Communication**: WebSocket server for live bidding updates and notifications
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints with consistent error handling and logging middleware

### Database Design
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **Schema**: Comprehensive relational design including users, tasks, bids, payments, messages, and sessions tables
- **Enums**: Type-safe enums for task categories, statuses, bid statuses, and payment statuses
- **Migrations**: Drizzle Kit for database schema management and migrations

### Authentication & Authorization
- **Provider**: Replit Auth with OpenID Connect (OIDC)
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **Security**: Passport.js integration with custom middleware for route protection
- **User Management**: Profile management with Stripe customer integration

### Payment Processing
- **Provider**: Stripe for secure payment handling
- **Architecture**: Escrow-style payments held until task completion
- **Features**: Customer creation, subscription management, and payment intent processing
- **Frontend Integration**: Stripe Elements for secure payment form handling

### File Structure
- **Monorepo Structure**: Client, server, and shared code in separate directories
- **Shared Types**: Common TypeScript types and schemas shared between frontend and backend
- **Build Process**: Separate build processes for client (Vite) and server (esbuild)
- **Development**: Hot reloading for both client and server code

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Stripe**: Payment processing, customer management, and subscription handling
- **Replit Auth**: Authentication provider with OIDC integration

### Frontend Libraries
- **UI Framework**: React 18 with TypeScript support
- **Component Library**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with custom design system variables
- **State Management**: TanStack Query for server state and caching
- **Form Handling**: React Hook Form with Hookform Resolvers for Zod integration
- **Date Handling**: date-fns for date formatting and manipulation

### Backend Libraries
- **Web Framework**: Express.js with middleware for CORS, sessions, and logging
- **Database**: Drizzle ORM with Neon serverless PostgreSQL driver
- **Authentication**: Passport.js with OpenID Client for OIDC
- **WebSockets**: ws library for real-time bidding and notifications
- **Validation**: Zod for runtime type checking and validation
- **Session Storage**: connect-pg-simple for PostgreSQL session persistence

### Development Tools
- **Build Tools**: Vite for client bundling, esbuild for server bundling
- **TypeScript**: Strict type checking across the entire codebase
- **Development**: tsx for TypeScript execution and hot reloading
- **Replit Integration**: Custom Vite plugins for Replit environment optimization