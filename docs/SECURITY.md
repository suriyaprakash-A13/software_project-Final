# Security Best Practices

## Authentication & Authorization

### 1. Google OAuth 2.0
- **No Password Storage**: Eliminates password-related vulnerabilities (breaches, weak passwords)
- **Google Handles Security**: Benefit from Google's security infrastructure
- **Scope Limitation**: Only request `profile` and `email` scopes

```typescript
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['profile', 'email'], // Minimal scopes
    });
  }
}
```

### 2. JWT Stateless Validation
- **No Database Hit Per Request**: Validates token signature only
- **Short Expiry**: 24-hour token lifetime
- **httpOnly Cookies**: Prevents XSS attacks from stealing tokens

```typescript
// Set httpOnly cookie
res.cookie('access_token', jwt, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
});
```

### 3. JWT Payload Minimization
- **Only Store User ID**: Avoid sensitive data in token
```typescript
const payload = { sub: user.id }; // Only user ID
const token = this.jwtService.sign(payload);
```

### 4. Role-Based Access Control (RBAC)
- **Group Ownership Guards**: Only OWNER can delete/update group
- **Expense Creator Guards**: Only creator can edit/delete expense
- **Membership Verification**: Can't add expenses to groups you're not in

```typescript
@Injectable()
export class GroupOwnerGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    const groupId = request.params.id;
    
    const membership = await this.prisma.membership.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });
    
    return membership?.role === 'OWNER';
  }
}
```

## Input Validation

### 1. Class Validator
- **DTO Validation**: All request bodies validated with decorators
- **Whitelist Approach**: Strip unknown properties
- **Forbid Non-whitelisted**: Throw error if unknown properties present

```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true, // Strip unknown properties
  forbidNonWhitelisted: true, // Throw error on unknown properties
  transform: true, // Auto-transform to DTO types
}));
```

### 2. Positive Number Validation
```typescript
export class CreateExpenseDto {
  @IsPositive()
  @IsNumber()
  amount: number; // Must be > 0
  
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  description: string;
}
```

### 3. Email Validation
```typescript
@IsEmail()
userEmail: string;
```

### 4. Enum Validation
```typescript
@IsEnum(ExpenseCategory)
category: ExpenseCategory; // Only allowed values
```

## Rate Limiting

### 1. Throttler Module
- **100 Requests per 15 Minutes per IP**: Prevents brute force attacks
```typescript
ThrottlerModule.forRoot([{
  ttl: 900000, // 15 minutes
  limit: 100,
}]),
```

### 2. Custom Rate Limits for Sensitive Endpoints
```typescript
@Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 per minute
@Post('login')
async login() { ... }
```

## CORS Configuration

### 1. Whitelist Frontend URL Only
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL, // Only allow your frontend
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### 2. Production CORS
```typescript
// .env.production
FRONTEND_URL=https://smartsplit.vercel.app
```

## Security Headers

### 1. Helmet Middleware
- **XSS Protection**: `X-XSS-Protection: 1; mode=block`
- **Content Security Policy**: Restrict resource loading
- **HSTS**: Force HTTPS
- **No Sniffing**: `X-Content-Type-Options: nosniff`

```typescript
import helmet from '@fastify/helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

## SQL Injection Prevention

### 1. Prisma Parameterized Queries
- **Automatic Parameterization**: Prisma prevents SQL injection by default
```typescript
// Safe - Prisma uses parameterized queries
await this.prisma.user.findUnique({
  where: { email: userInput }, // Automatically escaped
});
```

### 2. No Raw SQL Queries
- **Avoid `$executeRaw`**: Only use when absolutely necessary with `$executeRawUnsafe` validation

## XSS Prevention

### 1. React Automatic Escaping
- **JSX Escapes by Default**: React escapes all user input
```typescript
<p>{expense.description}</p> // Automatically escaped
```

### 2. Avoid `dangerouslySetInnerHTML`
- **Never use unless absolutely necessary**: Sanitize with DOMPurify if required

### 3. httpOnly Cookies
- **JavaScript Can't Access**: Prevents XSS attacks from stealing JWT
```typescript
res.cookie('access_token', jwt, {
  httpOnly: true, // Can't be accessed by JavaScript
});
```

## CSRF Protection

### 1. SameSite Cookies
```typescript
res.cookie('access_token', jwt, {
  sameSite: 'strict', // Only sent with same-site requests
});
```

### 2. CORS Restrictions
- **Only Allow Frontend URL**: Prevents unauthorized origins

## Data Privacy

### 1. Password-less Authentication
- **No Passwords Stored**: Google handles authentication

### 2. Minimal User Data
- **Only Store Essential Fields**: id, googleId, name, email, avatar
- **No Sensitive Data**: No SSN, credit cards, etc.

### 3. Group Data Isolation
- **Membership Checks**: Users can only access groups they're members of
```typescript
const membership = await this.prisma.membership.findUnique({
  where: { userId_groupId: { userId, groupId } },
});

if (!membership) {
  throw new ForbiddenException('Not a member of this group');
}
```

## Environment Variables

### 1. Never Commit Secrets
```gitignore
.env
.env.local
.env.production
```

### 2. Use Strong Secrets
```bash
# Generate secure JWT secret (256-bit)
openssl rand -base64 32
```

### 3. Rotate Secrets Regularly
- **JWT Secret**: Rotate every 6 months
- **Google OAuth Credentials**: Regenerate if compromised

## Logging & Monitoring

### 1. Log Sensitive Operations
```typescript
this.logger.warn(`Failed login attempt from IP: ${ip}`);
this.logger.error(`Unauthorized access attempt to group ${groupId} by user ${userId}`);
```

### 2. Don't Log Sensitive Data
- **Never Log**: Passwords, tokens, full credit cards
- **Redact**: Email addresses in production logs

### 3. Monitor Failed Auth Attempts
- **Alert on Threshold**: >10 failed logins from single IP in 5 minutes

## Deployment Security

### 1. HTTPS Only
- **Force HTTPS**: Set `secure: true` for cookies in production
- **HSTS Header**: Force browsers to use HTTPS

### 2. Environment Separation
- **Development**: `NODE_ENV=development`
- **Production**: `NODE_ENV=production`

### 3. Database Security
- **AWS RDS/PlanetScale**: Encrypted at rest
- **VPC**: Database not publicly accessible
- **Connection Pooling**: Prevent connection exhaustion

### 4. Secrets Management
- **Vercel**: Environment variables in dashboard
- **Render**: Environment variables in settings
- **Never hardcode**: Use `process.env.*`

## Security Checklist

- [x] Google OAuth 2.0 (no password storage)
- [x] JWT with httpOnly cookies (XSS prevention)
- [x] 24-hour JWT expiry (short-lived tokens)
- [x] Rate limiting (100 req/15min)
- [x] CORS whitelist (only frontend URL)
- [x] Helmet security headers
- [x] Input validation (class-validator)
- [x] Parameterized queries (Prisma)
- [x] Role-based access control (OWNER/MEMBER guards)
- [x] Membership verification (group access checks)
- [x] Positive number validation (amount > 0)
- [x] SameSite cookies (CSRF prevention)
- [x] No sensitive data logging
- [x] HTTPS enforcement (production)
- [x] Environment variable separation
- [x] Database encryption (AWS RDS/PlanetScale)
