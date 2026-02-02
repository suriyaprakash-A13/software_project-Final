import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import helmet from 'helmet';

const expressApp = express();
let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      { logger: ['error', 'warn'] }
    );

    // Global prefix
    app.setGlobalPrefix('api');

    // Middleware
    app.use(helmet());
    app.use(cookieParser());
    app.use(
      session({
        secret: process.env.SESSION_SECRET || 'fallback-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          secure: true,
          maxAge: 24 * 60 * 60 * 1000,
          sameSite: 'none',
        },
      }),
    );

    // CORS
    app.enableCors({
      origin: process.env.FRONTEND_URL || '*',
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    });

    // Validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();
  }
  return app;
}

export default async (req: any, res: any) => {
  await bootstrap();
  expressApp(req, res);
};
