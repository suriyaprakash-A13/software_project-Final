# SmartSplit API Contract Documentation

**Base URL:** `http://localhost:3001` (Development)  
**Production URL:** `https://api.smartsplit.com`

**Authentication:** JWT Bearer Token (except for auth endpoints)

---

## 📋 Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [Users APIs](#users-apis)
3. [Groups APIs](#groups-apis)
4. [Expenses APIs](#expenses-apis)
5. [Settlements APIs](#settlements-apis)
6. [Analytics APIs](#analytics-apis)
7. [Common Error Responses](#common-error-responses)

---

## 🔐 Authentication APIs

### 1. Initiate Google OAuth Login

**Endpoint:** `GET /auth/google`

**Description:** Redirects user to Google OAuth consent screen

**Authentication:** None

**Response:** 302 Redirect to Google OAuth

---

### 2. Google OAuth Callback

**Endpoint:** `GET /auth/google/callback`

**Description:** Handles Google OAuth callback and issues JWT token

**Authentication:** None

**Query Parameters:**
```typescript
{
  code: string;  // Google authorization code
  state?: string;
}
```

**Success Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://lh3.googleusercontent.com/...",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid Google code
- `500 Internal Server Error` - OAuth service failure

---

### 3. Logout

**Endpoint:** `POST /auth/logout`

**Description:** Invalidates current session (clears cookie)

**Authentication:** Required

**Success Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

### 4. Get Current User

**Endpoint:** `GET /auth/me`

**Description:** Returns current authenticated user profile

**Authentication:** Required

**Success Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://lh3.googleusercontent.com/...",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or expired token

---

## 👤 Users APIs

### 1. Get User by ID

**Endpoint:** `GET /users/:id`

**Description:** Retrieves user profile by ID

**Authentication:** Required

**Path Parameters:**
```typescript
{
  id: string; // UUID
}
```

**Success Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://lh3.googleusercontent.com/...",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` - User does not exist

---

### 2. Update User Profile

**Endpoint:** `PATCH /users/:id`

**Description:** Updates current user's profile

**Authentication:** Required (can only update own profile)

**Request Body:**
```json
{
  "name": "Jane Doe" // Optional
}
```

**Success Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "Jane Doe",
  "avatar": "https://lh3.googleusercontent.com/...",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `403 Forbidden` - Cannot update other users
- `400 Bad Request` - Invalid name format

---

## 👥 Groups APIs

### 1. Create Group

**Endpoint:** `POST /groups`

**Description:** Creates a new group (creator becomes OWNER)

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Trip to Bali",
  "description": "Vacation expenses for our Bali trip" // Optional
}
```

**Validation Rules:**
- `name`: Required, 1-100 characters
- `description`: Optional, max 500 characters

**Success Response (201 Created):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "name": "Trip to Bali",
  "description": "Vacation expenses for our Bali trip",
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z",
  "memberships": [
    {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "role": "OWNER",
      "joinedAt": "2025-01-15T10:00:00.000Z",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://lh3.googleusercontent.com/..."
      }
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors

---

### 2. Get All Groups (Paginated)

**Endpoint:** `GET /groups`

**Description:** Returns all groups the authenticated user belongs to

**Authentication:** Required

**Query Parameters:**
```typescript
{
  page?: number;    // Default: 1
  limit?: number;   // Default: 20, Max: 100
  search?: string;  // Optional: Filter by group name
}
```

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "name": "Trip to Bali",
      "description": "Vacation expenses",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "memberCount": 5,
      "role": "OWNER"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "name": "Office Lunch",
      "description": null,
      "createdAt": "2025-01-10T08:00:00.000Z",
      "memberCount": 12,
      "role": "MEMBER"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

---

### 3. Get Group by ID

**Endpoint:** `GET /groups/:id`

**Description:** Returns detailed group information

**Authentication:** Required (user must be a member)

**Path Parameters:**
```typescript
{
  id: string; // UUID
}
```

**Success Response (200 OK):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "name": "Trip to Bali",
  "description": "Vacation expenses for our Bali trip",
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z",
  "memberships": [
    {
      "id": "membership-uuid-1",
      "role": "OWNER",
      "joinedAt": "2025-01-15T10:00:00.000Z",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://lh3.googleusercontent.com/..."
      }
    },
    {
      "id": "membership-uuid-2",
      "role": "MEMBER",
      "joinedAt": "2025-01-16T12:00:00.000Z",
      "user": {
        "id": "551e8400-e29b-41d4-a716-446655440001",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "avatar": "https://lh3.googleusercontent.com/..."
      }
    }
  ]
}
```

**Error Responses:**
- `403 Forbidden` - User is not a member
- `404 Not Found` - Group does not exist

---

### 4. Update Group

**Endpoint:** `PATCH /groups/:id`

**Description:** Updates group details (OWNER only)

**Authentication:** Required (OWNER role)

**Request Body:**
```json
{
  "name": "Updated Group Name",        // Optional
  "description": "Updated description" // Optional
}
```

**Success Response (200 OK):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "name": "Updated Group Name",
  "description": "Updated description",
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-20T14:30:00.000Z"
}
```

**Error Responses:**
- `403 Forbidden` - User is not the owner
- `404 Not Found` - Group does not exist

---

### 5. Delete Group

**Endpoint:** `DELETE /groups/:id`

**Description:** Deletes a group (OWNER only, cascades all expenses)

**Authentication:** Required (OWNER role)

**Success Response (200 OK):**
```json
{
  "message": "Group deleted successfully"
}
```

**Error Responses:**
- `403 Forbidden` - User is not the owner
- `404 Not Found` - Group does not exist

---

### 6. Add Member to Group

**Endpoint:** `POST /groups/:id/members`

**Description:** Adds a member to the group (OWNER only)

**Authentication:** Required (OWNER role)

**Request Body:**
```json
{
  "email": "newmember@example.com"
}
```

**Success Response (201 Created):**
```json
{
  "id": "membership-uuid-3",
  "role": "MEMBER",
  "joinedAt": "2025-01-20T15:00:00.000Z",
  "userId": "552e8400-e29b-41d4-a716-446655440002",
  "groupId": "660e8400-e29b-41d4-a716-446655440000",
  "user": {
    "id": "552e8400-e29b-41d4-a716-446655440002",
    "name": "Bob Johnson",
    "email": "newmember@example.com",
    "avatar": "https://lh3.googleusercontent.com/..."
  }
}
```

**Error Responses:**
- `403 Forbidden` - User is not the owner
- `404 Not Found` - User with email not found
- `409 Conflict` - User is already a member

---

### 7. Remove Member from Group

**Endpoint:** `DELETE /groups/:id/members/:userId`

**Description:** Removes a member from the group (OWNER only, cannot remove owner)

**Authentication:** Required (OWNER role)

**Path Parameters:**
```typescript
{
  id: string;      // Group UUID
  userId: string;  // User UUID to remove
}
```

**Success Response (200 OK):**
```json
{
  "message": "Member removed successfully"
}
```

**Error Responses:**
- `403 Forbidden` - User is not the owner OR trying to remove owner
- `404 Not Found` - Member not found in group

---

## 💰 Expenses APIs

### 1. Create Expense

**Endpoint:** `POST /expenses`

**Description:** Creates a new expense in a group

**Authentication:** Required (user must be a member of the group)

**Request Body:**
```json
{
  "amount": 150.50,
  "description": "Dinner at beachside restaurant",
  "category": "FOOD",
  "payerId": "550e8400-e29b-41d4-a716-446655440000",
  "groupId": "660e8400-e29b-41d4-a716-446655440000"
}
```

**Validation Rules:**
- `amount`: Required, positive number, max 2 decimal places
- `description`: Required, 1-500 characters
- `category`: Required, one of: `FOOD`, `TRANSPORTATION`, `ACCOMMODATION`, `ENTERTAINMENT`, `UTILITIES`, `SHOPPING`, `HEALTHCARE`, `EDUCATION`, `OTHER`
- `payerId`: Required, valid user UUID (must be group member)
- `groupId`: Required, valid group UUID

**Success Response (201 Created):**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440000",
  "amount": "150.50",
  "description": "Dinner at beachside restaurant",
  "category": "FOOD",
  "payerId": "550e8400-e29b-41d4-a716-446655440000",
  "groupId": "660e8400-e29b-41d4-a716-446655440000",
  "createdBy": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-01-20T18:00:00.000Z",
  "updatedAt": "2025-01-20T18:00:00.000Z",
  "payer": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://lh3.googleusercontent.com/..."
  },
  "creator": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors (negative amount, invalid category)
- `403 Forbidden` - User is not a member of the group
- `404 Not Found` - Group or payer not found

---

### 2. Get All Expenses (Paginated)

**Endpoint:** `GET /expenses`

**Description:** Returns all expenses for the authenticated user across all groups

**Authentication:** Required

**Query Parameters:**
```typescript
{
  page?: number;      // Default: 1
  limit?: number;     // Default: 20, Max: 100
  groupId?: string;   // Optional: Filter by group
  category?: string;  // Optional: Filter by category
  startDate?: string; // Optional: ISO 8601 date
  endDate?: string;   // Optional: ISO 8601 date
}
```

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440000",
      "amount": "150.50",
      "description": "Dinner at beachside restaurant",
      "category": "FOOD",
      "createdAt": "2025-01-20T18:00:00.000Z",
      "payer": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe",
        "avatar": "https://lh3.googleusercontent.com/..."
      },
      "group": {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "name": "Trip to Bali"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### 3. Get Expense by ID

**Endpoint:** `GET /expenses/:id`

**Description:** Returns detailed expense information

**Authentication:** Required (user must be in the group)

**Success Response (200 OK):**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440000",
  "amount": "150.50",
  "description": "Dinner at beachside restaurant",
  "category": "FOOD",
  "payerId": "550e8400-e29b-41d4-a716-446655440000",
  "groupId": "660e8400-e29b-41d4-a716-446655440000",
  "createdBy": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-01-20T18:00:00.000Z",
  "updatedAt": "2025-01-20T18:00:00.000Z",
  "payer": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://lh3.googleusercontent.com/..."
  },
  "group": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "Trip to Bali"
  },
  "creator": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- `403 Forbidden` - User is not in the group
- `404 Not Found` - Expense does not exist

---

### 4. Update Expense

**Endpoint:** `PATCH /expenses/:id`

**Description:** Updates an expense (only creator can update)

**Authentication:** Required (must be creator)

**Request Body:**
```json
{
  "amount": 175.00,              // Optional
  "description": "Updated desc", // Optional
  "category": "ENTERTAINMENT"    // Optional
}
```

**Success Response (200 OK):**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440000",
  "amount": "175.00",
  "description": "Updated desc",
  "category": "ENTERTAINMENT",
  "payerId": "550e8400-e29b-41d4-a716-446655440000",
  "groupId": "660e8400-e29b-41d4-a716-446655440000",
  "createdBy": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-01-20T18:00:00.000Z",
  "updatedAt": "2025-01-21T10:00:00.000Z"
}
```

**Error Responses:**
- `403 Forbidden` - User is not the creator
- `404 Not Found` - Expense does not exist
- `400 Bad Request` - Validation errors

---

### 5. Delete Expense

**Endpoint:** `DELETE /expenses/:id`

**Description:** Deletes an expense (only creator can delete)

**Authentication:** Required (must be creator)

**Success Response (200 OK):**
```json
{
  "message": "Expense deleted successfully"
}
```

**Error Responses:**
- `403 Forbidden` - User is not the creator
- `404 Not Found` - Expense does not exist

---

### 6. Get Group Expenses

**Endpoint:** `GET /groups/:groupId/expenses`

**Description:** Returns all expenses for a specific group (paginated)

**Authentication:** Required (user must be a member)

**Query Parameters:**
```typescript
{
  page?: number;      // Default: 1
  limit?: number;     // Default: 20, Max: 100
  category?: string;  // Optional: Filter by category
}
```

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440000",
      "amount": "150.50",
      "description": "Dinner at beachside restaurant",
      "category": "FOOD",
      "createdAt": "2025-01-20T18:00:00.000Z",
      "payer": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe",
        "avatar": "https://lh3.googleusercontent.com/..."
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

**Error Responses:**
- `403 Forbidden` - User is not a member
- `404 Not Found` - Group does not exist

---

## 💸 Settlements APIs

### 1. Calculate Settlement for Group

**Endpoint:** `GET /settlements/groups/:groupId`

**Description:** Calculates optimized settlement transactions for a group

**Authentication:** Required (user must be a member)

**Path Parameters:**
```typescript
{
  groupId: string; // UUID
}
```

**Success Response (200 OK):**
```json
{
  "groupId": "660e8400-e29b-41d4-a716-446655440000",
  "groupName": "Trip to Bali",
  "calculatedAt": "2025-01-22T10:00:00.000Z",
  "totalExpenses": "1250.75",
  "netBalances": [
    {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "userName": "John Doe",
      "netBalance": "250.50",
      "totalPaid": "500.50",
      "totalShare": "250.00"
    },
    {
      "userId": "551e8400-e29b-41d4-a716-446655440001",
      "userName": "Jane Smith",
      "netBalance": "-125.25",
      "totalPaid": "100.00",
      "totalShare": "225.25"
    },
    {
      "userId": "552e8400-e29b-41d4-a716-446655440002",
      "userName": "Bob Johnson",
      "netBalance": "-125.25",
      "totalPaid": "650.25",
      "totalShare": "775.50"
    }
  ],
  "settlements": [
    {
      "from": {
        "id": "551e8400-e29b-41d4-a716-446655440001",
        "name": "Jane Smith"
      },
      "to": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe"
      },
      "amount": "125.25"
    },
    {
      "from": {
        "id": "552e8400-e29b-41d4-a716-446655440002",
        "name": "Bob Johnson"
      },
      "to": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe"
      },
      "amount": "125.25"
    }
  ],
  "transactionCount": 2
}
```

**Error Responses:**
- `403 Forbidden` - User is not a member
- `404 Not Found` - Group does not exist

---

### 2. Get User Balance in Group

**Endpoint:** `GET /settlements/groups/:groupId/users/:userId/balance`

**Description:** Returns net balance for a specific user in a group

**Authentication:** Required (user must be a member)

**Success Response (200 OK):**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "userName": "John Doe",
  "groupId": "660e8400-e29b-41d4-a716-446655440000",
  "groupName": "Trip to Bali",
  "netBalance": "250.50",
  "totalPaid": "500.50",
  "totalShare": "250.00",
  "expenseCount": 8
}
```

**Error Responses:**
- `403 Forbidden` - User is not a member
- `404 Not Found` - Group or user not found

---

## 📊 Analytics APIs

### 1. Get Monthly Analytics

**Endpoint:** `GET /analytics/groups/:groupId/monthly`

**Description:** Returns monthly expense breakdown for a group

**Authentication:** Required (user must be a member)

**Query Parameters:**
```typescript
{
  year?: number;  // Default: current year
  month?: number; // Optional: 1-12, if omitted returns all months
}
```

**Success Response (200 OK):**
```json
{
  "groupId": "660e8400-e29b-41d4-a716-446655440000",
  "groupName": "Trip to Bali",
  "year": 2025,
  "data": [
    {
      "month": 1,
      "monthName": "January",
      "totalExpenses": "1250.75",
      "expenseCount": 23,
      "averageExpense": "54.38"
    },
    {
      "month": 2,
      "monthName": "February",
      "totalExpenses": "890.50",
      "expenseCount": 18,
      "averageExpense": "49.47"
    }
  ]
}
```

---

### 2. Get Category-wise Analytics

**Endpoint:** `GET /analytics/groups/:groupId/categories`

**Description:** Returns category breakdown for a group

**Authentication:** Required (user must be a member)

**Query Parameters:**
```typescript
{
  startDate?: string; // Optional: ISO 8601 date
  endDate?: string;   // Optional: ISO 8601 date
}
```

**Success Response (200 OK):**
```json
{
  "groupId": "660e8400-e29b-41d4-a716-446655440000",
  "groupName": "Trip to Bali",
  "dateRange": {
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-01-31T23:59:59.999Z"
  },
  "data": [
    {
      "category": "FOOD",
      "totalExpenses": "550.25",
      "expenseCount": 12,
      "percentage": 44.0
    },
    {
      "category": "TRANSPORTATION",
      "totalExpenses": "300.50",
      "expenseCount": 5,
      "percentage": 24.0
    },
    {
      "category": "ACCOMMODATION",
      "totalExpenses": "400.00",
      "expenseCount": 6,
      "percentage": 32.0
    }
  ],
  "totalExpenses": "1250.75"
}
```

---

### 3. Get User Analytics

**Endpoint:** `GET /analytics/users/:userId/summary`

**Description:** Returns expense summary across all groups for a user

**Authentication:** Required (can only view own analytics)

**Query Parameters:**
```typescript
{
  startDate?: string; // Optional: ISO 8601 date
  endDate?: string;   // Optional: ISO 8601 date
}
```

**Success Response (200 OK):**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "userName": "John Doe",
  "dateRange": {
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-01-31T23:59:59.999Z"
  },
  "totalPaid": "2350.75",
  "totalOwed": "-150.50",
  "netBalance": "2200.25",
  "groupCount": 3,
  "expenseCount": 45,
  "topCategories": [
    {
      "category": "FOOD",
      "totalExpenses": "800.50",
      "percentage": 34.0
    },
    {
      "category": "TRANSPORTATION",
      "totalExpenses": "650.25",
      "percentage": 27.6
    }
  ]
}
```

**Error Responses:**
- `403 Forbidden` - Can only view own analytics

---

## ⚠️ Common Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "amount must be a positive number",
    "description should not be empty"
  ],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You do not have permission to perform this action",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "User is already a member of this group",
  "error": "Conflict"
}
```

### 429 Too Many Requests
```json
{
  "statusCode": 429,
  "message": "Too many requests, please try again later",
  "error": "ThrottlerException"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## 🔒 Authentication Header Format

All protected endpoints require:

```
Authorization: Bearer <JWT_TOKEN>
```

Example:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDMyNjA4MDAsImV4cCI6MTcwMzM0NzIwMH0.signature
```

---

## 📝 Rate Limiting

- **Default Limit:** 100 requests per 15 minutes per IP
- **Reset:** Automatically resets after 15 minutes
- **Headers Returned:**
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## 🎯 Pagination Format

All paginated endpoints follow this structure:

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Query Parameters:**
- `page`: Page number (1-indexed)
- `limit`: Items per page (max 100)

---

## ✅ API Contract Complete

All endpoints are strictly typed and validated using NestJS pipes and class-validator.
