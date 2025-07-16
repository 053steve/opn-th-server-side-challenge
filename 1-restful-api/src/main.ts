import { NestFactory } from '@nestjs/core';
import { ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global validation pipe with custom error handling
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      errorHttpStatusCode: 422,
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          const constraints = error.constraints;
          return Object.values(constraints).join(', ');
        });

        return new HttpException(
          {
            statusCode: 422,
            message: messages,
            error: 'Unprocessable Entity',
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      },
    }),
  );

  // Global exception filter for consistent error responses
  app.useGlobalFilters();

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('RESTful API')
    .setDescription(
      `
      A comprehensive RESTful API for user management and authentication.
      
      ## Features
      - **User Management**: Complete CRUD operations for users
      - **Authentication**: Signup, login, refresh token, and password change
      - **Authorization**: JWT-based authentication with mock bearer token support
      - **Validation**: Comprehensive input validation with detailed error responses
      - **Documentation**: Complete Swagger/OpenAPI documentation
      
      ## Authentication
      For testing purposes, use the mock bearer token:
      \`\`\`
      Authorization: Bearer faketoken_user1
      \`\`\`
      
      ## Error Responses
      All endpoints return consistent error responses with appropriate HTTP status codes:
      - **422**: Validation errors with detailed field-specific messages
      - **401**: Unauthorized (missing or invalid token)
      - **404**: Resource not found
      - **409**: Conflict (e.g., email already exists)
      - **500**: Internal server error
    `,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token (use "faketoken_user1" for testing)',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Users', 'User management endpoints (all require authentication)')
    .addTag('Health', 'Health check and system status endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true,
      docExpansion: 'none',
    },
    customSiteTitle: 'RESTful API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #3b4151; }
      .swagger-ui .info .description { font-size: 14px; line-height: 1.5; }
    `,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(
    `📚 Swagger documentation is available at: http://localhost:${port}/api`,
  );
  console.log(`🔑 For testing, use Authorization: Bearer faketoken_user1`);
}
bootstrap();
