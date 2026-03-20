# Performance Review Skill

## Description

This skill provides comprehensive performance reviews for the innfluw-front project. Use this when the user wants to analyze, optimize, or audit the application's rendering performance, data fetching patterns, and overall speed.

## When to Use

- User asks to "check performance", "optimize speed", or "review loading times"
- Before deployment to production
- When users report slow interactions or lag
- After adding new features or data-heavy pages
- During code reviews for performance impact

## Review Areas

### React Query Optimization

1. Check query keys are properly structured
2. Verify staleTime and cacheTime are configured
3. Look for unnecessary refetches
4. Check if mutations properly invalidate queries
5. Verify loading and error states are handled

### Rendering Performance

1. Identify unnecessary re-renders using React DevTools
2. Check for heavy computations in render (useMemo/useCallback)
3. Verify lists use proper keys
4. Look for large component trees that could be split
5. Check for prop drilling that could use context/zustand

### Data Fetching

1. Verify Suspense boundaries are used
2. Check if pages load only necessary data
3. Look for N+1 query patterns in API calls
4. Verify proper error boundaries
5. Check for duplicate API calls

### Bundle Size

1. Analyze main bundle size
2. Check for heavy dependencies that could be lazy loaded
3. Verify dynamic imports for routes
4. Look for unused code or imports

### Network Performance

1. Check API calls are batched where possible
2. Verify proper use of HTTP methods (GET vs POST)
3. Look for large payloads that could be paginated
4. Check for proper caching headers

## Workflow

### 1. Analyze React Query Usage

Check how data is fetched across the app:

```bash
grep -r "useQuery\|useMutation" src/
```

### 2. Review Critical Pages

Focus on high-traffic pages:

- Dashboard (`src/app/(dashboard)/page.tsx`)
- Drops list (`src/app/(dashboard)/drops/page.tsx`)
- Drop view (`src/app/drops/[id]/view/page.tsx`)
- Checkout (`src/app/checkout/[token]/page.tsx`)

### 3. Check Component Performance

Look for performance anti-patterns:

```bash
grep -r "useState\|useEffect" src/app/
grep -r "console.log" src/
```

### 4. Analyze Bundle

Check for heavy imports and large dependencies:

```bash
grep -r "import.*from" src/ | sort | uniq -c | sort -rn | head -20
```

### 5. Provide Recommendations

Structure findings with:

1. **Query Optimization**: React Query improvements
2. **Render Issues**: Unnecessary re-renders found
3. **Bundle Issues**: Large dependencies or unused code
4. **Network Issues**: Inefficient API calls
5. **Priority**: Rank by impact (High/Medium/Low)

## Performance Best Practices for This Project

### React Query

```typescript
// Good: Specific query keys
const { data } = useQuery({
  queryKey: ["drops", "detail", dropId],
  queryFn: () => dropsApi.getById(dropId),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Bad: Generic query keys
const { data } = useQuery({
  queryKey: ["data"],
  queryFn: dropsApi.getAll,
});
```

### Component Memoization

```typescript
// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => computeExpensiveValue(data), [data]);

// Use useCallback for event handlers passed as props
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

### Dynamic Imports

```typescript
// Lazy load heavy components
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Spinner />,
  ssr: false,
});
```

## Key Files to Review

- Query Provider: `src/components/providers/query-provider.tsx`
- API Client: `src/lib/api/index.ts`
- Store: `src/lib/store/index.ts`
- Dashboard: `src/app/(dashboard)/page.tsx`
- Drops List: `src/app/(dashboard)/drops/page.tsx`

## Example Performance Report

```markdown
## Performance Review Findings

### React Query Issues

- [HIGH] No staleTime configured - causes unnecessary refetches
- [MEDIUM] Query invalidation missing after mutations

### Render Issues

- [MEDIUM] Expensive calculation in Drops list render
- [LOW] Missing useMemo for formatted currency

### Bundle Issues

- [HIGH] Large icon import - use tree-shakeable imports
- [MEDIUM] Date library could be replaced with native Intl

### Recommendations

1. Add staleTime to all queries (HIGH)
2. Memoize expensive calculations (MEDIUM)
3. Use dynamic imports for charts (MEDIUM)
4. Configure proper SSR settings (LOW)
```

## Quick Wins Checklist

- [ ] Add `staleTime` to all useQuery calls
- [ ] Wrap lists in React.memo
- [ ] Lazy load below-the-fold content
- [ ] Remove console.log statements
- [ ] Configure proper React Query defaults
- [ ] Use proper loading skeletons
