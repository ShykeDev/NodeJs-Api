# API Testing Examples

## Authentication Endpoints

## 1. Login as Admin
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

## 2. Get Profile (using token from login)
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 3. Change Password
```bash
curl -X PUT http://localhost:3000/auth/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "admin123",
    "newPassword": "newpassword123",
    "confirmPassword": "newpassword123"
  }'
```

## 4. Update Profile
```bash
curl -X PUT http://localhost:3000/auth/update-profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Updated Admin Name",
    "email": "newemail@example.com"
  }'
```

## 5. Refresh Token
```bash
curl -X POST http://localhost:3000/auth/refresh-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 6. Verify Token
```bash
curl -X GET http://localhost:3000/auth/verify-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 7. Check Permissions
```bash
curl -X POST http://localhost:3000/auth/check-permissions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "resource": "BOOKS",
    "action": "CREATE"
  }'
```

## 8. Logout
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 9. Forgot Password (Placeholder)
```bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com"
  }'
```

## Role and Permission Management

## 10. Get All Permissions
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

## 2. Get Profile (using token from login)
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 10. Get All Permissions
```bash
curl -X GET http://localhost:3000/permissions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 11. Get All Roles
```bash
curl -X GET http://localhost:3000/permissions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 11. Get All Roles
```bash
curl -X GET http://localhost:3000/roles \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 12. Create a New User (Admin only)
```bash
curl -X GET http://localhost:3000/roles \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 12. Create a New User (Admin only)
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "librarian1",
    "email": "librarian@example.com",
    "password": "password123",
    "fullName": "Library Assistant",
    "roleIds": ["ROLE_ID_FOR_LIBRARIAN"]
  }'
```

## 13. Get All Users
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "librarian1",
    "email": "librarian@example.com",
    "password": "password123",
    "fullName": "Library Assistant",
    "roleIds": ["ROLE_ID_FOR_LIBRARIAN"]
  }'
```

## 13. Get All Users
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Book Management

## 14. Create a Book (requires CREATE_BOOKS permission)
```bash
curl -X POST http://localhost:3000/books \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "isbn": "B005",
    "title": "Node.js Best Practices",
    "author": "John Doe",
    "year": 2023,
    "category": "Programming"
  }'
```

## 15. Get Books (requires READ_BOOKS permission)
```bash
curl -X GET http://localhost:3000/books \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 16. Create a Custom Role
```bash
curl -X POST http://localhost:3000/roles \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CONTENT_EDITOR",
    "description": "Can create and edit books but not delete",
    "permissionIds": ["PERMISSION_ID_READ_BOOKS", "PERMISSION_ID_CREATE_BOOKS", "PERMISSION_ID_UPDATE_BOOKS"]
  }'
```

## 17. Update User Roles
```bash
curl -X PUT http://localhost:3000/users/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "roleIds": ["NEW_ROLE_ID"],
    "isActive": true
  }'
```

## Complete Authentication Flow Examples

### Example 1: Complete User Registration and Login Flow
```bash
# 1. Login as admin
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}')

ADMIN_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

# 2. Create a new user
curl -X POST http://localhost:3000/auth/register \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'

# 3. Login as the new user
USER_LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}')

USER_TOKEN=$(echo $USER_LOGIN_RESPONSE | jq -r '.token')

# 4. Check user's permissions
curl -X POST http://localhost:3000/auth/check-permissions \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"resource": "BOOKS", "action": "CREATE"}'
```

### Example 2: Password Change Flow
```bash
# 1. Login
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

# 2. Change password
curl -X PUT http://localhost:3000/auth/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword456",
    "confirmPassword": "newpassword456"
  }'

# 3. Try to login with old password (should fail)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# 4. Login with new password (should succeed)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "newpassword456"}'
```

## Testing Different Permission Levels

### As USER role (read-only):
- Can access: GET /books, GET /books/:isbn, GET /books/search, etc.
- Cannot access: POST /books, PUT /books/:isbn, DELETE /books/:isbn

### As LIBRARIAN role:
- Can access: All book read operations + create and update books
- Cannot access: DELETE /books/:isbn, user management, role management

### As ADMIN role:
- Can access: All book operations + user management
- Cannot access: Some system-level operations (depending on permissions)

### As SUPER_ADMIN role:
- Can access: Everything

## Error Examples

### Without authentication:
```bash
curl -X GET http://localhost:3000/books
# Returns: 401 Unauthorized
```

### With insufficient permissions:
```bash
# Login as USER, then try to create a book
curl -X POST http://localhost:3000/books \
  -H "Authorization: Bearer USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isbn": "B006", "title": "Test", "author": "Test", "year": 2023, "category": "Test"}'
# Returns: 403 Forbidden
```
