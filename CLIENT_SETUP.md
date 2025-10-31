# Client Website Setup Guide

Quick reference for setting up a client Next.js website to use this CMS.

## Quick Start

### 1. Copy API Client

Copy `src/utilities/apiClient.ts` to your client project:

```bash
# In your client project
mkdir -p lib
cp /path/to/cms/src/utilities/apiClient.ts lib/payload-client.ts
```

### 2. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_PAYLOAD_URL=https://cms.yourdomain.com
```

### 3. Create Client Helper

Create `lib/payload-client.ts`:

```ts
import { createPayloadClient, getBaseUrl } from './apiClient'

export function getPayloadClient(hostname?: string) {
  return createPayloadClient({
    baseUrl: getBaseUrl(),
    tenantDomain: hostname,
  })
}
```

### 4. Use in Your Pages

```tsx
// app/page.tsx
import { headers } from 'next/headers'
import { getPayloadClient } from '@/lib/payload-client'

export default async function HomePage() {
  const headersList = await headers()
  const hostname = headersList.get('host') || ''
  
  const client = getPayloadClient(hostname)
  const result = await client.getPage('home')
  const page = result.docs[0]
  
  return <h1>{page.title}</h1>
}
```

## Common Patterns

### Fetch Single Page

```ts
const client = getPayloadClient(hostname)
const result = await client.getPage('about')
const page = result.docs[0]
```

### Fetch All Pages

```ts
const client = getPayloadClient(hostname)
const result = await client.getPages()
const pages = result.docs
```

### Fetch Media

```ts
const client = getPayloadClient(hostname)
const result = await client.getMediaFiles()
const media = result.docs
```

### With Error Handling

```ts
try {
  const result = await client.getPage('about')
  // Use result.docs[0]
} catch (error) {
  // Handle error (show 404, fallback, etc.)
  notFound()
}
```

## Tenant Detection

### Domain-Based (Automatic)

The client automatically detects tenant from hostname:

```ts
const client = getPayloadClient(hostname) // hostname from headers
```

### Slug-Based (Manual)

If using path-based routing:

```ts
const client = createPayloadClient({
  baseUrl: getBaseUrl(),
  tenantSlug: 'client-slug',
})
```

## TypeScript Types

Generate types from CMS:

```bash
# In CMS project
npm run generate:types

# Copy payload-types.ts to client project
cp src/payload-types.ts /path/to/client/types/
```

Then use:

```ts
import type { Page } from '@/types/payload-types'
const page: Page = result.docs[0]
```

## Deployment

### Per-Client Environment Variables

Set in your deployment platform:

- `NEXT_PUBLIC_PAYLOAD_URL`: CMS URL
- `TENANT_SLUG` (optional): If using slug-based routing

### Domain Configuration

1. Point client domain to your hosting
2. Ensure CMS has client domain in tenant settings
3. Set `allowPublicRead` if public access needed

## Examples

See `examples/client-site-example.tsx` for complete examples.

