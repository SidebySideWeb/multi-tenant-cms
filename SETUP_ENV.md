# Setting Up Your .env File

## Quick Setup Guide

### Step 1: Create `.env` File

In the `multi-tenant` folder, create a file named `.env` (no extension).

### Step 2: Copy This Content

Copy and paste ALL of the following into your `.env` file:

```env
# ============================================================================
# Payload CMS Configuration
# ============================================================================

# Secret key for Payload CMS (generate a random string)
PAYLOAD_SECRET=your-secret-key-here-change-this

# ============================================================================
# Supabase PostgreSQL Database
# ============================================================================

# Use the pooled connection for better performance
POSTGRES_URL=postgresql://postgres.fesjvdynrrarrljwbqdh:P0pb5gBTfgByzplq@aws-1-eu-west-1.pooler.supabase.com:6543/postgres

# ============================================================================
# Database Seeding
# ============================================================================

# Set to true to seed database on startup (only needed once)
SEED_DB=false

# ============================================================================
# CORS Configuration
# ============================================================================

# Comma-separated list of allowed origins for API access
# Use * for development, specific domains for production
ALLOWED_ORIGINS=*

# ============================================================================
# Supabase Storage S3 Configuration
# ============================================================================

# IMPORTANT: Create a bucket in Supabase Dashboard → Storage first!
# Then set the bucket name here (must match exactly)
S3_BUCKET_NAME=payload-media

# Supabase Storage S3 Access Credentials
# Get these from: Supabase Dashboard → Settings → API → S3 API
S3_ACCESS_KEY_ID=653e777fd7742aae4acec2113a625a2b
S3_SECRET_ACCESS_KEY=fb875b7a03b6999591838ade279e9e888d3beb4f4b9b24254e246283b6209796

# Supabase Storage S3 Endpoint
# Full endpoint URL with /storage/v1/s3 path
S3_ENDPOINT=https://fesjvdynrrarrljwbqdh.storage.supabase.co/storage/v1/s3

# S3 Region (can be any region, us-east-1 works fine)
S3_REGION=us-east-1
```

### Step 3: Update Required Values

#### 1. PAYLOAD_SECRET
Generate a random secret key:
- Option 1: Use an online generator: https://generate-secret.vercel.app/32
- Option 2: Run: `openssl rand -base64 32`
- Option 3: Use any long random string

Replace `your-secret-key-here-change-this` with your generated secret.

#### 2. S3_BUCKET_NAME
1. Go to Supabase Dashboard → Storage
2. Create a new bucket (name it `payload-media` or your preferred name)
3. Set it to **Public** if you want direct file access
4. Update `S3_BUCKET_NAME` in `.env` to match your bucket name exactly

### Step 4: Verify Your .env File

Your `.env` file should have these exact variable names:

- ✅ `PAYLOAD_SECRET` - Your secret key
- ✅ `POSTGRES_URL` - Database connection (already set)
- ✅ `SEED_DB` - Database seeding flag
- ✅ `ALLOWED_ORIGINS` - CORS settings
- ✅ `S3_BUCKET_NAME` - Your Supabase bucket name
- ✅ `S3_ACCESS_KEY_ID` - S3 access key (already set)
- ✅ `S3_SECRET_ACCESS_KEY` - S3 secret key (already set)
- ✅ `S3_ENDPOINT` - S3 endpoint URL (already set)
- ✅ `S3_REGION` - S3 region (already set)

### Step 5: Restart Server

After creating/updating `.env`:

```bash
# Stop server if running (Ctrl+C)
pnpm dev
```

## File Location

Your `.env` file should be here:
```
multi-tenant/
└── .env    ← Create this file here
```

## Important Notes

1. **Never commit `.env` to git** - It contains sensitive credentials
2. **Bucket must exist** - Create it in Supabase Dashboard first
3. **Exact match required** - Bucket name must match exactly (case-sensitive)
4. **Restart required** - Server must be restarted after changing `.env`

## Troubleshooting

### "Cannot find .env file"
- Make sure file is named exactly `.env` (not `.env.txt` or `.env.example`)
- File should be in the `multi-tenant` folder (same level as `package.json`)

### "Environment variable not found"
- Check spelling of variable names (case-sensitive)
- Make sure there are no spaces around `=` sign
- Restart server after changes

### Upload still fails
- Verify bucket exists in Supabase
- Check bucket name matches exactly
- Ensure bucket is set to Public
- Check server logs for specific errors


