# Integration Guide: Using Multi-Tenant CMS as Backend for Client Websites

This guide explains how to integrate your Next.js client websites with this multi-tenant Payload CMS.

## Architecture Overview

```
┌─────────────────┐
│  Client Site 1  │──┐
│  (client1.com)  │  │
└─────────────────┘  │
                      ├──► Payload CMS (Multi-Tenant)
┌─────────────────┐  │    ┌──────────────┐
│  Client Site 2  │──┘    │   Tenant 1   │
│  (client2.com)  │       │   Tenant 2   │
└─────────────────┘       │   Tenant 3   │
                          └──────────────┘
```

Each client website connects to the same Payload CMS instance, but only accesses data scoped to their tenant.

## Setup Steps

### 1. Configure Your CMS Instance

#### Add Client Tenants

In the Payload admin panel (`/admin`), create a tenant for each client:

- **Name**: Client name (e.g., "Acme Corp")
- **Slug**: Unique identifier (e.g., "acme-corp")
- **Domain**: Client's domain (e.g., "acme.com")
- **allowPublicRead**: Check this if you want public API access

#### Environment Variables

In your CMS `.env` file, ensure you have:

```env
PAYLOAD_SECRET=your-secret-key
POSTGRES_URL=your-database-url
# For CORS (comma-separated list of allowed origins)
ALLOWED_ORIGINS=https://client1.com,https://client2.com,https://client3.com
```

### 2. Set Up Your Client Next.js Website

#### Install Dependencies

In your client Next.js project:

```bash
npm install
# No additional dependencies needed - uses native fetch
```

#### Environment Variables

Create `.env.local` in your client project:

```env
# URL of your Payload CMS instance
NEXT_PUBLIC_PAYLOAD_URL=https://cms.yourdomain.com

# Optional: If using domain-based tenant detection
NEXT_PUBLIC_TENANT_DOMAIN=client1.com
```

#### Copy API Client Utility

Copy `src/utilities/apiClient.ts` to your client project, or install it as a shared package.

### 3. Integration Patterns

#### Pattern 1: Domain-Based Tenant Detection (Recommended)

Best for: Each client has their own domain

**Server Component Example:**

```tsx
// app/page.tsx
import { createClientWithTenant } from '@/lib/payload-client'
import { headers } from 'next/headers'

export default async function HomePage() {
  const headersList = await headers()
  const hostname = headersList.get('host') || ''
  
  const client = createClientWithTenant(hostname)
  
  try {
    const { docs } = await client.getPages()
    const homePage = docs.find(page => page.slug === 'home')
    
    if (!homePage) {
      return <div>Page not found</div>
    }
    
    return (
      <div>
        <h1>{homePage.title}</h1>
        {/* Render your content */}
      </div>
    )
  } catch (error) {
    console.error('Failed to fetch page:', error)
    return <div>Error loading page</div>
  }
}
```

**API Route Example:**

```tsx
// app/api/pages/route.ts
import { createClientWithTenant } from '@/lib/payload-client'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const headersList = await headers()
  const hostname = headersList.get('host') || ''
  
  const client = createClientWithTenant(hostname)
  
  try {
    const result = await client.getPages()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    )
  }
}
```

#### Pattern 2: Slug-Based Tenant Detection

Best for: All clients under one domain with path-based routing

**Example:**

```tsx
// app/[tenant]/page.tsx
import { createPayloadClient } from '@/lib/payload-client'

export default async function TenantPage({
  params,
}: {
  params: { tenant: string }
}) {
  const client = createPayloadClient({
    baseUrl: process.env.NEXT_PUBLIC_PAYLOAD_URL!,
    tenantSlug: params.tenant,
  })
  
  const { docs } = await client.getPages()
  // ... render pages
}
```

#### Pattern 3: Client-Side Fetching

For client components or static generation:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { createPayloadClient } from '@/lib/payload-client'

export function PageList() {
  const [pages, setPages] = useState([])
  
  useEffect(() => {
    const client = createPayloadClient({
      baseUrl: process.env.NEXT_PUBLIC_PAYLOAD_URL!,
      tenantSlug: 'client-slug', // or use tenantDomain
    })
    
    client.getPages().then((result) => {
      setPages(result.docs)
    })
  }, [])
  
  return (
    <ul>
      {pages.map((page) => (
        <li key={page.id}>{page.title}</li>
      ))}
    </ul>
  )
}
```

### 4. Fetching Content

#### Get a Single Page

```tsx
const client = createPayloadClient({
  baseUrl: 'https://cms.yourdomain.com',
  tenantSlug: 'client-slug',
})

const result = await client.getPage('about')
const page = result.docs[0]
```

#### Get All Pages

```tsx
const result = await client.getPages()
const pages = result.docs
```

#### Get Media Files

```tsx
// Get all media for tenant
const result = await client.getMediaFiles()

// Get specific media by ID
const media = await client.getMedia(123)
```

#### Get Tenant Info

```tsx
const result = await client.getTenant()
const tenant = result.docs[0]
```

### 5. CORS Configuration

The CMS already has an open CORS policy, but you can restrict it in production:

Update `payload.config.ts`:

```ts
export default buildConfig({
  // ... other config
  cors: process.env.ALLOWED_ORIGINS?.split(',') || '*',
})
```

### 6. Authentication (Optional)

If you need authenticated API access for preview/editing:

```tsx
// Login endpoint
const response = await fetch(`${CMS_URL}/api/users/external-users/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'user@example.com',
    password: 'password',
    tenantSlug: 'client-slug',
  }),
})

const { token, user } = await response.json()

// Use token in subsequent requests
const client = createPayloadClient({
  baseUrl: CMS_URL,
  tenantSlug: 'client-slug',
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
```

### 7. Error Handling

Always wrap API calls in try-catch:

```tsx
try {
  const result = await client.getPage('about')
  // Handle success
} catch (error) {
  console.error('API Error:', error)
  // Handle error (show 404, fallback content, etc.)
}
```

### 8. TypeScript Types

Generate Payload types and use them in your client project:

```bash
# In CMS project
npm run generate:types

# Copy payload-types.ts to your client project
# Or share via npm package
```

Then use types:

```tsx
import type { Page } from '@/types/payload-types'

const page: Page = await client.getPage('about')
```

## Best Practices

1. **Use Server Components**: Fetch data in server components when possible for better performance
2. **Cache API Responses**: Use Next.js caching strategies:
   ```tsx
   const result = await client.getPages({
     cache: 'force-cache', // or 'no-store' for dynamic
   })
   ```
3. **Handle Loading States**: Show loading UI while fetching
4. **Error Boundaries**: Wrap your app in error boundaries
5. **SEO**: Use server-side rendering for public pages
6. **Security**: Never expose CMS credentials in client code

## Deployment Considerations

### CMS Deployment
- Deploy CMS to a domain like `cms.yourdomain.com`
- Set up SSL certificate
- Configure CORS for production domains
- Set up database backups

### Client Site Deployment
- Each client site can be deployed independently
- Set `NEXT_PUBLIC_PAYLOAD_URL` environment variable
- Use domain-based tenant detection for automatic scoping

## Example: Complete Page Component

```tsx
// app/page.tsx
import { createClientWithTenant } from '@/lib/payload-client'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Page as PageType } from '@/types/payload-types'

export default async function HomePage() {
  const headersList = await headers()
  const hostname = headersList.get('host') || ''
  
  const client = createClientWithTenant(hostname)
  
  try {
    const result = await client.getPage('home')
    const page = result.docs[0] as PageType | undefined
    
    if (!page) {
      notFound()
    }
    
    return (
      <main>
        <h1>{page.title}</h1>
        {page.description && <p>{page.description}</p>}
        {page.featuredImage && (
          <img 
            src={typeof page.featuredImage === 'string' 
              ? page.featuredImage 
              : page.featuredImage.url} 
            alt={page.title}
          />
        )}
        {/* Render rich text content */}
      </main>
    )
  } catch (error) {
    console.error('Failed to load page:', error)
    notFound()
  }
}
```

## Support

For questions or issues:
- Check Payload CMS docs: https://payloadcms.com/docs
- Review multi-tenant plugin docs
- Check the example code in this repository

