# UI/UX Review Skill

## Description

This skill provides comprehensive UI/UX reviews for the innfluw-front project. Use this when the user wants to review, improve, or audit the visual design, accessibility, and user experience of the application.

## When to Use

- User asks to "review the UI", "check the design", or "improve UX"
- Before major UI changes or redesigns
- After adding new components or pages
- When user reports usability issues
- Before any visual changes are committed

## Review Criteria

### Visual Consistency

1. Check if all pages follow the same visual language
2. Verify consistent use of colors, spacing, and typography
3. Ensure buttons, inputs, and cards look uniform across the app
4. Check that the design system (from AGENTS.md) is followed

### Component Usage

1. Verify all UI components come from `@/components/ui`
2. Check proper usage of component props and variants
3. Look for duplicate or redundant components
4. Ensure components are properly exported from `index.ts`

### Accessibility

1. All interactive elements must be keyboard accessible
2. Form inputs must have associated labels
3. Color contrast should be sufficient (WCAG AA minimum)
4. Images and icons should have alt text where needed
5. Focus states should be visible

### Responsiveness

1. Test layouts at mobile, tablet, and desktop breakpoints
2. Verify tables are scrollable on small screens
3. Check that cards and grids adapt properly
4. Ensure the sidebar is usable on all screen sizes

### User Experience

1. Loading states are shown during data fetching
2. Error states are clear and actionable
3. Empty states guide the user
4. Forms have inline validation feedback
5. Navigation is intuitive and consistent

## Workflow

### 1. Scan the Project

Run this command to get an overview of the UI structure:

```
ls -la src/components/ui/
ls -la src/app/(dashboard)/
```

### 2. Review Specific Areas

Based on the user's request, examine:

- **Pages**: Review the page structure and layout
- **Components**: Check component implementation and usage
- **Styling**: Verify Tailwind classes are used correctly
- **Responsiveness**: Test with different viewport sizes

### 3. Provide Findings

Structure your review with:

1. **Visual Consistency**: List any inconsistencies found
2. **Component Issues**: Note improper usage or missing components
3. **Accessibility Problems**: Detail any a11y violations
4. **UX Improvements**: Suggest actionable improvements
5. **Priority**: Rank issues by impact (High/Medium/Low)

### 4. Implement Fixes (if requested)

1. Make minimal, focused changes
2. Test changes don't break existing functionality
3. Verify with lint command: `npm run lint`
4. Follow the component structure from AGENTS.md

## Example Review Output

```markdown
## UI/UX Review Findings

### Visual Consistency

- [HIGH] Inconsistent button variants on /drops page
- [MEDIUM] Card padding varies between dashboard sections

### Accessibility

- [HIGH] Missing labels on search inputs
- [MEDIUM] Low contrast on error messages

### UX Improvements

- [LOW] Add skeleton loaders for better perceived performance
- [MEDIUM] Improve empty states with illustrations

### Recommended Actions

1. Fix missing form labels (HIGH)
2. Standardize card padding (MEDIUM)
3. Add loading skeletons (LOW)
```

## Key Files

- UI Components: `src/components/ui/`
- Dashboard Layout: `src/app/(dashboard)/layout.tsx`
- Sidebar: `src/components/layout/sidebar.tsx`
- Global Styles: `src/app/globals.css`
