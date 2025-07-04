# MongoDB Authentication Setup Guide

This guide will help you set up the new MongoDB-based authentication system for the MJD Price Matching application.

## Overview

The authentication system has been completely migrated from Supabase to a custom MongoDB + JWT solution with the following features:

- **User Registration**: Users can request access with email/password
- **Admin Approval**: Admins must approve new user requests
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: User and Admin roles
- **Account Security**: Failed login protection, account locking
- **Password Management**: Secure password hashing with bcrypt

## Prerequisites

1. **MongoDB Database**: Either local MongoDB or MongoDB Atlas
2. **Node.js**: Version 16 or higher
3. **Environment Variables**: Properly configured `.env` file

## Quick Start

1. **Install MongoDB** (local or use MongoDB Atlas)
2. **Configure environment variables** in `server/.env`
3. **Install dependencies**: `cd server && npm install`
4. **Create admin user**: `npm run create-admin`
5. **Start server**: `npm run dev`
6. **Test system**: `node test-mongodb-auth.js`

## Environment Configuration

Copy `server/env.example` to `server/.env` and update:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/mjd-auth

# JWT Configuration (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Admin User
ADMIN_EMAIL=admin@mjd.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Administrator

# Server
PORT=3001
NODE_ENV=development
```

## API Endpoints

### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh tokens
- `GET /auth/me` - Get profile
- `POST /auth/logout` - Logout

### Admin (Requires Admin Role)

- `GET /auth/admin/pending` - Get pending users
- `POST /auth/admin/approve/:userId` - Approve user
- `POST /auth/admin/reject/:userId` - Reject user

## User Flow

1. **Registration**: User submits access request with email/password
2. **Approval**: Admin approves/rejects in dashboard
3. **Login**: Approved user can login with original password
4. **Access**: User gets JWT tokens and accesses system

## Security Features

- Bcrypt password hashing (cost 12)
- Account lockout after 5 failed attempts
- Rate limiting on auth endpoints
- Short-lived access tokens (15min)
- Long-lived refresh tokens (7 days)
- Role-based authorization

## Troubleshooting

**MongoDB Connection Issues:**

- Check `MONGODB_URI` format
- Ensure MongoDB service is running
- Verify database permissions

**JWT Token Issues:**

- Use strong `JWT_SECRET` (32+ chars)
- Check token expiration handling
- Verify frontend token storage

**Authentication Flow:**

- Check user `status` is `'active'`
- Verify user `role` permissions
- Review server logs for errors

## Production Notes

- Use HTTPS in production
- Strong JWT secret (32+ characters)
- Secure MongoDB with authentication
- Monitor failed login attempts
- Regular security updates

For detailed information, see the full documentation sections above.
