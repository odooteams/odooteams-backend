# OdooTeams Backend Documentation

## 🗄️ Database Schema Overview

This project uses Supabase as the backend database with a comprehensive schema for managing:
- User authentication and role-based access control
- Content management (Services, Projects, Learn Resources)
- Community features (FAQs, Testimonials, Timeline)
- Analytics and tracking
- Contact form submissions

## 📁 Backend Structure

```
src/lib/supabase/
├── types.ts       # TypeScript type definitions for all tables
├── queries.ts     # Public query functions for fetching data
├── admin.ts       # Admin-only operations (CRUD for content)
├── auth.ts        # Authentication helper functions
└── index.ts       # Main export file
```

## 🔐 Security Model

### Row Level Security (RLS)
All tables have RLS enabled with the following access patterns:

**Public Access (Everyone):**
- View active services, projects, learn resources
- View active FAQs, testimonials, timeline events
- View team members
- Submit contact forms
- Track page analytics

**Authenticated Users:**
- View their own profile
- View their own roles
- Update their own profile

**Admin Users Only:**
- Create, update, delete all content
- View and manage contact submissions
- View all users and manage roles
- Access analytics dashboard

### User Roles
- `admin`: Full access to content management and user administration
- `user`: Default role, can view public content

## 🚀 Usage Examples

### For Client-Side (Public Access)

```typescript
import { servicesQueries, projectsQueries } from '@/lib/supabase';

// Fetch all active services
const services = await servicesQueries.getAll('en');

// Get featured projects
const featuredProjects = await projectsQueries.getFeatured();

// Submit contact form
const submission = await contactQueries.create({
  full_name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  message: 'I need help with...'
});
```

### For Admin Panel

```typescript
import { adminQueries, contentManagement } from '@/lib/supabase';

// Check if user is admin
const isAdmin = await adminQueries.isAdmin();

if (isAdmin) {
  // Create new service
  await contentManagement.createService({
    title_en: 'New Service',
    title_ar: 'خدمة جديدة',
    category_en: 'Odoo',
    category_ar: 'أودو',
    details_en: 'Service description',
    details_ar: 'وصف الخدمة',
    is_featured: true,
    is_active: true
  });

  // Get all contact submissions
  const submissions = await contentManagement.getContactSubmissions();

  // Update submission status
  await contactQueries.updateStatus(submissionId, 'in_progress', 'Following up');
}
```

### Authentication

```typescript
import { authHelpers } from '@/lib/supabase';

// Sign up
await authHelpers.signUp('user@example.com', 'password123', {
  full_name: 'John Doe',
  phone: '+1234567890',
  company: 'Acme Corp'
});

// Sign in
await authHelpers.signIn('user@example.com', 'password123');

// Get current user
const user = await authHelpers.getCurrentUser();

// Update profile
await authHelpers.updateProfile(user.id, {
  full_name: 'John Smith',
  avatar_url: 'https://...'
});
```

## 📊 Database Tables

### Core Tables

1. **profiles** - User profile information
2. **user_roles** - Role assignments (admin/user)
3. **services** - Service offerings
4. **projects** - Portfolio projects
5. **learn_resources** - Educational content
6. **faqs** - Frequently asked questions
7. **chatbot_responses** - Chatbot Q&A data
8. **team_members** - Team member profiles
9. **contact_submissions** - Contact form submissions
10. **testimonials** - Client testimonials
11. **timeline_events** - Company timeline/milestones
12. **page_views** - Analytics tracking

### Multilingual Support

Most content tables include both English and Arabic fields:
- `title_en` / `title_ar`
- `description_en` / `description_ar`
- `category_en` / `category_ar`

## 🔧 Database Functions

### `has_role(user_id, role)`
Security definer function to check if a user has a specific role.
Used in RLS policies to control access.

### `handle_new_user()`
Trigger function that automatically:
- Creates a profile entry
- Assigns default 'user' role
- Runs when a new user signs up

### `update_updated_at_column()`
Trigger function that automatically updates the `updated_at` timestamp
on all content tables when records are modified.

## 🎯 Next Steps

### For Developers

1. **Migrate from Google Sheets**: Update hooks and components to use Supabase queries instead of Google Sheets API
2. **Build Admin Dashboard**: Create admin interface for content management
3. **Implement Authentication**: Add login/signup pages and protected routes
4. **Test RLS Policies**: Verify that non-admin users cannot access admin operations

### For Admins

1. **Create Admin User**: Run SQL to grant admin role to your user:
   ```sql
   INSERT INTO user_roles (user_id, role) 
   VALUES ('your-user-id', 'admin');
   ```

2. **Populate Initial Data**: Use admin functions to add:
   - Services from Google Sheets
   - Projects portfolio
   - Team members
   - FAQs and learning resources

## 🔗 Supabase Dashboard Links

- [Database Tables](https://supabase.com/dashboard/project/eflevjjteuxhqkwqecvv/editor)
- [Authentication Users](https://supabase.com/dashboard/project/eflevjjteuxhqkwqecvv/auth/users)
- [SQL Editor](https://supabase.com/dashboard/project/eflevjjteuxhqkwqecvv/sql/new)
- [Database Functions](https://supabase.com/dashboard/project/eflevjjteuxhqkwqecvv/database/functions)

## 📝 Important Notes

- ⚠️ **First Admin**: You'll need to manually insert the first admin user via SQL
- 🔒 **Security**: Never expose admin operations on client-side, always verify roles server-side
- 🌐 **Multilingual**: Always provide both EN and AR content for proper display
- 📊 **Analytics**: Page view tracking is automatic when using the analytics helper
