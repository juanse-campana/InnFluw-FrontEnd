# Code Quality Review Skill

## Description

This skill provides comprehensive code quality reviews for the innfluw-front project. Use this when the user wants to audit, improve, or maintain code quality, architecture, type safety, and adherence to project conventions.

## When to Use

- User asks to "review the code", "check quality", or "refactor"
- Before merging pull requests
- When fixing bugs or adding features
- To maintain consistency across the codebase
- User wants to improve developer experience

## Review Criteria

### Type Safety

1. Verify all components and functions have proper TypeScript types
2. Check for `any` types that should be replaced
3. Verify API responses are properly typed
4. Check for missing type exports
5. Ensure Zod schemas match TypeScript types

### Code Conventions

1. Verify file naming follows AGENTS.md conventions
2. Check component structure matches templates
3. Look for duplicate code that should be extracted
4. Verify consistent import patterns
5. Check for magic numbers/strings that should be constants

### Architecture

1. Verify proper separation of concerns
2. Check if business logic is in the right place (not in components)
3. Look for proper error handling
4. Verify API calls are properly abstracted
5. Check for tight coupling between components

### Security

1. Look for exposed secrets or API keys
2. Check for XSS vulnerabilities in user input
3. Verify proper authentication checks
4. Check for SQL injection in any raw queries
5. Ensure sensitive data is not logged

### Error Handling

1. Verify all API calls have error handling
2. Check for unhandled promise rejections
3. Look for missing try-catch blocks
4. Verify user-friendly error messages
5. Check for proper error boundaries

### Testing Readiness

1. Check if functions are testable (pure functions preferred)
2. Look for hidden dependencies
3. Verify proper mocking points for API calls
4. Check for proper separation of concerns

## Workflow

### 1. Run Linter

First, check for existing issues:

```bash
npm run lint
```

### 2. Type Check

Verify TypeScript compilation:

```bash
npx tsc --noEmit
```

### 3. Scan for Common Issues

Search for anti-patterns and issues:

```bash
# Check for any types
grep -r ": any" src/

# Check for console.log
grep -r "console.log" src/

# Check for TODO/FIXME comments
grep -r "TODO\|FIXME" src/

# Check for duplicate code
grep -r "function\|const.*=" src/ | cut -d: -f1 | sort | uniq -c | sort -rn
```

### 4. Review Specific Areas

Based on the user's request, examine:

- **Components**: Check component quality and reusability
- **API Layer**: Review API client and endpoints
- **Types**: Verify type definitions
- **Store**: Check Zustand store implementation
- **Pages**: Review page-level code

### 5. Provide Findings

Structure findings with:

1. **Type Issues**: Missing or incorrect types
2. **Convention Violations**: Code not following AGENTS.md
3. **Architecture Problems**: Poor separation of concerns
4. **Security Concerns**: Potential vulnerabilities
5. **Quick Fixes**: Easy wins to improve quality

### 6. Implement Fixes (if requested)

1. Start with type fixes
2. Extract duplicated code
3. Add proper error handling
4. Follow the component structure from AGENTS.md
5. Run lint and typecheck after changes

## Code Quality Standards for This Project

### Type Definitions

```typescript
// Good: Proper types from @/types
import type { Drop, Order } from '@/types';
const drop: Drop = { ... };

// Bad: Using any
const drop: any = { ... };

// Bad: Missing types
const drop = { ... };
```

### Component Structure

```typescript
// Follow AGENTS.md template
"use client";

import { Component } from "@/components/ui";
import { useState } from "react";

export default function PageName() {
  const [state, setState] = useState();

  return (
    <div>
      <Component />
    </div>
  );
}
```

### API Error Handling

```typescript
// Good: Proper error handling
try {
  const response = await api.post("/endpoint", data);
  return response.data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    throw new Error(error.response?.data?.message);
  }
  throw error;
}

// Bad: Swallowed errors
try {
  await api.post("/endpoint", data);
} catch {
  // Silent failure
}
```

### Constants

```typescript
// Good: Named constants
const MAX_RETRY_ATTEMPTS = 3;
const API_TIMEOUT = 5000;

// Bad: Magic numbers
if (attempts > 3) { ... }
```

## Key Files to Review

- Types: `src/types/index.ts`
- API Client: `src/lib/api/index.ts`
- Store: `src/lib/store/index.ts`
- Utils: `src/lib/utils.ts`
- UI Components: `src/components/ui/`
- Providers: `src/components/providers/`

## Example Code Quality Report

```markdown
## Code Quality Review Findings

### Type Issues

- [HIGH] 5 instances of `any` type in checkout page
- [MEDIUM] Missing return type on utility functions

### Convention Violations

- [MEDIUM] Component not following AGENTS.md template
- [LOW] Inconsistent file naming in hooks folder

### Architecture Issues

- [HIGH] Business logic in component instead of lib
- [MEDIUM] API calls not abstracted properly

### Security Concerns

- [HIGH] API token exposed in URL parameters
- [LOW] Missing CSRF protection on forms

### Quick Wins

1. Replace `any` types with proper interfaces (HIGH)
2. Extract business logic to utility functions (HIGH)
3. Add proper TypeScript return types (MEDIUM)
4. Move API calls to lib layer (MEDIUM)

### Recommended Actions

1. Type the checkout flow completely
2. Extract validation logic
3. Add error boundaries
4. Create shared constants
```

## Quality Checklist

### Before Any Code Changes

- [ ] Run `npm run lint`
- [ ] Run `npx tsc --noEmit`
- [ ] Check for `any` types
- [ ] Verify error handling

### Component Quality

- [ ] Proper TypeScript types
- [ ] Following component template
- [ ] Proper error handling
- [ ] Accessible markup

### API Layer

- [ ] Proper types for requests/responses
- [ ] Error handling for all calls
- [ ] Proper timeout configuration
- [ ] Centralized in lib/api

### State Management

- [ ] Proper Zustand store typing
- [ ] No prop drilling
- [ ] Proper store updates
