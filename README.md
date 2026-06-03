# Ed Fringe BE

A RESTful API for the Ed Fringe Schedule App, built with Node.js, Express, and PostgreSQL. Allows users to create accounts, log in, and manage a personal schedule of Edinburgh Festival Fringe events.

## Live API

https://ed-fringe-be.onrender.com

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL

### Installation

1. Clone the repo:

```bash
git clone https://github.com/espiers13/ed-fringe-be.git
cd ed-fringe-be
```

2. Install dependencies:

```bash
npm install
```

3. Create the following environment files in the root directory:

**.env.development**
```
PGDATABASE=edfringe_schedule_users
JWT_SECRET=your_jwt_secret
```

**.env.test**
```
PGDATABASE=edfringe_schedule_users_test
JWT_SECRET=your_jwt_secret
```

4. Set up the databases:

```bash
psql -f db/setup.sql
```

5. Seed the development database:

```bash
npm run seed
```

## Running Tests

```bash
npm test
```

Tests use a separate test database that is re-seeded before each test.

## API Endpoints

### Auth

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/login` | Authenticate user, returns JWT token | No |
| POST | `/api/signup` | Create a new user | No |
| POST | `/api/user/delete` | Delete a user account | No |

### Schedule

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/schedule/:user_id` | Get a user's saved schedule | Yes |
| POST | `/api/schedule/:user_id` | Add an event to a user's schedule | Yes |
| PATCH | `/api/schedule/:user_id` | Remove an event from a user's schedule | Yes |

### Authentication

Protected routes require a Bearer token in the request header:

```
Authorization: Bearer <token>
```

## Request & Response Examples

### POST /api/login

**Request body:**
```json
{
  "username": "your_username",
  "password": "your_password"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "Emily Spiers",
    "username": "your_username",
    "email": "your@email.com"
  },
  "token": "eyJhbGci..."
}
```

### POST /api/schedule/:user_id

**Request body:**
```json
{
  "code": "DEMO:2026AFTERSH"
}
```

**Response:**
```json
{
  "id": 3,
  "user_id": 1,
  "code": "DEMO:2026AFTERSH"
}
```

### PATCH /api/schedule/:user_id

**Request body:**
```json
{
  "code": "DEMO:2026AFTERSH"
}
```

**Response:** Updated array of remaining schedule items.

## Tech Stack

- **Node.js** & **Express** — server and routing
- **PostgreSQL** & **node-postgres (pg)** — database
- **bcrypt** — password hashing
- **jsonwebtoken** — authentication
- **pg-format** — safe SQL query formatting
- **dotenv** — environment variable management
- **Jest** & **Supertest** — testing

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Start | `node listen.js` | Start the server |
| Seed | `npm run seed` | Seed the development database |
| Seed prod | `npm run seed:prod` | Seed the production database |
| Test | `npm test` | Run the test suite |

## Frontend

The frontend for this project can be found at: https://github.com/espiers13/ed-fringe-app
