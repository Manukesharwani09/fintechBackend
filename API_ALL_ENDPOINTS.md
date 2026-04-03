# API Endpoints Documentation

This document lists all API endpoints in the system, grouped by feature. Each endpoint includes its HTTP method, path, description, access control, example request, and example response.

---

## Auth Endpoints

### 1. Register (Disabled)

**POST** `/api/v1/auth/register`

- **Description:** Registration is disabled. Only admins can create users via the user endpoint.
- **Access:** None (always returns 403)
  **Example Response:**

```json
{
  "message": "Registration is disabled. Please contact an administrator."
}
```

### 2. Login

**POST** `/api/v1/auth/login`

- **Description:** Authenticate user and receive access token (sets cookies).
- **Access:** All users
  **Example Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Example Response:**

```json
{
	"data": { "user": { "_id": "...", "email": "user@example.com", ... } },
	"message": "Login successful"
}
```

### 3. Refresh Session

**POST** `/api/v1/auth/refresh`

- **Description:** Refresh session using refresh token (cookie).
- **Access:** All users
  **Example Response:**

```json
{
	"data": { "user": { "_id": "...", "email": "user@example.com", ... } },
	"message": "Session refreshed"
}
```

### 4. Logout

**POST** `/api/v1/auth/logout`

- **Description:** Logout user and clear cookies.
- **Access:** All users
  **Example Response:**

```json
{
  "message": "Logged out successfully"
}
```

---

## User Endpoints

All endpoints require authentication and Admin role.

### 1. List Users

**GET** `/api/v1/users`

- **Description:** List all users (with pagination, filtering, and soft-deleted option).
- **Access:** Admin only
  **Query Params:** `page`, `limit`, `includeDeleted`
  **Example Response:**

```json
{
	"data": [ { "_id": "...", "email": "...", ... } ],
	"meta": { "page": 1, "limit": 10, "total": 42 }
}
```

### 2. Get User By ID

**GET** `/api/v1/users/:userId`

- **Description:** Get details of a specific user.
- **Access:** Admin only
  **Example Response:**

```json
{
	"data": { "_id": "...", "email": "...", ... }
}
```

### 3. Create User

**POST** `/api/v1/users`

- **Description:** Create a new user (admin only).
- **Access:** Admin only
  **Example Request:**

```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "role": "analyst"
}
```

**Example Response:**

```json
{
	"data": { "_id": "...", "email": "newuser@example.com", ... },
	"message": "User created successfully"
}
```

### 4. Update User

**PATCH** `/api/v1/users/:userId`

- **Description:** Update user details (email, password, etc).
- **Access:** Admin only
  **Example Request:**

```json
{
  "email": "updated@example.com"
}
```

**Example Response:**

```json
{
	"data": { "_id": "...", "email": "updated@example.com", ... },
	"message": "User updated successfully"
}
```

### 5. Assign User Role

**PATCH** `/api/v1/users/:userId/role`

- **Description:** Change a user's role.
- **Access:** Admin only
  **Example Request:**

```json
{
  "role": "analyst"
}
```

**Example Response:**
{
"data": { "\_id": "...", "role": "analyst", ... },
"message": "User role updated successfully"
}

````

### 6. Update User Status
**PATCH** `/api/v1/users/:userId/status`
- **Description:** Change a user's status (active, suspended, etc).
- **Access:** Admin only
**Example Request:**
```json
{
	"status": "active"
}
````

**Example Response:**
{
"data": { "\_id": "...", "status": "active", ... },
"message": "User status updated successfully"
}

```

### 7. Soft Delete User
**DELETE** `/api/v1/users/:userId`
- **Description:** Soft-delete a user (mark as deleted, not removed from DB).
- **Access:** Admin only
**Example Response:**
{
	"data": { "_id": "...", ... },
	"message": "User deleted successfully"
}
```

### 8. Restore User

**PATCH** `/api/v1/users/:userId/restore`

- **Description:** Restore a soft-deleted user.
- **Access:** Admin only
  **Example Response:**
  {
  "data": { "\_id": "...", ... },
  "message": "User restored successfully"
  }

````

---

## Financial Record Endpoints

All endpoints require authentication. Most require Analyst or Admin role. Viewer endpoint is for Viewer role only.

### 1. Create Record
**POST** `/api/v1/records`
- **Description:** Add a new financial record (income or expense).
- **Access:** Analyst, Admin
**Example Request:**
```json
{
	"amount": 1000,
	"type": "income",
	"category": "salary",
	"description": "March salary",
	"occurredAt": "2026-03-01"
}
````

**Example Response:**
{
"data": { "\_id": "...", "amount": 1000, ... },
"message": "Record created successfully"
}

```

### 2. Get All Records
**GET** `/api/v1/records`
- **Description:** List all financial records for the authenticated user. Supports filters: type, category, startDate, endDate, page, limit.
- **Access:** Analyst, Admin
**Example Request:**
`GET /api/v1/records?type=expense&category=food&startDate=2026-03-01&endDate=2026-03-31&page=1&limit=10`
**Example Response:**
{
	"data": [ { "_id": "...", "amount": 100, ... } ],
	"meta": { "page": 1, "limit": 10, "total": 5 }
}
```

### 3. Get All Records (Viewer)

**GET** `/api/v1/records/viewer`

- **Description:** List all records for Viewer role (no filters allowed, just pagination).
- **Access:** Viewer only
  **Example Request:**
  `GET /api/v1/records/viewer?page=1&limit=10`
  **Example Response:**
  {
  "data": [ { "_id": "...", "amount": 100, ... } ],
  "meta": { "page": 1, "limit": 10, "total": 5 }
  }

```

### 4. Get Record By ID
**GET** `/api/v1/records/:id`
- **Description:** Get details of a specific financial record.
- **Access:** Analyst, Admin
**Example Response:**
{
	"data": { "_id": "...", "amount": 100, ... }
}
```

### 5. Update Record

**PATCH** `/api/v1/records/:id`

- **Description:** Update a financial record (amount, type, category, description, occurredAt).
- **Access:** Analyst, Admin
  **Example Request:**
  {
  "amount": 120,
  "category": "bonus"
  }
  **Example Response:**
  {
  "data": { "\_id": "...", "amount": 120, ... },
  "message": "Record updated successfully"
  }

```

### 6. Delete Record
**DELETE** `/api/v1/records/:id`
- **Description:** Soft-delete a financial record.
- **Access:** Analyst, Admin
**Example Response:**
{
	"message": "Record deleted successfully"
}
```

### 7. Restore Record

**PATCH** `/api/v1/records/:id/restore`

- **Description:** Restore a soft-deleted record.
- **Access:** Analyst, Admin
  **Example Response:**
  {
  "data": { "\_id": "...", ... },
  "message": "Record restored successfully"
  }

```

---

## Dashboard Endpoints

All endpoints require authentication and Analyst/Admin role.

### 1. Total Income
**GET** `/api/v1/dashboard/total-income`
- **Description:** Get total income for the authenticated user.
- **Access:** Analyst, Admin
**Example Response:**
{
	"data": { "totalIncome": 10000 }
}
```

### 2. Total Expenses

**GET** `/api/v1/dashboard/total-expenses`

- **Description:** Get total expenses for the authenticated user.
- **Access:** Analyst, Admin
  **Example Response:**
  {
  "data": { "totalExpenses": 5000 }
  }

```

### 3. Net Balance
**GET** `/api/v1/dashboard/net-balance`
- **Description:** Get net balance (income - expenses) for the authenticated user.
- **Access:** Analyst, Admin
**Example Response:**
{
	"data": { "netBalance": 5000 }
}
```

### 4. Category Breakdown

**GET** `/api/v1/dashboard/category-breakdown`

- **Description:** Get breakdown of income and expenses by category.
- **Access:** Analyst, Admin
  **Example Response:**
  {
  "data": [ { "category": "food", "total": 1500 }, ... ]
  }

```

### 5. Monthly Trends
**GET** `/api/v1/dashboard/monthly-trends`
- **Description:** Get monthly trends of income and expenses.
- **Access:** Analyst, Admin
**Example Response:**
{
	"data": [ { "month": "2026-01", "income": 2000, "expenses": 1000 }, ... ]
}
```

### 6. Recent Activity

**GET** `/api/v1/dashboard/recent-activity?limit=10`

- **Description:** List recent financial transactions (limit 1-100).
- **Access:** Analyst, Admin
  **Example Request:**
  `GET /api/v1/dashboard/recent-activity?limit=5`
  **Example Response:**
  {
  "data": [ { "_id": "...", "amount": 100, ... } ]
  }

```

---

## Insights Endpoints

All endpoints require authentication and Analyst/Admin role.

### 1. Income vs Expense
**GET** `/api/v1/insights/income-vs-expense`
- **Description:** Compare total income and expenses for the authenticated user.
- **Access:** Analyst, Admin
**Example Response:**
{
	"data": { "totalIncome": 10000, "totalExpenses": 5000, "ratio": 2 }
}
```

### 2. Top Spending Categories

**GET** `/api/v1/insights/top-spending-categories?limit=5`

- **Description:** List top spending categories by total expenses (limit 1-20).
- **Access:** Analyst, Admin
  **Example Request:**
  `GET /api/v1/insights/top-spending-categories?limit=3`
  **Example Response:**
  {
  "data": [ { "category": "food", "totalSpent": 1500, "transactionCount": 5 }, ... ]
  }

```

### 3. Date Range Summary
**GET** `/api/v1/insights/date-range-summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- **Description:** Get income, expenses, and net balance for a custom date range.
- **Access:** Analyst, Admin
**Example Request:**
`GET /api/v1/insights/date-range-summary?startDate=2026-03-01&endDate=2026-03-31`
**Example Response:**
{
	"data": { "range": { "startDate": "2026-03-01", "endDate": "2026-03-31" }, "totalIncome": 5000, "totalExpenses": 2000, "netBalance": 3000 }
}
```

### 4. Savings Trend

**GET** `/api/v1/insights/savings-trend?months=12`

- **Description:** Show net savings trend for the last N months (1-24).
- **Access:** Analyst, Admin
  **Example Request:**
  `GET /api/v1/insights/savings-trend?months=6`
  **Example Response:**
  {
  "data": [ { "year": 2026, "month": 1, "netSavings": 1000 }, ... ]
  }

```

### 5. Cash Flow Trend
**GET** `/api/v1/insights/cash-flow-trend?months=12`
- **Description:** Show monthly income and expenses for the last N months (1-24).
- **Access:** Analyst, Admin
**Example Request:**
`GET /api/v1/insights/cash-flow-trend?months=6`
**Example Response:**
{
	"data": [ { "year": 2026, "month": 1, "income": 2000, "expenses": 1000 }, ... ]
}
```

### 6. Category Breakdown

**GET** `/api/v1/insights/category-breakdown`

- **Description:** Breakdown of income and expenses by category.
- **Access:** Analyst, Admin
  **Example Response:**
  {
  "data": [ { "type": "expense", "typeTotal": 4000, "categories": [ { "category": "food", "total": 1500, "count": 5 }, ... ] }, ... ]
  }

```

### 7. Monthly Trends
**GET** `/api/v1/insights/monthly-trends?months=12`
- **Description:** Show income, expenses, and net balance for each of the last N months (1-24).
- **Access:** Analyst, Admin
**Example Request:**
`GET /api/v1/insights/monthly-trends?months=3`
**Example Response:**
{
	"data": [ { "year": 2026, "month": 1, "income": 2000, "expenses": 1000, "net": 1000 }, ... ]
}
```

---

## Notes

- All endpoints require authentication (access token in cookie).
- Only users with appropriate roles (Admin, Analyst, Viewer) can access protected endpoints.
- All analytics exclude soft-deleted records.
- All dates are ISO 8601 format.

### 2. Recent Transactions

**GET** `/api/v1/dashboard/recent-transactions?limit=10`

- **Description:** List recent financial transactions.
- **Access:** Analyst, Admin

### 3. Monthly Summary

**GET** `/api/v1/dashboard/monthly-summary?months=6`

- **Description:** Get monthly summary of income and expenses for the last N months.
- **Access:** Analyst, Admin

---

## Insights Endpoints

### 1. Income vs Expense

**GET** `/api/v1/insight/income-vs-expense`

- **Description:** Compare total income and expenses for the authenticated user.
- **Access:** Analyst, Admin

### 2. Top Spending Categories

**GET** `/api/v1/insight/top-spending-categories?limit=5`

- **Description:** List top spending categories by total expenses.
- **Access:** Analyst, Admin

### 3. Date Range Summary

**GET** `/api/v1/insight/date-range-summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

- **Description:** Get income, expenses, and net balance for a custom date range.
- **Access:** Analyst, Admin

### 4. Savings Trend

**GET** `/api/v1/insight/savings-trend?months=12`

- **Description:** Show net savings trend for the last N months.
- **Access:** Analyst, Admin

### 5. Cash Flow Trend

**GET** `/api/v1/insight/cash-flow-trend?months=12`

- **Description:** Show monthly income and expenses for the last N months.
- **Access:** Analyst, Admin

### 6. Category Breakdown

**GET** `/api/v1/insight/category-breakdown`

- **Description:** Breakdown of income and expenses by category.
- **Access:** Analyst, Admin

### 7. Monthly Trends

**GET** `/api/v1/insight/monthly-trends?months=12`

- **Description:** Show income, expenses, and net balance for each of the last N months.
- **Access:** Analyst, Admin

---

## Notes

- All endpoints require authentication (access token in cookie).
- Only users with appropriate roles (Admin, Analyst) can access protected endpoints.
- All analytics exclude soft-deleted records.
- All dates are ISO 8601 format.
