# Overview

This is a full-stack web application built with React, TypeScript, and Express.js that implements a task management system. The application follows a modern monorepo structure with a React frontend, Express backend, and PostgreSQL database using Drizzle ORM for data management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite with custom configuration for development and production
- **Component Library**: Radix UI primitives with custom styling via shadcn/ui

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Build Tool**: ESBuild for production bundling
- **Development**: tsx for TypeScript execution in development
- **API Style**: RESTful API with JSON responses

### Data Storage
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Validation**: Zod for runtime type validation integrated with Drizzle

## Key Components

### Database Schema
The application uses a simple task management schema:
- **Tasks Table**: Contains id (serial primary key), text (required), and completed (boolean, default false)
- **Type Safety**: Full TypeScript integration with Drizzle for compile-time type checking
- **Validation**: Zod schemas for input validation with custom error messages

### API Endpoints
- `GET /api/tasks` - Retrieve all tasks
- `POST /api/tasks` - Create a new task with validation
- `PUT /api/tasks/:id` - Update an existing task
- Additional CRUD operations supported by the storage layer

### Frontend Components
- **Task Management UI**: Complete CRUD interface with filtering (all/active/completed)
- **Form Handling**: Input validation and error handling
- **Toast Notifications**: User feedback for actions
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Storage Layer
- **Abstraction**: IStorage interface for flexible data persistence
- **Current Implementation**: In-memory storage (MemStorage class)
- **Database Ready**: Drizzle configuration prepared for PostgreSQL integration

## Data Flow

1. **Frontend**: User interactions trigger React Query mutations
2. **API Layer**: Express routes handle HTTP requests with validation
3. **Storage Layer**: Abstract storage interface processes data operations
4. **Database**: PostgreSQL with Drizzle ORM for persistence (when connected)
5. **Response**: JSON responses with proper error handling and status codes

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL driver for Neon database
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe database operations
- **zod**: Runtime type validation and schema definition

### UI Dependencies
- **@radix-ui/***: Headless UI components for accessibility
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Utility for component variants

### Development Dependencies
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundler for production builds

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR (Hot Module Replacement)
- **Backend**: tsx for TypeScript execution with auto-restart
- **Database**: Environment variable configuration for DATABASE_URL

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves frontend assets in production
- **Environment**: NODE_ENV-based configuration switching

### Configuration Notes
- Database migrations handled via `drizzle-kit push`
- Type checking with `tsc` in CI/CD pipelines
- Replit-specific development enhancements included
- Environment variables required: DATABASE_URL for PostgreSQL connection

The application is designed to be easily deployable to platforms like Replit, Vercel, or any Node.js hosting service with PostgreSQL support.
