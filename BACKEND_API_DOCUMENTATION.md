# Fasika School Management System - Backend API Documentation

## Overview
This document provides a comprehensive guide to the database structure and API endpoints required for the Fasika School Management System backend implementation.

## Database Structure

### Core Tables

#### 1. users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(10) NOT NULL CHECK (role IN ('ADMIN', 'USER')),
    branch VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_branch ON users(branch);
```

#### 2. parents
```sql
CREATE TABLE parents (
    id SERIAL PRIMARY KEY,
    fname VARCHAR(100) NOT NULL,
    lname VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    branch VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_parents_email ON parents(email);
CREATE INDEX idx_parents_phone ON parents(phone);
CREATE INDEX idx_parents_branch ON parents(branch);
```

#### 3. children
```sql
CREATE TABLE children (
    id SERIAL PRIMARY KEY,
    fname VARCHAR(100) NOT NULL,
    lname VARCHAR(100) NOT NULL,
    gender CHAR(1) NOT NULL CHECK (gender IN ('M', 'F')),
    birthdate DATE,
    program VARCHAR(50) NOT NULL CHECK (program IN ('kindergarten', 'childcare')),
    branch VARCHAR(50) NOT NULL,
    monthly_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    has_discount BOOLEAN DEFAULT false,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_children_branch ON children(branch);
CREATE INDEX idx_children_program ON children(program);
CREATE INDEX idx_children_birthdate ON children(birthdate);
```

#### 4. child_parents (Many-to-Many relationship)
```sql
CREATE TABLE child_parents (
    id SERIAL PRIMARY KEY,
    child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    parent_id INTEGER NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    relationship VARCHAR(50) DEFAULT 'guardian',
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(child_id, parent_id)
);

-- Indexes
CREATE INDEX idx_child_parents_child_id ON child_parents(child_id);
CREATE INDEX idx_child_parents_parent_id ON child_parents(parent_id);
```

#### 5. payments
```sql
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    method VARCHAR(50) NOT NULL CHECK (method IN ('Cash', 'CBE', 'Dashen Bank')),
    notes TEXT,
    category VARCHAR(50) DEFAULT 'tuition',
    branch VARCHAR(50) NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_payments_child_id ON payments(child_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_method ON payments(method);
CREATE INDEX idx_payments_branch ON payments(branch);
CREATE INDEX idx_payments_created_by ON payments(created_by);
```

#### 6. payment_monthly_records
```sql
CREATE TABLE payment_monthly_records (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    month DATE NOT NULL, -- First day of the month
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(payment_id, month)
);

-- Indexes
CREATE INDEX idx_payment_monthly_records_payment_id ON payment_monthly_records(payment_id);
CREATE INDEX idx_payment_monthly_records_child_id ON payment_monthly_records(child_id);
CREATE INDEX idx_payment_monthly_records_month ON payment_monthly_records(month);
```

#### 7. branches
```sql
CREATE TABLE branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    manager_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_branches_name ON branches(name);
CREATE INDEX idx_branches_manager_id ON branches(manager_id);
```

#### 8. payment_info
```sql
CREATE TABLE payment_info (
    id SERIAL PRIMARY KEY,
    registration_fees JSONB NOT NULL DEFAULT '{"kindergarten": 0, "childcare": 0}',
    monthly_fees JSONB NOT NULL DEFAULT '{"kindergarten": 0, "childcare": 0}',
    discounts JSONB NOT NULL DEFAULT '{"kindergarten": 0, "childcare": 0}',
    quarterly_fees JSONB NOT NULL DEFAULT '{"kindergarten": 0, "childcare": 0}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Only one row should exist in this table
-- Insert default values
INSERT INTO payment_info (registration_fees, monthly_fees, discounts, quarterly_fees)
VALUES (
    '{"kindergarten": 500, "childcare": 300}',
    '{"kindergarten": 800, "childcare": 600}',
    '{"kindergarten": 10, "childcare": 10}',
    '{"kindergarten": 2400, "childcare": 1800}'
);
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/login
**Login user**
```json
Request Body:
{
  "email": "string",
  "password": "string"
}

Response:
{
  "access_token": "string",
  "name": "string",
  "email": "string",
  "sub": "string",
  "role": "ADMIN" | "USER"
}
```

### User Management Endpoints

#### GET /api/users
**Fetch all users (Admin only)**
```json
Query Parameters:
- page?: number
- limit?: number
- branch?: string
- role?: "ADMIN" | "USER"

Response:
{
  "data": [User[]],
  "total": number,
  "page": number,
  "limit": number,
  "totalPages": number
}
```

#### POST /api/users
**Create new user (Admin only)**
```json
Request Body:
{
  "email": "string",
  "name": "string",
  "phone": "string",
  "branch": "string",
  "password": "string"
}

Response: User
```

#### PUT /api/users/:id
**Update user information (Admin only)**
```json
Request Body:
{
  "name": "string",
  "email": "string",
  "branch": "string",
  "role": "ADMIN" | "USER"
}

Response: User
```

#### PATCH /api/users/:id/delete
**Soft delete user (Admin only)**

Response: User

#### PATCH /api/users/:id/reset-password
**Reset user password (Admin only)**
```json
Request Body:
{
  "newPassword": "string"
}

Response: User
```

#### PATCH /api/users/:id/role
**Change user role (Admin only)**
```json
Request Body:
{
  "action": "PROMOTE" | "DEMOTE"
}

Response: User
```

### Parent Management Endpoints

#### GET /api/parent
**Fetch parents with pagination**
```json
Query Parameters:
- page?: number
- limit?: number
- search?: string
- branch?: string

Response:
{
  "data": [Parent[]],
  "total": number,
  "page": number,
  "limit": number,
  "totalPages": number
}
```

#### GET /api/parent/:id
**Fetch parent by ID**

Response: Parent

#### POST /api/parent
**Create new parent**
```json
Request Body:
{
  "fname": "string",
  "lname": "string",
  "phone": "string",
  "email": "string",
  "address": "string",
  "occupation": "string",
  "relationship": "guardian" | "mother" | "father" | "sibling" | "other",
  "branch": "string"
}

Response: Parent
```

#### PUT /api/parent/:id
**Update parent information**
```json
Request Body: Partial<Parent>

Response: Parent
```

### Child Management Endpoints

#### GET /api/child
**Fetch children with pagination**
```json
Query Parameters:
- page?: number
- limit?: number
- branch?: string
- program?: "kindergarten" | "childcare"
- parent_id?: number

Response:
{
  "data": [Child[]],
  "total": number,
  "page": number,
  "limit": number,
  "totalPages": number
}
```

#### GET /api/child/:id
**Fetch child by ID**

Response: Child

#### POST /api/child
**Create new child**
```json
Request Body:
{
  "fname": "string",
  "lname": "string",
  "gender": "M" | "F",
  "birthdate": "YYYY-MM-DD",
  "program": "kindergarten" | "childcare",
  "branch": "string",
  "parent_ids": [number[]],
  "has_discount": boolean,
  "discount_percent": number,
  "discount_note": "string"
}

Response: Child
```

#### PUT /api/child/:id
**Update child information**
```json
Request Body: Partial<Child>

Response: Child
```

### Payment Management Endpoints

#### GET /api/payments
**Fetch payments with pagination**
```json
Query Parameters:
- page?: number
- limit?: number
- child_id?: number
- parent_id?: number
- method?: "Cash" | "CBE" | "Dashen Bank"
- startDate?: "YYYY-MM-DD"
- endDate?: "YYYY-MM-DD"
- branch?: string
- order?: "asc" | "desc"

Response:
{
  "data": [Payment[]],
  "total": number,
  "page": number,
  "limit": number,
  "totalPages": number
}
```

#### GET /api/payments/:childId/paid-months
**Fetch paid months for a child**

Response: PaidMonth[]

#### POST /api/payments
**Create new payment**
```json
Request Body:
{
  "child_id": number,
  "total_amount": number,
  "months": ["YYYY-MM-DD"],
  "method": "Cash" | "CBE" | "Dashen Bank",
  "notes": "string"
}

Response:
{
  "payment": Payment,
  "monthly_records": MonthlyRecord[]
}
```

#### DELETE /api/payments/:id
**Delete payment**

Response: { success: boolean }

#### GET /api/payments/export
**Export payments as CSV**
```json
Query Parameters:
- child_id?: number
- parent_id?: number
- method?: string
- startDate?: "YYYY-MM-DD"
- endDate?: "YYYY-MM-DD"
- branch?: string

Response:
{
  "filename": "string",
  "csv": "string"
}
```

#### GET /api/payments/report
**Fetch payment report**
```json
Query Parameters:
- startDate?: "YYYY-MM-DD"
- endDate?: "YYYY-MM-DD"
- branch?: string

Response:
{
  "breakdown": [{"method": "string", "amount": number}],
  "total": number,
  "page": 1,
  "limit": number,
  "totalPages": 1
}
```

#### GET /api/payments/unpaid
**Fetch unpaid children for a specific month**
```json
Query Parameters:
- month: "YYYY-MM-DD" (required)
- page?: number
- limit?: number
- branch?: string

Response:
{
  "total": number,
  "page": number,
  "limit": number,
  "totalPages": number,
  "data": [{
    "id": number,
    "fname": "string",
    "lname": "string",
    "gender": "string",
    "birthdate": "string"
  }]
}
```

### Payment Info Endpoints

#### GET /api/payment-info
**Fetch payment information configuration**
```json
Response:
{
  "registrationFees": {
    "kindergarten": number,
    "childcare": number
  },
  "monthlyFees": {
    "kindergarten": number,
    "childcare": number
  },
  "discounts": {
    "kindergarten": number,
    "childcare": number
  },
  "quarterlyFees": {
    "kindergarten": number,
    "childcare": number
  }
}
```

#### PUT /api/payment-info
**Update payment information configuration**
```json
Request Body:
{
  "registrationFees": {
    "kindergarten": number,
    "childcare": number
  },
  "monthlyFees": {
    "kindergarten": number,
    "childcare": number
  },
  "discounts": {
    "kindergarten": number,
    "childcare": number
  },
  "quarterlyFees": {
    "kindergarten": number,
    "childcare": number
  }
}

Response: PaymentInfoData
```

### Notification Endpoints

#### POST /api/notifications/payment-reminder
**Send payment reminder**
```json
Request Body:
{
  "child_id": number,
  "month": "YYYY-MM-DD",
  "message": "string"
}

Response: { success: boolean }
```

## Database Relationships

```
users (1) ──── (many) branches (manager_id)
users (many) ──── (many) branches (branch field)

parents (many) ──── (many) children (via child_parents)

children (1) ──── (many) payments
children (1) ──── (many) payment_monthly_records

payments (1) ──── (many) payment_monthly_records
payments (many) ──── (1) users (created_by)

branches (1) ──── (many) children
branches (1) ──── (many) parents
branches (1) ──── (many) payments
```

## Security Considerations

1. **Authentication**: JWT tokens with expiration
2. **Authorization**: Role-based access control (ADMIN/USER)
3. **Data Validation**: Input sanitization and validation
4. **SQL Injection**: Use parameterized queries
5. **Soft Deletes**: Maintain data integrity
6. **Audit Trail**: Track changes with created_at/updated_at

## Performance Optimizations

1. **Indexes**: On frequently queried columns
2. **Pagination**: For large datasets
3. **Caching**: For frequently accessed data
4. **Database Constraints**: Foreign keys and check constraints
5. **Query Optimization**: Use EXPLAIN ANALYZE for complex queries

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/fasika_db

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080
```

## Deployment Checklist

- [ ] Database schema created
- [ ] Environment variables configured
- [ ] JWT secret set
- [ ] Admin user created
- [ ] Branches configured
- [ ] CORS configured
- [ ] SSL certificates (production)
- [ ] Database backups scheduled
- [ ] Monitoring and logging set up</content>
<parameter name="filePath">BACKEND_API_DOCUMENTATION.md
