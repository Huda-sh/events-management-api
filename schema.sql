CREATE TYPE user_role AS ENUM (
    'ADMIN',
    'USER'
);

CREATE TYPE event_type AS ENUM (
    'CONFERENCE',
    'WEBINAR',
    'WORKSHOP'
);

CREATE TYPE registration_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    max_attendees INTEGER NOT NULL CHECK (max_attendees > 0),
    event_date TIMESTAMP NOT NULL,
    event_type event_type NOT NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX unique_event_date
ON events(event_date);

CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status registration_status NOT NULL DEFAULT 'PENDING',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX unique_user_event
ON registrations(user_id, event_id);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_date
ON events(event_date);

CREATE INDEX idx_registrations_event
ON registrations(event_id);

CREATE INDEX idx_registrations_user
ON registrations(user_id);

CREATE VIEW event_approved_counts AS
SELECT
    event_id,
    COUNT(*) AS approved_attendees
FROM registrations
WHERE status = 'APPROVED'
GROUP BY event_id;