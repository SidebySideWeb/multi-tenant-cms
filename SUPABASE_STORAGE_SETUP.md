# Supabase Storage Setup Guide

This guide explains how to configure Supabase Storage (S3-compatible) for your Payload CMS media uploads.

## Configuration Steps

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```env
# Supabase Storage S3 Configuration
S3_BUCKET_NAME=payload-media
S3_ACCESS_KEY_ID=653e777fd7742aae4acec2113a625a2b
S3_SECRET_ACCESS_KEY=fb875b7a03b6999591838ade279e9e888d3beb4f4b9b24254e246283b6209796
S3_REGION=us-east-1
S3_ENDPOINT=https://fesjvdynrrarrljwbqdh.storage.supabase.co
```

**Important Notes:**
- `S3_BUCKET_NAME`: Replace `payload-media` with your actual Supabase Storage bucket name (create one in Supabase Dashboard → Storage)
- `S3_ENDPOINT`: The base storage URL - if you have `/storage/v1/s3` at the end, the config will automatically remove it
- `S3_REGION`: Can be any region, typically `us-east-1` works fine
- **Your credentials are already set above** - just create the bucket and update `S3_BUCKET_NAME`

### 2. Supabase Storage Bucket Setup

#### Create a Storage Bucket in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Storage** section
3. Create a new bucket (e.g., `payload-media`)
4. Set bucket to **Public** if you want direct access to files
5. Note the bucket name for your `S3_BUCKET_NAME` env variable

#### Get S3 Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. Look for **S3 API** section
3. Copy the Access Key ID and Secret Access Key
4. The endpoint URL format is: `https://{project-ref}.supabase.co`

### 3. Current Configuration

The Payload config is already set up with:
- S3 Storage plugin installed and configured
- Media collection set to use S3 storage
- Files stored with `media/` prefix
- Force path style enabled (required for Supabase)

### 4. Verify Setup

After configuring environment variables:

1. **Restart your server:**
   ```bash
   pnpm dev
   ```

2. **Test upload in admin panel:**
   - Go to `/admin` → Media
   - Upload a test image
   - Check that it appears in your Supabase Storage bucket

3. **Check file URL:**
   - After upload, the media file should have a URL pointing to Supabase Storage
   - URLs should be accessible if bucket is public

## Troubleshooting

### Issue: Files not uploading

**Check:**
- Environment variables are set correctly
- Bucket name matches exactly
- Bucket exists in Supabase
- Bucket permissions allow uploads

### Issue: Files upload but URLs don't work

**Check:**
- Bucket is set to **Public** in Supabase
- CORS is configured if accessing from frontend
- File URLs are correct format

### Issue: "Access Denied" errors

**Check:**
- Access Key ID and Secret Access Key are correct
- S3 credentials have proper permissions in Supabase
- Bucket policy allows operations

### Issue: Endpoint not found

**Try:**
- Remove `/storage/v1/s3` from endpoint (use base URL only)
- Or verify the full endpoint path is correct for your Supabase setup

## File Structure

Files will be stored in Supabase Storage with this structure:

```
bucket-name/
└── media/
    ├── tenant-id-1/
    │   └── filename.jpg
    └── tenant-id-2/
        └── filename.jpg
```

The multi-tenant plugin automatically scopes files by tenant.

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Set bucket policies** appropriately in Supabase
4. **Use private buckets** if files shouldn't be publicly accessible
5. **Rotate credentials** periodically

## Public vs Private Buckets

### Public Bucket
- Files are directly accessible via URL
- No authentication required
- Good for images, public assets
- Set in Supabase: Bucket → **Public**

### Private Bucket
- Files require signed URLs
- Authentication/authorization required
- Good for sensitive documents
- Set in Supabase: Bucket → **Private**

For client websites, public buckets are typically preferred for media files.

## Next Steps

1. Set up your environment variables
2. Create the storage bucket in Supabase
3. Restart your Payload CMS server
4. Test uploading a file in the admin panel
5. Verify files appear in Supabase Storage

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Payload S3 Storage Plugin](https://payloadcms.com/docs/storage/s3)
- [Supabase S3-Compatible API](https://supabase.com/docs/guides/storage/s3/authentication)

