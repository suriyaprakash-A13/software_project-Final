import { Controller, Get, Req, Res, UseGuards, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Initiates Google OAuth flow
   * Redirects user to Google consent screen
   */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {
    // Guard handles the redirect
  }

  /**
   * Google OAuth callback
   * Receives authorization code and exchanges it for user profile
   * Stores user in session and redirects to frontend
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const googleUser = req.user as any;

    // Validate/create user
    const user = await this.authService.validateGoogleUser(googleUser);

    // Store user in session
    req.session.userId = user.id;

    // Redirect to frontend dashboard
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    res.redirect(`${frontendUrl}/dashboard?login=success`);
  }

  /**
   * Returns current authenticated user profile
   */
  @Get('me')
  @UseGuards(SessionAuthGuard)
  async getCurrentUser(@CurrentUser('id') userId: string) {
    const user = await this.authService.getUserById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Logout endpoint - destroys session
   */
  @Get('logout')
  @UseGuards(SessionAuthGuard)
  async logout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      res.status(HttpStatus.OK).json({ message: 'Logged out successfully' });
    });
  }
}
