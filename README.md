# Event Management API

Backend API for managing events and user registrations built with **NestJS**, **TypeScript**, **TypeORM**, and **SQLite**.

This project was developed as part of the **DIGIT Technical Assessment** to demonstrate backend architecture, API design, and business rule implementation.

---

# Tech Stack

- **Framework:** NestJS
- **Language:** TypeScript
- **ORM:** TypeORM
- **Database:** SQLite
- **Authentication:** JWT
- **API Testing:** Postman

---

# Project Architecture

## Module-Based Structure

The application follows a **modular architecture** based on NestJS best practices.

The codebase is organized into independent modules to ensure **separation of concerns**, maintainability, and scalability.

```
src
 ├── config
 │    └── database.config.ts
 │
 ├── modules
 │    ├── auth
 │    │    ├── dto
 │    │    ├── guards
 │    │    ├── strategies
 │    │    ├── auth.controller.ts
 │    │    └── auth.service.ts
 │
 │    ├── users
 │    │    ├── entities
 │    │    └── users.service.ts
 │
 │    ├── events
 │    │    ├── dto
 │    │    ├── entities
 │    │    ├── enums
 │    │    ├── events.controller.ts
 │    │    └── events.service.ts
 │
 │    ├── registrations
 │    │    ├── entities
 │    │    ├── enums
 │    │    ├── registrations.controller.ts
 │    │    └── registrations.service.ts
 │
 │    └── audit
 │         ├── entities
 │         ├── audit.controller.ts
 │         └── audit.interceptor.ts
```

---

# Key Features Implemented

### Core Features

- Event creation and management (Admin)
- Retrieve all events
- Retrieve upcoming events
- Retrieve event details
- Event registration workflow

Registration lifecycle:

```
Pending → Approved
```

- Retrieve event attendees

---

# Business Rules Enforcement

The following business rules are enforced at both **API level and database level**.

### Event Scheduling Conflict Prevention

Two events cannot be scheduled at the same date and time.

### Duplicate Registration Prevention

A user can register **only once per event**.

### Capacity Management

Registrations cannot exceed the defined `max_attendees`.

### Past Event Protection

Users cannot register for events that have already occurred.

---

# Optional Enhancements Implemented

### Authentication

JWT-based authentication for securing API endpoints.

### Role-Based Access Control (RBAC)

Administrative endpoints are protected so that only **ADMIN users** can perform management operations.

### Audit Logging

All administrative operations (`POST`, `PATCH`, `DELETE`) are logged automatically using a **global NestJS interceptor**.

The audit log stores:

- Admin ID
- Operation performed
- Target entity
- Entity ID
- Timestamp

---

# Validation

All incoming requests are validated using **NestJS ValidationPipe**.

This ensures:

- Required fields are present
- Data types are correct
- Invalid requests are rejected before reaching business logic

---

# Database Design

The database schema is provided in:

```
schema.sql
```

The schema demonstrates database design practices including:

### ENUM Types

- `user_role`
- `event_type`
- `registration_status`

### Tables

- `users`
- `events`
- `registrations`
- `audit_logs`

### Constraints

- Unique email for users
- Prevent duplicate registrations per event
- Check constraint for `max_attendees`
- Foreign key relationships between tables

### Business Rules at Database Level

Unique index preventing multiple events at the same time:

```
UNIQUE INDEX unique_event_date
```

Prevent duplicate event registrations:

```
UNIQUE INDEX unique_user_event
```

### Performance Indexes

Indexes are added to improve query performance:

- events by date
- registrations by event
- registrations by user

### Database View

A database view is included to compute approved attendee counts:

```
event_approved_counts
```

---

# API Endpoints

## Authentication

Register

```
POST /auth/register
```

Login

```
POST /auth/login
```

---

## Events

Create event

```
POST /events
```

Get all events

```
GET /events
```

Get upcoming events

```
GET /events/upcoming
```

Get event details

```
GET /events/:id
```

Update event

```
PATCH /events/:id
```

Delete event

```
DELETE /events/:id
```

---

## Registrations

Register for event

```
POST /registrations/:eventId
```

Approve registration

```
PATCH /registrations/:id/approve
```

Get event attendees

```
GET /registrations/event/:eventId
```

---

## Audit Logs (Admin only)

Retrieve administrative logs

```
GET /audit-logs
```

---

# Setup Instructions

## Install dependencies

```
npm install
```

---

# Environment Variables

Create a `.env` file in the project root.

Example configuration:

```
JWT_SECRET=supersecretkey

# SQLite database file path (relative to project root)
SQLITE_DB_PATH=./data/database.sqlite

# Seed admin user (run `npm run seed`)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User
ADMIN_DOB=1990-01-01
ADMIN_GENDER=OTHER
```

---

# Seeding Data

## Seed Admin User

Run the seed script to create an admin user (must be run after setting the env vars above):

```
npm run seed
```

## Seed Sample Events + Audit Logs

After the admin user exists, generate 20 sample events with audit logs:

```
npm run seed:events
```

---

# Database Setup

The application uses an embedded SQLite database file by default.

The database file will be created automatically at the path configured via `SQLITE_DB_PATH`.

If you want to reset the schema, delete the SQLite file and restart the app.

---

# Running the Application

Start the development server:

```
npm run start:dev
```

Server runs at:

```
http://localhost:3000
```

---

# Postman Collection

A complete Postman collection is included in the repository.

```
postman_collection.json
```

To test the API:

1. Import the collection into Postman
2. Run authentication endpoints
3. Use the returned JWT token for protected endpoints

---

# Assumptions & Trade-offs

### Identity Model

Authentication uses a simple email/password model suitable for the scope of the assessment.

### Audit Scope

Only administrative actions are logged.

### Timezone Handling

Event timestamps are stored in **UTC**.

### Deployment

Deployment was not implemented due to time constraints, but the project structure supports containerization and cloud deployment.

---

# Author

**Laila Abou Hatab**

DIGIT Technical Assessment  
March 2026
