# Zorvyn Finance Dashboard Backend

**LIVE URL:** [https://fintech-backend-ten.vercel.app/](https://fintech-backend-ten.vercel.app/)

**Default Admin Credentials (for initial login):**

```
{
  "email": "adminrole@example.com",
  "password": "StrongPass123"
}
```

**Important:**

- Public registration is disabled. Only the admin can create new users via the API.
- Use the login endpoint below to sign in as admin:
  - `POST /api/v1/auth/login`
- credentials
  - {
    "email": "adminrole@example.com",
    "password": "StrongPass123"
    }

Node.js/Express backend for the Zorvyn assignment. The API provides authentication, role-based authorization, financial records management, and analytics endpoints for dashboard and insights modules.

Base API path: `/api/v1/*`

Root route: `/` returns a welcome message.

## Tech Stack

- Node.js + Express (ES Modules)
- MongoDB + Mongoose
- JWT authentication (cookie-based, HttpOnly)
- Zod request validation
- RBAC authorization (Admin, Analyst, Viewer)
- CORS + rate limiting for API protection

## Project Structure

```text
api/                   # Vercel serverless entrypoint
src/
  config/              # Environment and DB configuration
  constants/           # Roles, statuses, policies, enums
  controllers/         # HTTP handlers
  middlewares/         # Auth, RBAC, validation, rate-limit, error handlers
  models/              # Mongoose schemas/models
  routes/              # Route definitions
  services/            # Business logic
  utils/               # Token/cookie/password helpers
```

## Main Features

- **Secure Authentication:** Login, refresh, and logout flow using JWT and HttpOnly cookies for maximum security.
- **Role-Based Access Control:**
  - Admin: Full management permissions, including user creation.
  - Analyst: Access to records and insights.
  - Viewer: Dashboard and limited records access.
- **Financial Records Management:**
  - Full CRUD operations with robust filtering, pagination, and text search.
  - **Soft Delete:** Records are not permanently removed; instead, an `isDeleted` flag and `deletedAt` timestamp are set. Soft-deleted records are excluded from queries by default but can be restored by admin. This is implemented via a custom Mongoose plugin.
- **MongoDB Indexing:**
  - Strategic indexes on key fields (e.g., email, category, type, occurredAt, isDeleted) for fast queries and aggregations.
  - Compound and unique indexes are used for efficient lookups and to enforce data integrity.
- **Analytics:**
  - Real-time dashboard totals (income, expenses, net balance) and recent activity.
  - Advanced insights: income vs expense, category breakdowns, date range summaries, savings/cash flow trends, and monthly analytics.
- **Request Validation:**
  - All endpoints use Zod schemas for strict payload validation, ensuring data consistency and security.
- **Rate Limiting:**
  - Global and auth-sensitive routes are protected with rate limiting to prevent abuse and DoS attacks.

## Security Notes

- JWT cookies are HttpOnly and environment-aware for secure transport.
- CORS origin allow-list is configurable via environment variables.
- Rate limiting is enabled to reduce abuse/DoS risk.
- Registration endpoint is intentionally disabled for public self-signup.
- For additional hardening, Helmet can be enabled in the Express app if required by your environment.

## Environment Variables

1. Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

2. Fill in your secrets and configuration as needed.

Recommended production practices:

- Use long random values for `JWT_SECRET` and `REFRESH_TOKEN_SECRET`.
- Set `NODE_ENV=production`.
- Restrict `CORS_ALLOWED_ORIGINS` to trusted frontend domains only.

## Local Development Setup

1. Install dependencies

```bash
npm install
```

2. Ensure MongoDB is running and `MONGO_URI` is valid.

3. Start the backend

```bash
npm start
```

4. Verify service health

- `GET http://localhost:4000/api/v1/ping`
- `GET http://localhost:4000/api/v1/health`

## Initial Admin Login

Use the following credentials to log in as admin (user creation is restricted to admin only):

```json
{
  "email": "adminrole@example.com",
  "password": "StrongPass123"
}
```

Login endpoint:

- `POST /api/v1/auth/login`

## Key API Endpoints

| Module    | Method | Endpoint                                   | Access                       |
| --------- | ------ | ------------------------------------------ | ---------------------------- |
| System    | GET    | `/api/v1/ping`                             | Public                       |
| System    | GET    | `/api/v1/health`                           | Public                       |
| Auth      | POST   | `/api/v1/auth/login`                       | Public                       |
| Auth      | POST   | `/api/v1/auth/refresh`                     | Public (refresh cookie/body) |
| Auth      | POST   | `/api/v1/auth/logout`                      | Authenticated                |
| Auth      | POST   | `/api/v1/auth/register`                    | Disabled (403)               |
| Users     | GET    | `/api/v1/users`                            | Admin                        |
| Users     | POST   | `/api/v1/users`                            | Admin                        |
| Users     | PATCH  | `/api/v1/users/:userId/role`               | Admin                        |
| Records   | GET    | `/api/v1/records`                          | Analyst, Admin               |
| Records   | GET    | `/api/v1/records/viewer`                   | Viewer                       |
| Records   | POST   | `/api/v1/records`                          | Admin                        |
| Records   | PATCH  | `/api/v1/records/:id`                      | Admin                        |
| Dashboard | GET    | `/api/v1/dashboard/total-income`           | Viewer, Analyst, Admin       |
| Dashboard | GET    | `/api/v1/dashboard/total-expenses`         | Viewer, Analyst, Admin       |
| Dashboard | GET    | `/api/v1/dashboard/net-balance`            | Viewer, Analyst, Admin       |
| Dashboard | GET    | `/api/v1/dashboard/recent-activity`        | Viewer, Analyst, Admin       |
| Insights  | GET    | `/api/v1/insights/income-vs-expense`       | Analyst, Admin               |
| Insights  | GET    | `/api/v1/insights/top-spending-categories` | Analyst, Admin               |
| Insights  | GET    | `/api/v1/insights/date-range-summary`      | Analyst, Admin               |
| Insights  | GET    | `/api/v1/insights/savings-trend`           | Analyst, Admin               |
| Insights  | GET    | `/api/v1/insights/cash-flow-trend`         | Analyst, Admin               |
| Insights  | GET    | `/api/v1/insights/category-breakdown`      | Analyst, Admin               |
| Insights  | GET    | `/api/v1/insights/monthly-trends`          | Analyst, Admin               |

## Assignment Credits

- Assignment: Zorvyn Finance Dashboard Backend
- Author: Manu Keshrawani
