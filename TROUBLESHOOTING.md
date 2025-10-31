# Troubleshooting Media Upload Errors

## Common Issues and Solutions

### Error: 500 Internal Server Error on Upload

#### 1. Check Environment Variables

Make sure all S3 environment variables are set in your `.env` file:

```env
S3_BUCKET_NAME=payload-media
S3_ACCESS_KEY_ID=653e777fd7742aae4acec2113a625a2b
S3_SECRET_ACCESS_KEY=fb875b7a03b6999591838ade279e9e888d3beb4f4b9b24254e246283b6209796
S3_ENDPOINT=https://fesjvdynrrarrljwbqdh.storage.supabase.co/storage/v1/s3
S3_REGION=us-east-1
```

**Important:** 
- The endpoint should include `/storage/v1/s3` at the end
- Bucket name must match exactly what you created in Supabase

#### 2. Verify Bucket Exists

1. Go to Supabase Dashboard → Storage
2. Check that the bucket `payload-media` (or your bucket name) exists
3. Make sure it's set to **Public** if you want direct access

#### 3. Check Server Logs

Check your terminal/server logs for detailed error messages. Common errors:

- **"NoSuchBucket"**: Bucket doesn't exist - create it in Supabase
- **"AccessDenied"**: Credentials are wrong or bucket permissions are incorrect
- **"InvalidEndpoint"**: Endpoint URL is incorrect

#### 4. Test Endpoint Format

The endpoint should be:
```
https://fesjvdynrrarrljwbqdh.storage.supabase.co/storage/v1/s3
```

NOT:
```
https://fesjvdynrrarrljwbqdh.storage.supabase.co  (missing /storage/v1/s3)
```

#### 5. Restart Server

After updating environment variables:
```bash
# Stop server (Ctrl+C)
pnpm dev
```

#### 6. Verify Credentials

1. Go to Supabase Dashboard → Settings → API
2. Check **S3 API** section
3. Verify Access Key ID and Secret Access Key match your `.env` file

#### 7. Check Bucket Policies

In Supabase Storage:
1. Go to your bucket
2. Check **Policies** tab
3. Ensure there's a policy allowing uploads (INSERT operation)

### Quick Fix Checklist

- [ ] Environment variables are set correctly
- [ ] Bucket exists in Supabase Storage
- [ ] Bucket is set to Public (if needed)
- [ ] Endpoint includes `/storage/v1/s3`
- [ ] Credentials match Supabase Dashboard
- [ ] Server restarted after env changes
- [ ] Checked server logs for specific error

### Still Not Working?

1. **Check server console** for detailed error messages
2. **Try creating bucket** with a different name
3. **Verify Supabase project** is active and not paused
4. **Check network** - ensure server can reach Supabase endpoint

