# RESTful API Documentation

This is a RESTful API built with NestJS that provides user management and authentication functionality.

## Features

- **User Management**: CRUD operations for users
- **Authentication**: Signup, login, refresh token, and password change
- **Authorization**: JWT-based authentication with mock bearer token support
- **Validation**: Comprehensive input validation with proper error responses
- **Documentation**: Swagger/OpenAPI documentation

## API Endpoints

### Authentication
- `POST /auth/signup` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/change-password` - Change user password (requires authentication)

### Users
- `GET /users` - Get all users (requires authentication)
- `GET /users/profile` - Get current user profile (requires authentication)
- `GET /users/:id` - Get user by ID (requires authentication)
- `POST /users` - Create a new user (requires authentication)
- `PATCH /users/:id` - Update user (requires authentication)
- `DELETE /users/:id` - Delete user (requires authentication)

### Health Check
- `GET /` - Health check endpoint

## Authentication

The API uses JWT-based authentication. For testing purposes, you can use the mock bearer token: 