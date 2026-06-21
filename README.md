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
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
FRONTEND_URL=http://localhost:5173
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
| PATCH | `/api/user/password` | Update a user's password | No |
| POST | `/api/forgot-password` | Request a password reset link by email | No |
| POST | `/api/reset-password` | Reset password using a valid reset token | No |

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

### POST /api/forgot-password

**Request body:**
```json
{
  "email": "your@email.com"
}
```

**Response:**
```json
{
  "msg": "If that email exists, a reset link has been sent."
}
```

If the email matches an account, a time-limited JWT reset token is generated and emailed to the user via Mailgun as a link to the frontend's reset password page. The same response is returned whether or not the email exists, so the endpoint doesn't reveal which emails are registered.

### POST /api/reset-password

**Request body:**
```json
{
  "token": "eyJhbGci...",
  "newPassword": "your_new_password"
}
```

**Response:**
```json
{
  "msg": "Password updated successfully."
}
```

The token is verified and, if valid and unexpired, the user's password is updated (hashed with bcrypt). Expired or invalid tokens return a 400 error.

## Tech Stack

- **Node.js** & **Express** — server and routing
- **PostgreSQL** & **node-postgres (pg)** — database
- **bcrypt** — password hashing
- **jsonwebtoken** — authentication and password reset tokens
- **mailgun.js** — sends password reset emails
- **pg-format** — safe SQL query formatting
- **dotenv** — environment variable management
- **Jest**, **jest-sorted** & **Supertest** — testing

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Start | `node listen.js` | Start the server |
| Seed | `npm run seed` | Seed the development database |
| Seed prod | `npm run seed:prod` | Seed the production database |
| Test | `npm test` | Run the test suite |

## Project Structure

```
.
├── app.js                          # Express app: middleware and route definitions
├── listen.js                       # Starts the server
├── controllers/
│   ├── user-controllers.js         # Login, signup, delete, schedule, password patch
│   └── password-controllers.js     # Forgot/reset password (JWT token + Mailgun)
├── middleware/
│   └── auth.js                     # JWT verification for protected routes
├── models/
│   └── user-models.js              # Database queries
├── utils/
│   └── mailer.js                   # Mailgun client setup
├── db/
│   ├── index.js                    # Database connection
│   ├── setup.sql                   # Creates dev/test databases
│   ├── data/                       # Seed data
│   └── seeds/                      # Seeding scripts
└── __tests__/
    └── app.test.js                 # Endpoint tests (Jest + Supertest)
```

## Frontend

The frontend for this project can be found at: https://github.com/espiers13/ed-fringe-app
