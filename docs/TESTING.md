# Testing Strategy

## Testing Pyramid

```
       /\
      /  \  E2E Tests (10%)
     /____\
    /      \  Integration Tests (30%)
   /________\
  /          \  Unit Tests (60%)
 /____________\
```

SmartSplit follows the testing pyramid approach:
- **60% Unit Tests**: Fast, isolated tests for business logic
- **30% Integration Tests**: API endpoint tests with database
- **10% E2E Tests**: Critical user flows with browser automation

---

## 1. Unit Tests (Jest)

### Backend Unit Tests

#### Setup
```bash
cd backend
npm install --save-dev @nestjs/testing jest ts-jest @types/jest
```

#### Configuration (`jest.config.js`)
```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!**/main.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
```

#### Test: AuthService
```typescript
// src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateGoogleUser', () => {
    it('should create new user if not exists', async () => {
      const googleProfile = {
        id: 'google123',
        emails: [{ value: 'test@example.com' }],
        displayName: 'Test User',
        photos: [{ value: 'https://avatar.url' }],
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue({
        id: 'user123',
        googleId: 'google123',
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'https://avatar.url',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const user = await service.validateGoogleUser(googleProfile);

      expect(user.email).toBe('test@example.com');
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          googleId: 'google123',
          email: 'test@example.com',
          name: 'Test User',
          avatar: 'https://avatar.url',
        },
      });
    });

    it('should return existing user if found', async () => {
      const existingUser = {
        id: 'user123',
        googleId: 'google123',
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'https://avatar.url',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(existingUser);

      const user = await service.validateGoogleUser({
        id: 'google123',
        emails: [{ value: 'test@example.com' }],
        displayName: 'Test User',
        photos: [{ value: 'https://avatar.url' }],
      });

      expect(user).toEqual(existingUser);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('generateJwtToken', () => {
    it('should generate JWT with user ID', () => {
      const userId = 'user123';
      const token = 'jwt.token.here';

      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = service.generateJwtToken(userId);

      expect(result).toBe(token);
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: userId });
    });
  });
});
```

#### Test: Settlement Algorithm
```typescript
// src/settlements/optimize-settlements.spec.ts
import { optimizeSettlements } from './optimize-settlements';

describe('optimizeSettlements', () => {
  it('should return empty array when all balances are zero', () => {
    const balances = [
      { userId: '1', userName: 'Alice', balance: 0 },
      { userId: '2', userName: 'Bob', balance: 0 },
    ];

    const result = optimizeSettlements(balances);

    expect(result).toEqual([]);
  });

  it('should optimize 2-person settlement', () => {
    const balances = [
      { userId: '1', userName: 'Alice', balance: 100 }, // Alice should receive $100
      { userId: '2', userName: 'Bob', balance: -100 }, // Bob owes $100
    ];

    const result = optimizeSettlements(balances);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      fromId: '2',
      fromName: 'Bob',
      toId: '1',
      toName: 'Alice',
      amount: 100,
    });
  });

  it('should minimize transactions for 4-person group', () => {
    const balances = [
      { userId: '1', userName: 'Alice', balance: 150 }, // Alice paid $150 extra
      { userId: '2', userName: 'Bob', balance: -50 }, // Bob owes $50
      { userId: '3', userName: 'Charlie', balance: -50 }, // Charlie owes $50
      { userId: '4', userName: 'Dave', balance: -50 }, // Dave owes $50
    ];

    const result = optimizeSettlements(balances);

    // Should be 3 transactions (not 6)
    expect(result).toHaveLength(3);

    // Verify total amounts
    const totalPaid = result.reduce((sum, t) => sum + t.amount, 0);
    expect(totalPaid).toBe(150);
  });

  it('should handle complex multi-person settlement', () => {
    const balances = [
      { userId: '1', userName: 'Alice', balance: 100 },
      { userId: '2', userName: 'Bob', balance: 50 },
      { userId: '3', userName: 'Charlie', balance: -75 },
      { userId: '4', userName: 'Dave', balance: -75 },
    ];

    const result = optimizeSettlements(balances);

    // Verify all transactions balance out
    const netByUser: Record<string, number> = {};
    result.forEach((t) => {
      netByUser[t.fromId] = (netByUser[t.fromId] || 0) - t.amount;
      netByUser[t.toId] = (netByUser[t.toId] || 0) + t.amount;
    });

    expect(netByUser['1']).toBeCloseTo(100, 2);
    expect(netByUser['2']).toBeCloseTo(50, 2);
    expect(netByUser['3']).toBeCloseTo(-75, 2);
    expect(netByUser['4']).toBeCloseTo(-75, 2);
  });

  it('should handle floating point precision with epsilon', () => {
    const balances = [
      { userId: '1', userName: 'Alice', balance: 33.33 },
      { userId: '2', userName: 'Bob', balance: -33.33 },
    ];

    const result = optimizeSettlements(balances);

    expect(result).toHaveLength(1);
    expect(result[0].amount).toBeCloseTo(33.33, 2);
  });
});
```

#### Run Unit Tests
```bash
npm test
npm run test:cov # With coverage report
```

---

## 2. Integration Tests (Supertest)

### Setup
```bash
npm install --save-dev supertest @types/supertest
```

### Test: Groups API
```typescript
// src/groups/groups.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

describe('GroupsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Clean database
    await prisma.expense.deleteMany();
    await prisma.membership.deleteMany();
    await prisma.group.deleteMany();
    await prisma.user.deleteMany();

    // Create test user and get auth token
    const user = await prisma.user.create({
      data: {
        googleId: 'test-google-id',
        email: 'test@example.com',
        name: 'Test User',
      },
    });

    // Mock JWT token (in real test, use actual JWT service)
    authToken = 'Bearer test-jwt-token';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/groups', () => {
    it('should create a new group', () => {
      return request(app.getHttpServer())
        .post('/api/groups')
        .set('Authorization', authToken)
        .send({ name: 'Test Group' })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.name).toBe('Test Group');
          expect(res.body.data.memberCount).toBe(1);
          expect(res.body.data.role).toBe('OWNER');
        });
    });

    it('should return 400 for missing name', () => {
      return request(app.getHttpServer())
        .post('/api/groups')
        .set('Authorization', authToken)
        .send({})
        .expect(400);
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .post('/api/groups')
        .send({ name: 'Test Group' })
        .expect(401);
    });
  });

  describe('GET /api/groups', () => {
    it('should return paginated groups', () => {
      return request(app.getHttpServer())
        .get('/api/groups?limit=10&page=1')
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.pagination).toHaveProperty('total');
          expect(res.body.pagination).toHaveProperty('totalPages');
        });
    });
  });

  describe('DELETE /api/groups/:id', () => {
    it('should allow OWNER to delete group', async () => {
      const group = await prisma.group.create({
        data: {
          name: 'Delete Test Group',
          memberships: {
            create: {
              userId: 'test-user-id',
              role: 'OWNER',
            },
          },
        },
      });

      return request(app.getHttpServer())
        .delete(`/api/groups/${group.id}`)
        .set('Authorization', authToken)
        .expect(200);
    });

    it('should forbid MEMBER from deleting group', async () => {
      const group = await prisma.group.create({
        data: {
          name: 'Member Test Group',
          memberships: {
            create: {
              userId: 'test-user-id',
              role: 'MEMBER',
            },
          },
        },
      });

      return request(app.getHttpServer())
        .delete(`/api/groups/${group.id}`)
        .set('Authorization', authToken)
        .expect(403);
    });
  });
});
```

#### Run Integration Tests
```bash
npm run test:e2e
```

---

## 3. E2E Tests (Playwright)

### Setup
```bash
cd frontend
npm install --save-dev @playwright/test
npx playwright install
```

### Configuration (`playwright.config.ts`)
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Test: Complete User Flow
```typescript
// e2e/complete-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('SmartSplit E2E Flow', () => {
  test('complete user journey: login → create group → add expense → view settlement', async ({ page }) => {
    // 1. Login
    await page.goto('/');
    await page.click('text=Sign in with Google');
    
    // Mock Google OAuth (use test account in real scenario)
    await page.waitForURL('**/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome back');

    // 2. Create Group
    await page.click('text=Create New Group');
    await page.fill('input[placeholder*="group"]', 'E2E Test Group');
    await page.click('button:has-text("Create")');
    
    await page.waitForURL('**/groups/**');
    await expect(page.locator('h1')).toContainText('E2E Test Group');

    // 3. Add Expense
    await page.click('text=Add Expense');
    await page.selectOption('select', { label: 'E2E Test Group' });
    await page.fill('input[placeholder*="description"]', 'Test Dinner');
    await page.fill('input[type="number"]', '100');
    await page.selectOption('select[required]', 'FOOD');
    await page.click('button:has-text("Create Expense")');

    await page.waitForURL('**/expenses');
    await expect(page.locator('text=Test Dinner')).toBeVisible();

    // 4. View Settlement
    await page.click('text=Settlements');
    await page.selectOption('select', { label: 'E2E Test Group' });
    
    await expect(page.locator('text=Your Balance')).toBeVisible();
    await expect(page.locator('text=$100.00')).toBeVisible();
  });

  test('add member to group', async ({ page }) => {
    await page.goto('/dashboard/groups');
    await page.click('text=E2E Test Group');
    await page.click('text=Add Member');
    await page.fill('input[type="email"]', 'member@example.com');
    await page.click('button:has-text("Add")');

    await expect(page.locator('text=member@example.com')).toBeVisible();
  });

  test('view analytics', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    
    await expect(page.locator('h1')).toContainText('Analytics');
    await expect(page.locator('text=Total Paid')).toBeVisible();
    await expect(page.locator('text=Monthly Spending')).toBeVisible();
  });
});
```

#### Run E2E Tests
```bash
npx playwright test
npx playwright test --ui # Interactive mode
npx playwright show-report # View report
```

---

## 4. Test Coverage Goals

| Component | Target Coverage | Current Status |
|-----------|----------------|----------------|
| Backend Services | 80% | ⏳ To implement |
| Controllers | 70% | ⏳ To implement |
| Settlement Algorithm | 100% | ⏳ To implement |
| Frontend Components | 60% | ⏳ To implement |
| API Integration | 70% | ⏳ To implement |
| E2E Critical Flows | 100% | ⏳ To implement |

---

## 5. Continuous Integration

### GitHub Actions (`ci.yml`)
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm ci
      - run: cd backend && npm run test
      - run: cd backend && npm run test:cov

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm ci
      - run: cd frontend && npm run build
      - run: cd frontend && npx playwright install
      - run: cd frontend && npx playwright test
```

---

## 6. Manual Testing Checklist

### Authentication
- [ ] Google OAuth login redirects correctly
- [ ] JWT token stored in httpOnly cookie
- [ ] Logout clears session
- [ ] Protected routes redirect to login when unauthenticated

### Groups
- [ ] Create group (user becomes OWNER)
- [ ] Add member by email
- [ ] Remove member (only OWNER can)
- [ ] Delete group (only OWNER can)
- [ ] View group details

### Expenses
- [ ] Add expense to group
- [ ] Filter expenses by group/category/date
- [ ] Validate positive amount
- [ ] Only creator can edit/delete expense
- [ ] Pagination works correctly

### Settlements
- [ ] Calculate settlements for group
- [ ] Display net balances (green for creditor, red for debtor)
- [ ] Show optimized transactions
- [ ] Transaction count is minimized

### Analytics
- [ ] Monthly spending bar chart displays correctly
- [ ] Category breakdown pie chart renders
- [ ] User summary shows correct totals
- [ ] Year filter updates data

---

## 7. Performance Testing

### Load Testing with Artillery
```bash
npm install -g artillery
```

#### Configuration (`load-test.yml`)
```yaml
config:
  target: 'https://smartsplit-backend.onrender.com'
  phases:
    - duration: 60
      arrivalRate: 10 # 10 requests/second
  defaults:
    headers:
      Authorization: 'Bearer test-jwt-token'

scenarios:
  - name: 'Get Groups'
    flow:
      - get:
          url: '/api/groups'
  
  - name: 'Create Expense'
    flow:
      - post:
          url: '/api/expenses'
          json:
            description: 'Load Test Expense'
            amount: 50
            category: 'OTHER'
            groupId: 'test-group-id'
```

#### Run Load Test
```bash
artillery run load-test.yml
```

---

## 8. Test Data Generators

### Seed Script for Testing
```typescript
// backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create test users
  const users = await Promise.all(
    ['Alice', 'Bob', 'Charlie', 'Dave'].map((name) =>
      prisma.user.create({
        data: {
          googleId: `test-${name.toLowerCase()}`,
          email: `${name.toLowerCase()}@test.com`,
          name,
        },
      })
    )
  );

  // Create test group
  const group = await prisma.group.create({
    data: {
      name: 'Test Roommates',
      memberships: {
        create: users.map((user, index) => ({
          userId: user.id,
          role: index === 0 ? 'OWNER' : 'MEMBER',
        })),
      },
    },
  });

  // Create test expenses
  await prisma.expense.createMany({
    data: [
      {
        description: 'Groceries',
        amount: 150,
        category: 'GROCERIES',
        payerId: users[0].id,
        groupId: group.id,
      },
      {
        description: 'Dinner',
        amount: 80,
        category: 'FOOD',
        payerId: users[1].id,
        groupId: group.id,
      },
    ],
  });

  console.log('Test data seeded successfully!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

#### Run Seed
```bash
cd backend
npx prisma db seed
```

---

## 9. Testing Best Practices

1. **Write Tests First (TDD)**: For critical business logic like settlement algorithm
2. **Mock External Services**: Prisma, JWT, Google OAuth
3. **Use Test Fixtures**: Reusable test data
4. **Test Edge Cases**: Empty arrays, negative numbers, null values
5. **Clean Database Between Tests**: Use `beforeEach` / `afterEach`
6. **Snapshot Testing**: For complex objects (settlement transactions)
7. **Parallel Execution**: Run tests in parallel for speed
8. **CI/CD Integration**: Fail builds on test failures

---

## 10. Test Maintenance

- **Update Tests with Code Changes**: Keep tests synchronized
- **Review Coverage Reports**: Aim for >80% critical path coverage
- **Refactor Duplicated Test Code**: Extract helper functions
- **Document Test Scenarios**: Add comments for complex tests
- **Regular Test Suite Audits**: Remove obsolete tests

---

## Support

For test setup issues, refer to:
- **Jest**: [jestjs.io](https://jestjs.io/)
- **Playwright**: [playwright.dev](https://playwright.dev/)
- **Supertest**: [github.com/visionmedia/supertest](https://github.com/visionmedia/supertest)
