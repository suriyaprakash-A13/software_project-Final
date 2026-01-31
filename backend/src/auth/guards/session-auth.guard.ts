import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    if (!request.session || !request.session.userId) {
      throw new UnauthorizedException('Not authenticated');
    }
    
    // Attach userId to request for use in decorators
    request.user = { id: request.session.userId };
    
    return true;
  }
}
