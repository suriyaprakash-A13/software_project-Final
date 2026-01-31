import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleUserDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Validates or creates a user from Google OAuth data
   * @param googleUser - User data from Google OAuth
   * @returns User profile
   */
  async validateGoogleUser(googleUser: GoogleUserDto) {
    // Upsert user (create if not exists, update if exists)
    const user = await this.prisma.user.upsert({
      where: { googleId: googleUser.googleId },
      update: {
        name: googleUser.name,
        avatar: googleUser.avatar,
      },
      create: {
        email: googleUser.email,
        name: googleUser.name,
        googleId: googleUser.googleId,
        avatar: googleUser.avatar,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
  }

  /**
   * Fetches user by ID (used by session guard)
   * @param userId - User UUID
   * @returns User or null
   */
  async getUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
      },
    });
  }
}
