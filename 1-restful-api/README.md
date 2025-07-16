# RESTful API

A NestJS RESTful API for user management and authentication.

## Installation

1. Navigate to the project directory:
   ```bash
   cd 1-restful-api
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

## Available Scripts

### Development

```bash
# Start the application in development mode with hot reload
pnpm start:dev

# Start the application in debug mode
pnpm start:debug

# Start the application in production mode
pnpm start:prod
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage report
pnpm test:cov

# Run tests in debug mode
pnpm test:debug

# Run end-to-end tests
pnpm test:e2e

```

### Code Quality

```bash
# Format code with Prettier
pnpm format

# Lint code with ESLint
pnpm lint

# Build the application
pnpm build
```

## Quick Start

To start the application in development mode:
```bash
pnpm start:dev
```

To run tests:
```bash
pnpm test
```

The application will be available at `http://localhost:3000` and includes Swagger documentation at `http://localhost:3000/api`.

Postman collection will be in `1-restful-api/postman_collections/1-Restful-api-postman-collection.postman_collection.json`
