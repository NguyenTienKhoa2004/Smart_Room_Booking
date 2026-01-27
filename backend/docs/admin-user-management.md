# Admin User Management Implementation

## Overview
Implemented a complete admin user management system with the following features:
- Get all users with pagination
- Get user by ID
- Ban/Unban users
- Email notifications for ban/unban actions
- User statistics

## Files Created/Modified

### 1. Service Layer
**File:** `backend/src/services/adminUser.service.ts`
- `getAllUsers(page, limit)` - Get paginated list of users
- `getUserById(userId)` - Get detailed user information
- `banUser(userId)` - Ban a user and send email notification
- `unbanUser(userId)` - Unban a user and send email notification
- `getUserStats()` - Get user statistics (total, banned, active, admin users)

### 2. Controller Layer
**File:** `backend/src/controllers/adminUser.controller.ts`
- `getAllUsers` - GET /api/v1/admin/users
- `getUserById` - GET /api/v1/admin/users/:id
- `banUser` - PUT /api/v1/admin/users/:id/ban
- `unbanUser` - PUT /api/v1/admin/users/:id/unban
- `getUserStats` - GET /api/v1/admin/users/stats

### 3. Email Service
**File:** `backend/src/services/email.service.ts`
Added two new methods:
- `sendBanNotification(email, fullName)` - Notify user when banned
- `sendUnbanNotification(email, fullName)` - Notify user when unbanned

### 4. Routes
**File:** `backend/src/routes/admin/adminUser.routes.ts`
Updated to use the AdminUserController with proper endpoints

### 5. Database Schema
**Files:**
- `backend/schema.sql` - Added `is_banned` column to users table
- `backend/migrations/add_is_banned_to_users.sql` - Migration script
- `backend/src/scripts/migrate-add-is-banned.ts` - Migration runner

### 6. Type Definitions
**File:** `backend/src/types/user.types.ts`
- Added `is_banned` field to User and UserResponse interfaces

## API Endpoints

### Get All Users
```
GET /api/v1/admin/users?page=1&limit=10
```
**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10, max: 100) - Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "total": 50,
    "page": 1,
    "totalPages": 5
  },
  "message": "Users retrieved successfully"
}
```

### Get User by ID
```
GET /api/v1/admin/users/:id
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user",
    "is_banned": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "message": "User retrieved successfully"
}
```

### Ban User
```
PUT /api/v1/admin/users/:id/ban
```
**Features:**
- Prevents admin from banning themselves
- Sends email notification to banned user
- Updates user status in database

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user",
    "is_banned": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "message": "User banned successfully"
}
```

### Unban User
```
PUT /api/v1/admin/users/:id/unban
```
**Features:**
- Sends email notification to unbanned user
- Updates user status in database

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user",
    "is_banned": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "message": "User unbanned successfully"
}
```

### Get User Statistics
```
GET /api/v1/admin/users/stats
```
**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 100,
    "bannedUsers": 5,
    "activeUsers": 95,
    "adminUsers": 3
  },
  "message": "User statistics retrieved successfully"
}
```

## Database Migration

To add the `is_banned` column to existing database, run:

```bash
npm run ts-node src/scripts/migrate-add-is-banned.ts
```

Or manually execute the SQL:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_users_is_banned ON users (is_banned);
UPDATE users SET is_banned = false WHERE is_banned IS NULL;
```

## Security Features

1. **Authentication Required:** All admin routes require authentication
2. **Admin Authorization:** All routes require admin role
3. **Self-Ban Prevention:** Admins cannot ban themselves
4. **Input Validation:** All user IDs and pagination parameters are validated
5. **Error Handling:** Comprehensive error handling with appropriate status codes

## Next Steps

1. Run the database migration to add the `is_banned` column
2. Test the endpoints with an admin account
3. Implement frontend UI for user management
4. Consider adding:
   - Ban reason field
   - Ban duration (temporary bans)
   - Activity logs for admin actions
   - Bulk ban/unban operations
