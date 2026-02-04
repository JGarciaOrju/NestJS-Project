# Project Manager API

A professional REST API for project and task management built with NestJS, Prisma, and PostgreSQL.

## Features

- 🔐 JWT-based authentication and authorization
- 👥 Role-based access control (USER, ADMIN)
- 📁 Project management with team memberships
- ✅ Task management with assignment and status tracking
- 📊 Pagination and filtering
- 🛡️ Rate limiting and security headers
- 📝 Swagger API documentation
- 🧪 Unit tests with coverage
- 🐳 Docker support

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: NestJS
- **Language**: TypeScript
- **ORM**: Prisma 7
- **Database**: PostgreSQL
- **Auth**: JWT (jsonwebtoken)
- **Testing**: Jest

## Project Structure

```
src/
├── auth/           # Authentication module (register, login, JWT)
├── users/          # Users CRUD module
├── projects/       # Projects management module
├── tasks/          # Tasks management module
├── common/         # Shared utilities (filters, DTOs)
├── database/       # Prisma service and configuration
└── health/         # Health check endpoint
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd project-manager-api

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npx prisma migrate dev

# Start development server
npm run start:dev
```

### Using Docker

```bash
# Start database only (recommended for development)
docker-compose -f docker-compose.dev.yml up -d

# Or start everything (production)
docker-compose up -d
```

## API Endpoints

### Auth

- POST /auth/register - Register new user
- POST /auth/login - Login
- GET /auth/profile - Get current profile

### Users

- GET /users - List all users (Admin only)
- GET /users/me - Get own profile
- GET /users/:id - Get user by ID
- PATCH /users/:id - Update user
- DELETE /users/:id - Delete user (Admin only)

### Projects

- POST /projects - Create project
- GET /projects - List user's projects
- GET /projects/:id - Get project
- PATCH /projects/:id - Update project
- DELETE /projects/:id - Delete project
- POST /projects/:id/members - Add member
- DELETE /projects/:id/members/:userId - Remove member
- PATCH /projects/:id/members/:userId/role - Update member role

### Tasks

- POST /tasks - Create task
- GET /tasks - List user's tasks (with filters)
- GET /tasks/project/:projectId - List project tasks
- GET /tasks/:id - Get task
- PATCH /tasks/:id - Update task
- PATCH /tasks/:id/status - Update status
- PATCH /tasks/:id/assign - Assign task
- DELETE /tasks/:id - Delete task

## Available Scripts

```bash
npm run start          # Start production server
npm run start:dev      # Start development server
npm run build          # Build for production
npm run test           # Run unit tests
npm run test:cov       # Run tests with coverage
npm run prisma:studio  # Open Prisma Studio
npm run prisma:migrate # Run migrations
```

## API Documentation

Swagger documentation is available at:

```
http://localhost:3000/api/docs
```

## License

MIT
