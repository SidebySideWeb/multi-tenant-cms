# Multi-Tenant Payload CMS

A production-ready, multi-tenant Content Management System built with Payload CMS and Next.js. Designed for managing multiple client websites from a single CMS instance.

## 🎯 Overview

This CMS allows you to:
- Manage multiple client websites from one admin panel
- Automatically create tenants with pre-populated content
- Use template-based page structures for quick client onboarding
- Deploy frontend sites independently while sharing one CMS backend

## ✨ Features

- **Multi-Tenancy**: Domain-based and slug-based tenant routing
- **Template System**: Pre-defined page templates for different site types
- **Automation Scripts**: Create tenants and frontend projects automatically
- **Flexible Content**: Conditional fields based on page types
- **Media Management**: Supabase Storage integration for file uploads
- **Access Control**: Role-based permissions (super-admin, tenant-admin, tenant-viewer)
- **PostgreSQL Database**: Scalable Supabase PostgreSQL backend
- **API Client**: Ready-to-use utilities for frontend integration

## 🏗️ Architecture

```
multi-tenant-cms/          (This repo - CMS Backend)
├── src/
│   ├── collections/        (Tenants, Pages, Users, Media)
│   ├── templates/         (Page template definitions)
│   ├── utilities/         (API clients, helpers)
│   └── payload.config.ts  (Main configuration)
└── scripts/               (Automation scripts)

ftiaxesite/                (Frontend - Separate repo)
└── Connects to CMS via API
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or 20+
- PostgreSQL database (Supabase recommended)
- Supabase Storage account (for media files)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SidebySideWeb/multi-tenant-cms.git
   cd multi-tenant-cms
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database
   POSTGRES_URL=postgresql://...
   
   # Storage (Supabase)
   S3_ENDPOINT=https://...
   S3_BUCKET_NAME=...
   S3_ACCESS_KEY_ID=...
   S3_SECRET_ACCESS_KEY=...
   S3_REGION=us-east-1
   
   # Payload
   PAYLOAD_SECRET=your-secret-key
   ALLOWED_ORIGINS=*
   ```

4. **Run migrations**
   ```bash
   pnpm seed
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Access admin panel**
   - Open: http://localhost:3000/admin
   - Create your first super-admin user

## 📋 Usage

### Creating a New Tenant

#### Option 1: Via Admin Panel
1. Go to **Tenants** → **Create New**
2. Fill in:
   - **Name**: Client name
   - **Slug**: URL slug (e.g., "mitsos")
   - **Template**: Select template (e.g., "ftiaxesite")
   - **Domain**: Optional (e.g., "mitsos.localhost")
3. Click **Save**
4. ✅ Pages are automatically created!

#### Option 2: Via Automation Script
```bash
# 1. Create frontend project
pnpm tsx scripts/1-create-frontend-project.ts mitsos

# 2. Add your V0.app template code to ../mitsos/

# 3. Generate template definition
pnpm tsx scripts/2-generate-template.ts mitsos

# 4. Import template in src/templates/index.ts

# 5. Create tenant
pnpm tsx scripts/3-create-tenant.ts mitsos "Mitsos Site" mitsos

# 6. Generate documentation
pnpm tsx scripts/4-generate-docs.ts mitsos mitsos
```

### Managing Content

1. **Access CMS**: http://localhost:3000/admin
2. **Filter by tenant**: Use tenant filter in Pages collection
3. **Edit pages**: Click on any page to edit content
4. **Upload media**: Go to Media collection, upload files

### Frontend Integration

Frontend sites connect to the CMS via REST API:

```typescript
import { createClientWithTenant } from '@/lib/payload-client'

const client = createClientWithTenant(hostname)
const page = await client.getPage('home')
```

See `ftiaxesite` project for complete integration example.

## 📚 Documentation

- **[WORKFLOW_GUIDE.md](./WORKFLOW_GUIDE.md)** - Complete workflow for creating tenants
- **[TENANT_TEMPLATE_SYSTEM.md](./TENANT_TEMPLATE_SYSTEM.md)** - Template system overview
- **[REMOTE_CMS_SETUP.md](./REMOTE_CMS_SETUP.md)** - Connecting scripts to deployed CMS
- **[SUPABASE_DATABASE_SETUP.md](./SUPABASE_DATABASE_SETUP.md)** - Database configuration
- **[SUPABASE_STORAGE_SETUP.md](./SUPABASE_STORAGE_SETUP.md)** - Storage configuration
- **[ENV_VARIABLES.md](./ENV_VARIABLES.md)** - Environment variables reference

## 🎨 Templates

### Available Templates

- **ftiaxesite** - Landing page template with hero, features, process, contact, and footer sections

### Adding New Templates

When you convert a V0.app template:

1. Create template definition in `src/templates/index.ts`
2. Add template option in `src/collections/Tenants/index.ts`
3. Frontend project will use the template structure

See **[TEMPLATE_INTEGRATION_TEMPLATE.md](../TEMPLATE_INTEGRATION_TEMPLATE.md)** for details.

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server

# Build
pnpm build            # Build for production
pnpm start            # Start production server

# Payload
pnpm payload          # Run Payload CLI commands
pnpm generate:importmap # Generate admin import map
pnpm generate:types   # Generate TypeScript types

# Database
pnpm seed             # Run migrations
pnpm seed:fresh       # Drop database and recreate (⚠️ destructive)
```

### Project Structure

```
src/
├── collections/          # Payload collections
│   ├── Tenants/         # Tenant management
│   ├── Pages/           # Page content
│   ├── Users/           # User management
│   └── Media/           # Media files
├── templates/            # Page template definitions
├── utilities/            # Helper functions
│   ├── populateTenantPages.ts  # Auto-populate pages
│   └── remotePayloadClient.ts # API client for scripts
├── access/              # Access control functions
└── payload.config.ts    # Main configuration

scripts/                 # Automation scripts
├── 1-create-frontend-project.ts
├── 2-generate-template.ts
├── 3-create-tenant.ts
└── 4-generate-docs.ts
```

## 🌐 Deployment

### Deploy CMS to Production

1. **Deploy to Vercel/Railway/Render**
2. **Set environment variables** in hosting platform
3. **Run migrations**: `pnpm seed` (first time only)
4. **Configure CORS**: Set `ALLOWED_ORIGINS` with your frontend domains

### Connect Frontend Sites

Each frontend site needs:
```env
NEXT_PUBLIC_PAYLOAD_URL=https://your-cms-domain.com
```

## 🔐 Access Control

### Roles

- **super-admin**: Full access to all tenants
- **tenant-admin**: Manage content for assigned tenants
- **tenant-viewer**: Read-only access to assigned tenants

### Creating Users

1. Go to **Users** → **Create New**
2. Assign **Roles** and **Tenants**
3. User can log in and manage their tenant content

## 📦 Collections

### Tenants
- Name, slug, domain
- Template selection
- Public read access control

### Pages
- **Standard Pages**: Simple content pages
- **Landing Pages**: Full sections (header, hero, features, process, contact, footer)
- **Blog Posts**: Article structure
- **Custom**: Custom structure

### Media
- File uploads via Supabase Storage
- Alt text for accessibility
- Tenant-isolated

### Users
- Email/password authentication
- Role-based access
- Multi-tenant assignments

## 🛠️ Troubleshooting

See **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** for common issues and solutions.

## 📝 License

MIT

## 🤝 Contributing

This is a private project for managing client websites. For questions or issues, contact the project maintainer.

## 🔗 Related Projects

- **ftiaxesite** - Example frontend site: https://github.com/SidebySideWeb/ftiaxesite
- **Payload CMS** - https://payloadcms.com
- **Next.js** - https://nextjs.org

---

**Built with ❤️ for managing multiple client websites efficiently**
