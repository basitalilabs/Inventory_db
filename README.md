# Mini IMS (Inventory Management System)

A simple Inventory Management System REST API built with **Node.js**, **Express**, and **PostgreSQL** — created as a learning project to practice building a CRUD backend on top of a relational database, including authentication, foreign key relationships, and JOIN queries.

## Tech Stack

- **Node.js** + **Express** — server and routing
- **PostgreSQL** — relational database
- **pg** — PostgreSQL client for Node (raw SQL, no ORM)
- **bcrypt** — password hashing
- **jsonwebtoken** — JWT-based authentication
- **dotenv** — environment variable management
- **nodemon** — dev auto-reload

## Features

- User registration and login with hashed passwords and JWT auth
- Full CRUD for categories (protected create/update/delete, public read)
- Full CRUD for products (protected create/update/delete, public read)
- Relational schema: products belong to a category and track which user created them
- Products listing uses a `LEFT JOIN` to include the category name
- Route-level auth middleware protecting write operations

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
│   └── db.js              # PostgreSQL connection pool
├── controllers/
│   ├── userController.js
│   ├── categoryController.js
│   └── productController.js
├── middleware/
│   └── authMiddleware.js  # JWT verification
├── routes/
│   ├── userRoutes.js
│   ├── categoryRoutes.js
│   └── productRoutes.js
├── schema.sql              # Table definitions
├── server.js
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

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/users/register` | No | Register a new user |
| POST | `/api/users/login` | No | Log in, returns a JWT |

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
| GET | `/api/products` | No | Get all products (with category name joined) |
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

## What This Project Demonstrates

- Raw SQL with the `pg` package (no ORM) — parameterized queries to prevent SQL injection
- Password hashing with bcrypt
- JWT-based authentication and route-protection middleware
- Relational schema design with foreign keys and `ON DELETE` behavior
- `LEFT JOIN` usage to enrich API responses with related data
- RESTful route structure with a clean separation of routes and controllers

## License

ISC
