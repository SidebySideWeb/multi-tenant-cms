# Tenant Filtering Status

## Current Setup

### ✅ What's Working
1. **Frontend**: Sends `X-Tenant-Slug` header correctly
2. **Frontend**: Removed `tenant.slug` from where clauses
3. **Backend**: Access control reads header and returns tenant filter
4. **Backend**: Debug logging added

### ❌ What's NOT Working
- Tenant filtering is not being applied
- Kallitechnia frontend gets Ftiaxesite data

## The Problem

Payload's multi-tenant plugin is configured, but it might not be filtering public API requests automatically. The plugin typically uses cookies (`payload-tenant` cookie) for authenticated users, but public frontend requests don't have cookies.

## Current Architecture

1. **Multi-Tenant Plugin** (`payload.config.ts`):
   - Configured for `pages`, `posts`, `media`
   - Uses `tenant` field on collections
   - Default behavior: filters by cookie for authenticated users

2. **Custom Access Control** (`tenantScopedReadAccess`):
   - Reads `X-Tenant-Slug` header
   - Looks up tenant ID
   - Returns `{ tenant: { equals: tenantId } }` where clause

3. **Frontend Clients**:
   - Send `X-Tenant-Slug` header
   - Only filter by `slug` in where clause

## Possible Issues

1. **Access control not being called** - Check logs for `[tenantScopedReadAccess] Called`
2. **Header not reaching backend** - Check logs for header values
3. **Payload not merging where clauses** - Access control returns where clause but Payload might ignore it
4. **Plugin conflict** - Multi-tenant plugin might override access control

## Next Steps

1. **Check logs after redeploy** - Look for access control logs
2. **If access control is running but not working** - Payload might not be merging where clauses correctly
3. **Alternative solution** - Use custom API endpoint or middleware to handle tenant filtering

## Testing

After redeploy, check CMS logs for:
- `[tenantScopedReadAccess] Called` - Confirms access control runs
- `[tenantScopedReadAccess] Public request` - Shows tenant info
- `[tenantScopedReadAccess] Returning where clause` - Shows filter being returned

If these logs appear but filtering still doesn't work, Payload might not be respecting the access control where clause for public requests.

