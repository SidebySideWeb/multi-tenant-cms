# Environment Variables Reference

Copy these variables to your `.env` file:

```env
# Payload CMS Configuration
PAYLOAD_SECRET=your-secret-key-here

# Supabase PostgreSQL Database Connection
# Use the pooled connection for better performance
POSTGRES_URL=postgresql://postgres.fesjvdynrrarrljwbqdh:P0pb5gBTfgByzplq@aws-1-eu-west-1.pooler.supabase.com:6543/postgres

# Database Seeding
SEED_DB=false

# CORS Configuration (comma-separated list of allowed origins)
ALLOWED_ORIGINS=*

# Supabase Storage S3 Configuration
# IMPORTANT: Create a bucket in Supabase Dashboard → Storage first, then set the name here
S3_BUCKET_NAME=payload-media

# Supabase Storage S3 Credentials (already configured)
S3_ACCESS_KEY_ID=653e777fd7742aae4acec2113a625a2b
S3_SECRET_ACCESS_KEY=fb875b7a03b6999591838ade279e9e888d3beb4f4b9b24254e246283b6209796

# Supabase Storage Endpoint
# The config automatically removes /storage/v1/s3 if present
S3_ENDPOINT=https://fesjvdynrrarrljwbqdh.storage.supabase.co

# S3 Region
S3_REGION=us-east-1
```

## Complete Setup Checklist

### Database ✅
- Supabase PostgreSQL connection string is configured above
- Uses pooled connection (port 6543) for better performance
- See `SUPABASE_DATABASE_SETUP.md` for details

### Storage ⏭️
1. **Create Storage Bucket in Supabase:**
   - Go to Supabase Dashboard → Storage
   - Create a new bucket (e.g., `payload-media`)
   - Set it to **Public** if you want direct file access
   - Update `S3_BUCKET_NAME` in your `.env` file

2. **Test upload:**
   - Go to `/admin` → Media
   - Upload a test file
   - Verify it appears in your Supabase Storage bucket

### Final Steps
1. **Create your `.env` file** with all variables above
2. **Restart your server:**
   ```bash
   pnpm dev
   ```

3. **Verify everything works:**
   - Access `/admin` - should load without errors
   - Create a test page
   - Upload a test media file
   - Check database in Supabase Dashboard → Table Editor

