# Backend Folder Structure

This folder contains all backend-related code organized for the OdooTeams project with Supabase integration.

## 📁 Structure

```
src/backend/
├── services/           # Business logic and data operations
│   ├── auth.service.ts        # Authentication & user management
│   ├── content.service.ts     # Content CRUD (services, projects, etc.)
│   ├── contact.service.ts     # Contact form handling
│   └── analytics.service.ts   # Page views & analytics
├── types/             # TypeScript type definitions
│   └── database.ts           # Database types from Supabase
├── utils/             # Helper utilities
│   ├── validation.ts         # Input validation schemas
│   ├── permissions.ts        # Permission checking functions
│   └── helpers.ts           # General helper functions
└── index.ts           # Main export file
```

## 🔒 Security Features

- **Role-Based Access Control (RBAC)**: Admin and User roles with separate permissions
- **Row Level Security (RLS)**: All tables protected with Supabase RLS policies
- **Input Validation**: Zod schemas for all user inputs
- **Secure Authentication**: Built-in Supabase Auth with proper session handling

## 🎯 Services Overview

### AuthService
Handles user authentication, registration, and role management:
- `signUp()` - Register new users
- `signIn()` - User login
- `signOut()` - User logout
- `hasRole()` - Check user roles
- `isAdmin()` - Check admin status
- `updateProfile()` - Update user profile

### ContentService
Manages all content types (services, projects, learn resources, etc.):
- CRUD operations for all content tables
- Active/inactive filtering
- Featured content management
- Bilingual content support (English & Arabic)

### ContactService
Handles contact form submissions:
- `submitContact()` - Public form submission
- `getAllSubmissions()` - Admin view of submissions
- `updateSubmission()` - Update submission status
- `assignToAdmin()` - Assign to admin user
- `markAsResolved()` - Close submission

### AnalyticsService
Tracks and reports analytics data:
- `trackPageView()` - Record page visits
- `getPageViews()` - Admin analytics view
- `getStatistics()` - Generate statistics

## 📊 Database Tables

- **profiles** - User profiles (email, name, avatar, etc.)
- **user_roles** - User role assignments (admin/user)
- **services** - Odoo services offered
- **projects** - Portfolio projects
- **learn_resources** - Educational content
- **faqs** - Frequently asked questions
- **chatbot_responses** - Chatbot Q&A data
- **team_members** - Team information
- **contact_submissions** - Contact form entries
- **testimonials** - Client reviews
- **timeline_events** - Company timeline
- **page_views** - Analytics tracking

## 🌐 Bilingual Support

All content tables support both English and Arabic:
```typescript
{
  title_en: "English Title",
  title_ar: "العنوان بالعربية",
  category_en: "Category",
  category_ar: "الفئة"
}
```

## 🛡️ Permission Helpers

```typescript
import { isAdmin, requireAuth, canEdit } from '@/backend';

// Check if user is admin
const admin = await isAdmin();

// Require authentication (throws if not logged in)
const userId = await requireAuth();

// Check if user can edit resource
const allowed = await canEdit(resourceCreatorId);
```

## ✅ Validation

```typescript
import { validateData, contactFormSchema } from '@/backend';

const result = validateData(contactFormSchema, formData);
if (!result.success) {
  console.error(result.errors);
}
```

## 🚀 Usage Examples

### Fetch Services
```typescript
import { ContentService } from '@/backend';

const { data: services, error } = await ContentService.getServices();
```

### Submit Contact Form
```typescript
import { ContactService } from '@/backend';

const { data, error } = await ContactService.submitContact({
  full_name: "John Doe",
  email: "john@example.com",
  message: "Hello!"
});
```

### Check User Role
```typescript
import { AuthService } from '@/backend';

const isUserAdmin = await AuthService.isAdmin();
```

## 📝 Next Steps

1. **Implement Authentication UI** - Create login/signup pages
2. **Build Admin Dashboard** - Content management interface
3. **Migrate from Google Sheets** - Move existing data to Supabase
4. **Connect Services to Components** - Update frontend to use new services
5. **Add File Storage** - Setup Supabase storage for images

## 🔗 Resources

- [Supabase Dashboard](https://supabase.com/dashboard/project/eflevjjteuxhqkwqecvv)
- [Database Schema](#) (see migration files)
- [RLS Policies](#) (defined in migration)
