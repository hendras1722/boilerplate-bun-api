# Bun API Framework

A fast, lightweight REST API built with [Bun](https://bun.sh), featuring a custom routing system, SQLite integration, file uploads, and a built-in logging system.

## 🚀 Features

- **Fast Runtime**: Powered by Bun for maximum performance.
- **SQLite Database**: Integrated SQLite support with a clean SQL tagging system.
- **Custom Logger**: Built-in middleware that logs requests to the console and `app.log`.
- **File Uploads**: Native file upload handling with automated local storage.
- **Consistent Responses**: Unified `ApiResponse` utility for structured JSON responses.
- **Log Viewer**: Dedicated endpoint to retrieve and parse system logs.

## 🛠 Installation

To install dependencies:

```bash
bun install
```

## 🚦 Getting Started

To run the server in development mode (with hot reloading):

```bash
bun run dev
```

To start the server:

```bash
bun start
```

The server will be running at `http://localhost:3000`.

## 📖 API Documentation

### System
- `GET /api/version`: Returns the current API version.
- `GET /api/logs`: Returns parsed logs from `app.log`.

### Users
- `GET /api/v2/users`: Get all users.
- `POST /api/v2/create-user`: Create a new user.
  - Body: `{ "name": "string", "email": "string" }`
- `DELETE /api/v2/delete-user/:id`: Delete a user by ID.

### Uploads
- `POST /api/v2/upload`: Upload a file (Multipart Form Data).
  - Field: `file`
- `GET /api/v2/uploads/:filename`: Serve an uploaded file.
- `GET /api/v2/test`: A test page for file uploads.

### Background Jobs
- `POST /api/v2/jobs/:type`: Enqueue a job on a background worker thread pool (fire-and-forget).
  - Body: JSON payload passed to the job handler.
  - Built-in job types: `hash` (`{ "data": "string" }`), `fibonacci` (`{ "n": number }`).
  - Add new job types by registering a handler in `src/workers/job.worker.ts`.
  - Returns `202` immediately with `{ "job_id": "...", "status": "pending" }`. Job status/result is tracked in an in-memory `Map` (`src/utils/jobStore.ts`) — not persisted to disk, so it resets on server restart.
- `GET /api/v2/jobs/:id/events`: Server-Sent Events stream for a job's status. Sends the current status immediately (or `pending` if still running), then pushes one final event (`completed` or `failed`) and closes the connection — no polling required. This is the endpoint an external system should subscribe to right after calling `POST /api/v2/jobs/:type`.

### Reminders
- `POST /api/v2/reminders`: Create a reminder.
  - Body: `{ "title": "string", "note"?: "string", "remind_at": "ISO 8601 date string" }`
- `GET /api/v2/reminders`: List all reminders, ordered by `remind_at`.
- `GET /api/v2/reminders/:id`: Get a single reminder.
- `DELETE /api/v2/reminders/:id`: Delete a reminder.
- A `Bun.cron` job runs every minute, marks any `pending` reminder whose `remind_at` has passed as `triggered`, and logs it. Extend `src/utils/reminderScheduler.ts` to send emails/notifications instead of just logging.

## 📁 Project Structure

```text
src/
├── controllers/    # Request handlers
├── database/       # SQLite connection and schema
├── middlewares/    # Custom middlewares (logger, methods)
├── models/         # TypeScript interfaces
├── routes/         # Route definitions
├── utils/          # Helpers (Response, parseLog, worker pool)
├── workers/        # Background worker thread scripts
└── index.ts        # Entry point
```

## 📝 Logging

The API uses a custom logging middleware that records:
- Timestamp
- HTTP Method
- URL
- Status Code
- Duration (ms)
- Error Messages (if any)

Logs are saved to `app.log` in the root directory and can be accessed via the `/api/logs` endpoint.

---
Created with ❤️ using Bun v1.3.12

