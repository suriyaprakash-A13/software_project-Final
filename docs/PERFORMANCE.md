# Performance Optimizations

## Frontend Optimizations

### 1. Code Splitting
- **Dynamic Imports**: Use Next.js 14 App Router automatic code splitting
- **Route-based Splitting**: Each page is loaded on-demand
```typescript
// Lazy load heavy components
const AnalyticsDashboard = dynamic(() => import('./AnalyticsDashboard'), {
  loading: () => <Spinner />
});
```

### 2. Image Optimization
- **Next.js Image Component**: Automatic optimization, lazy loading, WebP conversion
```typescript
import Image from 'next/image';

<Image
  src={user.avatar}
  alt={user.name}
  width={32}
  height={32}
  className="rounded-full"
/>
```

### 3. React Query Caching
- **Stale Time**: 30 seconds prevents unnecessary refetches
- **Cache Invalidation**: Strategic `invalidateQueries` after mutations
```typescript
const { data } = useQuery({
  queryKey: ['groups'],
  queryFn: groupsApi.getAll,
  staleTime: 30000, // 30s
});
```

### 4. Debounced Search
- **Search Inputs**: 300ms debounce to reduce API calls
```typescript
const debouncedSearch = useMemo(
  () => debounce((value) => setSearch(value), 300),
  []
);
```

### 5. Pagination
- **Cursor-based Pagination**: For large datasets (>1000 records)
- **Limit Controls**: Default 20 items per page

### 6. Optimistic Updates
- **Instant UI Feedback**: Update UI before server confirms
```typescript
const mutation = useMutation({
  mutationFn: expensesApi.create,
  onMutate: async (newExpense) => {
    // Cancel queries & snapshot
    await queryClient.cancelQueries({ queryKey: ['expenses'] });
    const previous = queryClient.getQueryData(['expenses']);
    
    // Optimistically update
    queryClient.setQueryData(['expenses'], (old) => [...old, newExpense]);
    
    return { previous };
  },
  onError: (err, newExpense, context) => {
    // Rollback on error
    queryClient.setQueryData(['expenses'], context.previous);
  },
});
```

## Backend Optimizations

### 1. Prisma Connection Pooling
```typescript
// prisma/schema.prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  connectionLimit = 10 // Limit concurrent connections
}
```

### 2. Query Optimization
- **Select Only Needed Fields**: Reduce payload size
```typescript
const user = await this.prisma.user.findUnique({
  where: { id },
  select: { id: true, name: true, email: true }, // No avatar if not needed
});
```

- **Indexed Queries**: All foreign keys and frequently queried fields have indexes
```prisma
@@index([userId, groupId]) // Composite index for membership checks
@@index([groupId, createdAt]) // Index for sorted expense queries
```

### 3. Pagination
- **Cursor-based Pagination**: For large datasets
```typescript
const expenses = await this.prisma.expense.findMany({
  take: limit,
  skip: (page - 1) * limit,
  where: filters,
  orderBy: { createdAt: 'desc' },
});
```

### 4. Settlement Algorithm Pre-aggregation
- **Calculate Net Balances Once**: O(n) aggregation before O(n log n) algorithm
```typescript
// Calculate net balances in single pass
const netBalances = expenses.reduce((acc, expense) => {
  acc[expense.payerId] = (acc[expense.payerId] || 0) + expense.amount;
  return acc;
}, {});

// Then run optimized settlement algorithm
const settlements = optimizeSettlements(netBalances);
```

### 5. Lazy Loading
- **Compute Settlements On-Demand**: Only calculate when requested (not on every expense creation)

### 6. Rate Limiting
- **Throttle Module**: 100 requests per 15 minutes per IP
```typescript
ThrottlerModule.forRoot([{
  ttl: 900000, // 15 minutes in ms
  limit: 100,
}]),
```

## Database Optimizations

### 1. Indexes
```prisma
// User table
@@index([email])
@@unique([googleId])

// Membership table
@@unique([userId, groupId]) // Composite unique prevents duplicates
@@index([groupId]) // Fast group member lookups

// Expense table
@@index([groupId, createdAt]) // Sorted queries by group
@@index([payerId]) // Fast payer lookups
@@index([groupId, category]) // Category filtering
```

### 2. Decimal Type for Money
- **Avoid Floating Point Errors**: Use `@db.Decimal(10,2)`
```prisma
amount Decimal @db.Decimal(10,2)
```

### 3. Connection Pooling
- **AWS RDS/PlanetScale**: Built-in connection pooling
- **Prisma Data Proxy**: For serverless environments

## Monitoring

### 1. Logging Interceptor
- **Track Response Times**: Log slow queries (>1s)
```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - start;
        if (responseTime > 1000) {
          this.logger.warn(`Slow query: ${responseTime}ms`);
        }
      }),
    );
  }
}
```

### 2. Database Query Logging
```typescript
// Enable in development
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

## Performance Targets

- **Login**: <2 seconds (OAuth redirect + JWT generation)
- **Group Creation**: <1 second (single INSERT query)
- **Expense List**: <500ms (paginated with indexes)
- **Settlement Calculation**: <2 seconds for 100 expenses (O(n log n))
- **Analytics Query**: <1 second (aggregation with date filters)

## Profiling Tools

- **Chrome DevTools**: Network tab, Performance tab
- **React DevTools Profiler**: Identify unnecessary re-renders
- **Prisma Studio**: Visualize database queries
- **New Relic / Datadog**: Production monitoring (optional)
