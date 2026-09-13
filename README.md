# Mini IMS (Inventory Management System)

A production-grade REST API for a simple Inventory Management System, built with **Node.js**, **Express**, and **PostgreSQL**. Started as a learning project to master relational databases and evolved into a hardened backend with centralized error handling, request validation, pagination, security middleware, and an automated test suite.

## Tech Stack

- **Node.js** + **Express** — server and routing
- **PostgreSQL** — relational database
- **pg** — PostgreSQL client for Node (raw SQL, no ORM)
- **bcrypt** — password hashing
- **jsonwebtoken** — JWT-based authentication
- **express-validator** — request validation
- **helmet** — secure HTTP headers
- **cors** — cross-origin resource sharing
- **express-rate-limit** — brute-force protection on auth routes
- **Jest** + **Supertest** — automated testing
- **dotenv** — environment variable management
- **nodemon** — dev auto-reload

## Features

### Core
- User registration and login with hashed passwords and JWT auth
- Full CRUD for categories (protected create/update/delete, public read)
- Full CRUD for products (protected create/update/delete, public read)
- Relational schema: products belong to a category and track which user created them
- `LEFT JOIN` on product reads to include the category name, without hiding uncategorized products
- Route-level auth middleware protecting write operations

### Production-level hardening
- **Centralized error handling** — a custom `AppError` class plus a single Express error-handling middleware means every controller throws instead of manually formatting error responses. Unexpected crashes are logged server-side but never leak internal details to the client.
- **Async error safety** — a `catchAsync` wrapper eliminates repetitive `try/catch` blocks and guarantees no unhandled promise rejection ever crashes the server.
- **Request validation** — `express-validator` validates and sanitizes every input (required fields, email format, password length, numeric ranges) at the route layer, before it ever reaches business logic.
- **Consistent response shape** — every response follows `{ success, message, data }` (or `{ success: false, message }` on error), so API consumers always know what to expect.
- **Pagination** — `GET /api/products` supports `?page=&limit=` with `LIMIT`/`OFFSET`, and returns pagination metadata (`currentPage`, `totalPages`, `totalItem`) so clients never have to guess.
- **Security middleware**
  - `helmet` — sets secure HTTP headers, hides `X-Powered-By`, mitigates clickjacking/MIME-sniffing
  - `cors` — controls cross-origin access
  - `express-rate-limit` — throttles repeated requests to `/register` and `/login` to blunt brute-force and credential-stuffing attempts
- **Automated testing** — a Jest + Supertest suite covering auth, categories, and products: happy paths, validation failures, duplicate checks, missing-auth (401), and not-found (404) cases, runnable with a single `npm test`
- **Testable architecture** — the Express app (`app.js`) is separated from the server bootstrap (`server.js`), so the app can be exercised in-memory by tests without binding to a real port

## Database Schema

**users**
| Column | Type | Notes |
|---|---|---|
| id | SERIAL | Primary key |
| name | VARCHAR(100) | Required |
| email | VARCHAR(100) | Unique, required |
| password | VARCHAR(100) | Hashed with bcrypt |
| created_at | TIMESTAMP | Default now() |

**categories**
| Column | Type | Notes |
|---|---|---|
| id | SERIAL | Primary key |
| name | VARCHAR(100) | Unique, required |
| created_at | TIMESTAMP | Default now() |

**products**
| Column | Type | Notes |
|---|---|---|
| id | SERIAL | Primary key |
| name | VARCHAR(150) | Required |
| description | TEXT | Optional |
| price | DECIMAL(10,2) | Required, must be > 0 |
| stock | INTEGER | Required, must be >= 0, default 0 |
| category_id | INTEGER | FK → categories.id, `ON DELETE SET NULL` |
| created_by | INTEGER | FK → users.id, `ON DELETE SET NULL` |
| created_at | TIMESTAMP | Default now() |

Foreign keys use `ON DELETE SET NULL` — deleting a category or user does not delete related products; it just clears the reference.

## Project Structure

```
mini-ims/
├── config/
│   └── db.js                    # PostgreSQL connection pool
├── controllers/
│   ├── userController.js
│   ├── categoryController.js
│   └── productController.js
├── middleware/
│   ├── authMiddleware.js         # JWT verification
│   ├── validate.js               # express-validator result handler
│   ├── authLimiterMiddleware.js  # rate limiting for auth routes
│   └── errorHandler.js           # centralized error handler
├── utils/
│   ├── AppError.js               # custom operational error class
│   └── catchAsync.js             # async controller wrapper
├── routes/
│   ├── userRoutes.js
│   ├── categoryRoutes.js
│   └── productRoutes.js
├── tests/
│   ├── auth.test.js
│   ├── category.test.js
│   └── product.test.js
├── schema.sql                    # Table definitions
├── app.js                        # Express app config (used by tests)
├── server.js                     # Starts the HTTP server
├── .env.example
└── .gitignore
```

## Setup

### 1. Clone and install
```bash
git clone <your-repo-url>
cd mini-ims
npm install
```

### 2. Create the database
```bash
psql -U postgres
CREATE DATABASE mini_ims;
\q
```

### 3. Run the schema
```bash
psql -U postgres -d mini_ims -f schema.sql
```

### 4. Configure environment variables
Copy `.env.example` to `.env` and fill in your own values:
```
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=mini_ims
DB_PASSWORD=your_postgres_password
DB_PORT=5432
JWT_SECRET=your_long_random_secret
```

Generate a random JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. Run the server
```bash
npm run dev
```
Server runs at `http://localhost:5000`.

### 6. Run the test suite
```bash
npm test
```
Runs the full Jest + Supertest suite against the app in-memory (no need for the dev server to be running).

## API Endpoints

### Auth
| Method | Endpoint | Auth | Rate Limited | Description |
|---|---|---|---|---|
| POST | `/api/users/register` | No | Yes | Register a new user |
| POST | `/api/users/login` | No | Yes | Log in, returns a JWT |

### Categories
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/categories` | Yes | Create a category |
| GET | `/api/categories` | No | Get all categories |
| GET | `/api/categories/:id` | No | Get a single category |
| PATCH | `/api/categories/:id` | Yes | Update a category |
| DELETE | `/api/categories/:id` | Yes | Delete a category |

### Products
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/products` | Yes | Create a product |
| GET | `/api/products?page=&limit=` | No | Get paginated products (with category name joined) |
| GET | `/api/products/:id` | No | Get a single product |
| PATCH | `/api/products/:id` | Yes | Update a product |
| DELETE | `/api/products/:id` | Yes | Delete a product |

Protected routes require a header:
```
Authorization: Bearer <token>
```
where `<token>` is the JWT returned from `/api/users/login`.

## Example Requests

**Register**
```json
POST /api/users/register
{
  "name": "John Doe",
  "email": "john@test.com",
  "password": "test1234"
}
```

**Login**
```json
POST /api/users/login
{
  "email": "john@test.com",
  "password": "test1234"
}
```

**Create a product**
```json
POST /api/products
Authorization: Bearer <token>
{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse",
  "price": 25.99,
  "stock": 50,
  "category_id": 2
}
```

**Get paginated products**
```
GET /api/products?page=1&limit=10
```
```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 4,
    "totalItem": 40,
    "limit": 10
  }
}
```

## Error Response Format

Every error follows the same shape, regardless of where it occurred:
```json
{
  "success": false,
  "message": "Category not found"
}
```
Expected errors (validation failures, not-found, duplicates) return their real message with the correct status code. Unexpected server errors are logged internally but return a generic `"Something went wrong"` message, so internal details never leak to the client.

## What This Project Demonstrates

- Raw SQL with the `pg` package (no ORM) — parameterized queries to prevent SQL injection
- Password hashing with bcrypt and JWT-based authentication
- Relational schema design with foreign keys and `ON DELETE` behavior
- `LEFT JOIN` usage to enrich API responses with related data
- Centralized, consistent error handling with a custom error class
- Declarative request validation separated from business logic
- Pagination with metadata for scalable list endpoints
- Security middleware (helmet, cors, rate limiting) against common web and brute-force attacks
- An automated test suite (Jest + Supertest) covering success paths, validation errors, auth failures, and not-found cases
- A testable app structure (`app.js` vs `server.js`) matching real-world Express project conventions

## Roadmap

- [ ] Dockerize the app and database for consistent, reproducible environments
- [ ] Deploy to AWS Free Tier
- [ ] Set up GitHub Actions for CI (run tests on every push) and CD (auto-deploy on merge to main)

## License

ISC