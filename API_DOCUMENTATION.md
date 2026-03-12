# Event Management API Documentation

> This document provides a full reference for all API endpoints, request bodies, query parameters, enums, and the default admin account.

---

## 🔐 Admin Account (Seeded)

By default, a seeded admin user is created when running the seeder script (unless environment variables override these values):

- **Email:** `admin@example.com`
- **Password:** `admin123`

You can override them with environment variables when running the seeder:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_FIRST_NAME`
- `ADMIN_LAST_NAME`
- `ADMIN_DOB`
- `ADMIN_GENDER`

Run the seeder with:

```bash
pnpm run seed
```

---

## 🔑 Authentication

### POST /auth/register

Register a new user.

**Request Body** (JSON):

- `firstName` (string, required)
- `lastName` (string, required)
- `email` (string, required)
- `password` (string, required)
- `dateOfBirth` (string, required, ISO date)
- `gender` (string, required, values below)

**Enum: gender**

- `MALE`
- `FEMALE`
- `OTHER`

**Response**

- `message` (string)
- `user` (object, excluding password)

---

### POST /auth/login

Authenticate and receive a JWT token.

**Request Body** (JSON):

- `email` (string, required)
- `password` (string, required)

**Response**

- `message` (string)
- `access_token` (string)

> Use the returned token as: `Authorization: Bearer <token>`

---

## 📍 Events

### POST /events (Admin only)

Create a new event.

**Headers**

- `Authorization: Bearer <token>`

**Request Body** (JSON):

- `name` (string, required)
- `description` (string, required)
- `max_attendees` (integer, required)
- `event_date` (string, required, ISO date)
- `event_type` (string, required)

**Enum: event_type**

- `CONFERENCE`
- `WEBINAR`
- `WORKSHOP`

**Response**

- `message` (string)
- `event` (object)

---

### GET /events (Admin only)

Fetch all events (paginated).

**Headers**

- `Authorization: Bearer <token>`

**Query Parameters**

- `page` (integer, default `1`): page number
- `limit` (integer, default `20`): items per page
- `search` (string, optional): search term applied to name + description
- `type` (string, optional): filter by `event_type` (case-insensitive)
- `dateFrom` (string, optional): ISO date (inclusive)
- `dateTo` (string, optional): ISO date (inclusive)

**Response**

- `message` (string)
- `items` (array of event objects)
- `total`, `page`, `limit`, `totalPages`, `hasNext`, `hasPrev`, `nextPage`, `prevPage`

---

### GET /events/upcoming (Authenticated users)

Fetch upcoming events (future `event_date`).

**Headers**

- `Authorization: Bearer <token>`

**Query Parameters** (same as `GET /events`)

**Response**

- Same pagination object as above.

---

### GET /events/:id (Authenticated users)

Fetch a single event by ID.

- Admin users can access past events.
- Non-admin users will receive `404` for past events.

**Headers**

- `Authorization: Bearer <token>`

**Response**

- `message` (string)
- Event object (including `registrationCount`)

---

### PATCH /events/:id (Admin only)

Update an existing event (partial updates supported).

**Headers**

- `Authorization: Bearer <token>`

**Request Body** (JSON)

- Any subset of the fields from `POST /events`.

**Response**

- `message` (string)
- `event` (updated object)

---

### DELETE /events/:id (Admin only)

Delete an event by ID.

**Headers**

- `Authorization: Bearer <token>`

**Response**

- `message` (string)

---

## 📝 Registrations

### POST /registrations/:eventId (Authenticated users)

Register the authenticated user for an event.

**Headers**

- `Authorization: Bearer <token>`

**Path Parameters**

- `eventId` (number): event to register for

**Request Body** (JSON)

- `linkedinProfile` (string, optional): must be a valid URL
- `educationLevel` (string, optional)
- `motivation` (string, optional)

**Enum: education_level**

- `HIGH_SCHOOL`
- `BACHELORS`
- `MASTERS`
- `PHD`
- `OTHER`

**Response**

- `message` (string)
- `registrationId` (number)
- `status` (string: `PENDING`)
- `eventId` (number)
- `userId` (number)

---

### PATCH /registrations/:id/approve (Admin only)

Approve a pending registration.

**Headers**

- `Authorization: Bearer <token>`

**Path Parameters**

- `id` (number): registration ID

**Response**

- `message` (string)
- `registration` (object)

**Enum: registration_status**

- `PENDING`
- `APPROVED`
- `REJECTED`

---

### GET /registrations/event/:eventId (Admin only)

Get a paginated list of registrations for an event.

**Headers**

- `Authorization: Bearer <token>`

**Path Parameters**

- `eventId` (number): event ID

**Query Parameters**

- `page` (integer, default `1`)
- `limit` (integer, default `20`)

**Response**

- `message` (string)
- `attendees` (array of registration objects)
- Pagination fields (`total`, `page`, `limit`, etc.)

---

## 👥 User Registrations

### GET /events/attended (Authenticated users)

Fetch registrations for the current user.

**Headers**

- `Authorization: Bearer <token>`

**Response**

- `message` (string)
- `events` (array) where each item includes:
  - `event` object
  - `registrationStatus` (`PENDING` / `APPROVED`)
  - `attendanceStatus` (`PENDING` / `APPROVED` / `COMPLETED`)

---

## 🧾 Audit Logs (Admin only)

### GET /audit-logs

Get a list of all audit log entries.

**Headers**

- `Authorization: Bearer <token>`

**Response**

- Array of audit log records with:
  - `id`
  - `admin_id`
  - `action` (string)
  - `entity` (string)
  - `entity_id` (number)
  - `created_at` (timestamp)

---

## 🔎 Important Notes

- All endpoints that modify data require a valid JWT in the `Authorization` header.
- Validation errors return HTTP `400` with a JSON payload describing the issue.
- Authentication failures return HTTP `401`.
- Authorization failures (missing admin role) return HTTP `403`.

---

## 🧪 Testing with Postman

A complete Postman collection is included in the repo:

- `event-platform.postman_collection.json`
- `event-platform.full.postman_collection.json`

To use the collection:

1. Import it into Postman.
2. Set `{{baseUrl}}` to your API base URL (e.g., `http://localhost:3000`).
3. Call `POST /auth/login` and copy the returned token into `{{authToken}}`.

---

## ✅ Enums Reference

### `user_role`

- `ADMIN`
- `USER`

### `gender`

- `MALE`
- `FEMALE`
- `OTHER`

### `event_type`

- `CONFERENCE`
- `WEBINAR`
- `WORKSHOP`

### `education_level`

- `HIGH_SCHOOL`
- `BACHELORS`
- `MASTERS`
- `PHD`
- `OTHER`

### `registration_status`

- `PENDING`
- `APPROVED`
- `REJECTED`
