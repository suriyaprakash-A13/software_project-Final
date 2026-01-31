import { IsEmail, IsNotEmpty, IsString, IsOptional, IsUrl } from 'class-validator';

export class GoogleUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  googleId: string;

  @IsUrl()
  @IsOptional()
  avatar?: string;
}

export class LoginResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    createdAt: Date;
  };
}
