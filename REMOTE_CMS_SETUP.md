# CMS Connection Setup for Local Scripts

This guide explains how automation scripts connect to Payload CMS.

**Default:** Scripts connect directly to your database (Supabase PostgreSQL), which is accessible from your local machine. No special setup needed!

**Optional:** If you need to connect to a deployed Payload CMS via API instead, see "Remote API Connection" below.

## 🎯 Overview

**Default Setup (Recommended):**
- **Scripts run locally** on your machine
- **Database is accessible** from your local machine (Supabase PostgreSQL)
- **Scripts connect directly** to the database via `getPayload({ config })`
- ✅ **No special configuration needed!**

**Optional Remote API Setup:**
- **Scripts run locally** on your machine
- **CMS is deployed** online (Vercel, Railway, etc.)
- **Scripts connect via API** to the deployed CMS
- Only needed if you can't access the database directly

## 🔧 Setup

### Default: Direct Database Connection (Recommended)

**No setup needed!** Scripts automatically connect to your Supabase PostgreSQL database using the connection string in your `.env` file.

Just make sure your `.env` has:
```env
POSTGRES_URL=postgresql://...  # Your Supabase connection string
PAYLOAD_SECRET=your-secret-key
```

That's it! Scripts will connect directly to the database.

---

### Optional: Remote API Connection

Only use this if you can't access the database directly (e.g., database is behind a firewall).

#### 1. Deploy Payload CMS First

Deploy your multi-tenant Payload CMS to production (Vercel, Railway, etc.).

#### 2. Configure Environment Variables

Create `.env` file in `multi-tenant/multi-tenant/`:

```env
# Set this to use remote API instead of direct database
PAYLOAD_API_URL=https://your-cms-domain.com

# Optional: API Key if your CMS requires authentication
PAYLOAD_API_KEY=your-api-key
```

#### 3. Set CORS in Payload CMS

Make sure your deployed Payload CMS allows requests from your local machine:

In Payload CMS `.env`:
```env
ALLOWED_ORIGINS=http://localhost:*,https://your-cms-domain.com
```

Or allow all origins for development:
```env
ALLOWED_ORIGINS=*
`

## 🚀 Running Scripts

Scripts automatically detect connection method:

- **If `PAYLOAD_API_URL` is NOT set** (default): Connects directly to database ✅
- **If `PAYLOAD_API_URL` is set**: Connects to deployed CMS via API

### Example

```bash
# With deployed CMS
cd multi-tenant/multi-tenant
PAYLOAD_API_URL=https://cms.yourdomain.com pnpm tsx scripts/3-create-tenant.ts mitsos "Mitsos Site" mitsos

# Or set in .env file
echo "PAYLOAD_API_URL=https://cms.yourdomain.com" >> .env
pnpm tsx scripts/3-create-tenant.ts mitsos "Mitsos Site" mitsos
```

## 📋 Scripts That Support Remote CMS

All automation scripts support remote CMS:

1. ✅ `scripts/3-create-tenant.ts` - Create tenant and populate pages
2. ✅ `scripts/4-generate-docs.ts` - Generate documentation
3. ✅ `scripts/populate-ftiaxesite.ts` - Populate existing tenant

## 🔍 How It Works

### Remote Client

When `PAYLOAD_API_URL` is set, scripts use REST API client:

```typescript
// Connects via HTTP API
const payload = await getPayloadClient()
// Uses: GET /api/tenants, POST /api/pages, etc.
```

### Local Client

When `PAYLOAD_API_URL` is not set, scripts use direct database:

```typescript
// Connects directly to database
const payload = await getPayload({ config })
// Direct database queries
```

## ⚙️ Environment Variables

### For Scripts (`.env` in `multi-tenant/multi-tenant/`)

| Variable | Description | Required |
|----------|-------------|----------|
| `PAYLOAD_API_URL` | Deployed CMS URL | Yes (for remote) |
| `PAYLOAD_API_KEY` | API authentication key | No |

### For Frontend Projects (`.env.local` in each project)

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_PAYLOAD_URL` | Deployed CMS URL | Yes |

## 🧪 Testing Connection

Test your connection:

```bash
# Check if CMS is accessible
curl https://your-cms-domain.com/api/tenants

# Should return JSON with tenants
```

## 🚨 Troubleshooting

### Connection Failed

**Error:** `API request failed: 401` or `403`

**Solution:**
- Check `PAYLOAD_API_URL` is correct
- Verify CORS settings in Payload CMS
- Check if API key is needed

### CORS Error

**Error:** `CORS policy blocked`

**Solution:**
- Add `http://localhost:*` to `ALLOWED_ORIGINS` in Payload CMS
- Redeploy Payload CMS after changing CORS

### Timeout

**Error:** `Request timeout`

**Solution:**
- Check Payload CMS is deployed and running
- Verify URL is correct
- Check network connectivity

## 📝 Example Workflow

```bash
# 1. Deploy Payload CMS first (one-time setup)
# ... deploy to Vercel/Railway ...

# 2. Configure scripts to use deployed CMS
cd multi-tenant/multi-tenant
echo "PAYLOAD_API_URL=https://cms.yourdomain.com" > .env

# 3. Run automation scripts locally
pnpm tsx scripts/1-create-frontend-project.ts mitsos
# ... add V0.app code ...
pnpm tsx scripts/2-generate-template.ts mitsos
# ... import template ...
pnpm tsx scripts/3-create-tenant.ts mitsos "Mitsos Site" mitsos
pnpm tsx scripts/4-generate-docs.ts mitsos mitsos

# All scripts connect to deployed CMS via API!
```

## ✅ Benefits

- ✅ Scripts run locally (fast, no deployment needed)
- ✅ CMS is online (accessible to frontend sites)
- ✅ No local database required for scripts
- ✅ Production data stays in production
- ✅ Easy to automate

---

**Ready?** Deploy your CMS first, then configure `PAYLOAD_API_URL`! 🚀

