# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev        # Start development server (default port 3000)
npm run build      # Build for production
npm start          # Run production server
npm run lint       # Run ESLint checks
```

## Architecture Overview

This is a Next.js 15 project management system with Supabase backend, featuring a monochrome design aesthetic. The application uses App Router and follows a modular architecture.

### Core Technology Stack
- **Next.js 15.5.0** with App Router
- **React 19.1.0** with TypeScript
- **Supabase** for database and authentication
- **Tailwind CSS** with custom monochrome theme
- **Zustand** for state management
- **React Hook Form + Zod** for form validation

### Database Structure

The application uses Supabase with these main tables:
- `profiles` - User profiles with roles (admin/manager/member)
- `clients_v2` - Client information (using v2 due to RLS issues)
- `projects_v2` - Projects with financial tracking
- `tasks_v2` - Task management with hierarchical structure
- `users_v2` - User authentication data

**Important:** The system currently uses v2 tables to bypass RLS issues. When creating new features, use the v2 tables.

### Key Architectural Patterns

1. **Authentication Flow**
   - Middleware at `/middleware.ts` handles route protection
   - Unauthenticated users redirect to `/auth/login`
   - Authenticated users redirect from root to `/dashboard`

2. **Supabase Client Pattern**
   - Browser client: `lib/supabase/client.ts`
   - Server client: `lib/supabase/server.ts`
   - Always use the appropriate client based on context

3. **Form Handling Pattern**
   - Forms use React Hook Form with Zod validation
   - Form components are in `/components/forms/`
   - Each form has a corresponding schema in the component file

4. **State Management**
   - Global state via Zustand stores in `/lib/store/`
   - Loading states use LoadingProvider context
   - Local component state with useState

### Design System

The application uses a strict monochrome color palette:
- **Black**: Primary text and important elements
- **White**: Backgrounds
- **Gray shades**: Secondary elements (gray-100 to gray-900)
- **No colors**: Avoid using colored elements (red, green, blue, etc.)

UI components follow this hierarchy:
- Custom UI components in `/components/ui/`
- Layout components in `/components/layout/`
- Page-specific components kept in page files

### Common Issues and Solutions

1. **Clients Table Status Field Error**
   - Problem: "record 'new' has no field 'status'" error
   - Solution: Use `/supabase/final-fix-clients.sql` to clean triggers
   - The `clients.ts` file already excludes status field

2. **Build Warnings**
   - Webpack cache warnings are non-critical
   - Can be ignored during development

3. **Vercel Deployment**
   - Requires Supabase environment variables in Vercel dashboard
   - Auth pages must use `export const dynamic = 'force-dynamic'`

### File Organization

```
/app/               # Next.js App Router pages
/components/        # Reusable React components
/lib/               # Utilities and business logic
  /supabase/       # Database queries and client setup
  /store/          # Zustand stores
  /utils/          # Helper functions
/public/           # Static assets and PWA files
/supabase/         # SQL migrations and fixes
```

### Testing Approach

Currently no automated tests. When implementing:
- Unit tests for utility functions
- Integration tests for Supabase operations
- Component testing for critical UI elements

### Important Notes

- Always check authentication state before database operations
- Use Japanese text for UI labels (project is for Japanese market)
- Maintain monochrome design - no colored elements
- Follow existing patterns for consistency
- Tables use _v2 suffix to avoid RLS issues