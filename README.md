# Event Management API

Backend API for managing events and user registrations built with **NestJS**, **TypeScript**, **TypeORM**, and **PostgreSQL**.

This project was developed as part of the **DIGIT Technical Test** to demonstrate backend architecture, API design, and business rule implementation.

---

# Tech Stack

* **Framework:** NestJS
* **Language:** TypeScript
* **ORM:** TypeORM
* **Database:** PostgreSQL
* **API Testing:** Postman

---

# Project Architecture

## Module-Based Structure

The application follows a **modular architecture** based on NestJS best practices.
The codebase is divided into three core modules:

* **Users Module**
* **Events Module**
* **Registrations Module**

This ensures **Separation of Concerns**, making the project easier to maintain, test, and scale.

```
src
 ├── config
 │    └── database.config.ts
 │
 ├── modules
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
 │    └── users
 │         ├── entities
 │         └── users.service.ts
```

---

# Architecture & Design Decisions

## 1. Module-Based Design

The system is divided into independent modules (**Users, Events, Registrations**) to enforce clear responsibilities and maintainability.

## 2. Data Integrity & Business Rules

To meet the technical requirements, several constraints were implemented both at the **Application Layer (NestJS)** and **Database Layer (PostgreSQL)**.

### Conflict Prevention

A **UNIQUE constraint on `event_date`** prevents multiple events from being scheduled at the exact same time.

### Double Registration Prevention

A **composite UNIQUE constraint on (`user_id`, `event_id`)** prevents users from registering more than once for the same event.

### Capacity Management

Before approving or creating a registration, the system verifies that the number of approved attendees does not exceed the `max_attendees` limit.

---

# Validation

All incoming requests are validated using **NestJS ValidationPipe**.

This ensures:

* Correct data types
* Required fields are provided
* Invalid requests are rejected before reaching the business logic

---

# Key Features Implemented

✅ Event creation and management (Admin)

✅ Retrieve upcoming events only

✅ Event registration workflow

```
Pending → Approved
```

✅ Automatic business rule enforcement:

* Prevent duplicate registrations
* Enforce event capacity limits
* Prevent registration to past events

---

# API Endpoints

## Events

Create event

```
POST /events
```

Get upcoming events

```
GET /events/upcoming
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

# Postman Collection

A complete **Postman Collection** is included in the repository.

```
Event_Management_API.postman_collection.json
```

## Steps to use

1. Import the JSON file into Postman.
2. Use **Admin endpoints** to create events.
3. Use **User endpoints** to browse events and register.

---

# Assumptions, Limitations & Trade-offs

## Identity Management

Due to the **48-hour timeframe**, a simplified **email-based identity system** was implemented.

The current schema is designed so that **JWT Authentication** can be added easily in the future through a dedicated Auth module.

## Audit Logging

The architecture includes preparation for **audit logging** to support future administrative monitoring and compliance features.

## Timezone Handling

All event dates are assumed to be stored in **UTC** to avoid inconsistencies between the server and database.

---

# Installation

Install dependencies:

```bash
npm install
```

---

# Running the Application

Development mode

```bash
npm run start:dev


# Author

**Laila Abou Hatab**

DIGIT Technical Test
March 2026
