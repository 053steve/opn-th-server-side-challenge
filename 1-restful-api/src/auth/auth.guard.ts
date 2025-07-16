import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // Mock authentication - check for Bearer token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const token = authHeader.substring(7).trim(); // Remove 'Bearer ' prefix and trim whitespace

    // Mock token validation - in real implementation, this would verify JWT
    if (!token || token === 'faketoken_user1') {
      // For demo purposes, we'll accept the mock token
      // In a real implementation, you would verify the JWT here
      request.user = { id: 'user1', email: 'user@example.com' };
      return true;
    }

    throw new UnauthorizedException('Invalid token');
  }
}
