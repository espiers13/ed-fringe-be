---

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

---

## Tech Stack

- **Node.js** & **Express** — server and routing
- **PostgreSQL** & **node-postgres (pg)** — database
- **bcrypt** — password hashing
- **jsonwebtoken** — authentication
- **pg-format** — safe SQL query formatting
- **dotenv** — environment variable management
- **Jest** & **Supertest** — testing

---

## Scripts

| Script    | Command             | Description                   |
| --------- | ------------------- | ----------------------------- |
| Start     | `node listen.js`    | Start the server              |
| Seed      | `npm run seed`      | Seed the development database |
| Seed prod | `npm run seed:prod` | Seed the production database  |
| Test      | `npm test`          | Run the test suite            |

---

## Frontend

The frontend for this project can be found at: https://github.com/espiers13/ed-fringe-app
