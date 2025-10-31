# Media Upload Troubleshooting - 500 Error

If you're getting a `500 Internal Server Error` when uploading media files in Payload CMS admin, follow these steps:

## 🔍 Step 1: Check Vercel Environment Variables

Go to your Vercel project → **Settings** → **Environment Variables** and verify these are set:

```env
S3_BUCKET_NAME=payload-media
S3_ACCESS_KEY_ID=653e777fd7742aae4acec2113a625a2b
S3_SECRET_ACCESS_KEY=fb875b7a03b6999591838ade279e9e888d3beb4f4b9b24254e246283b6209796
S3_REGION=us-east-1
S3_ENDPOINT=https://fesjvdynrrarrljwbqdh.storage.supabase.co
```

**Important:** 
- `S3_ENDPOINT` should be the **base URL** without `/storage/v1/s3` - the config adds it automatically
- Or use the full path: `https://fesjvdynrrarrljwbqdh.storage.supabase.co/storage/v1/s3`

## 🔍 Step 2: Verify Supabase Storage Bucket Exists

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Storage** section
4. **Check if bucket `payload-media` exists**
   - If it doesn't exist, create it:
     - Click "New bucket"
     - Name: `payload-media`
     - Set to **Public** (for direct file access)
     - Click "Create bucket"

## 🔍 Step 3: Check Supabase Storage Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. Look for **S3 API** section
3. Verify your credentials match:
   - Access Key ID should match `S3_ACCESS_KEY_ID`
   - Secret Access Key should match `S3_SECRET_ACCESS_KEY`
4. If credentials are different, update them in Vercel environment variables

## 🔍 Step 4: Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project
2. Click **Functions** tab
3. Click **View Logs** or check recent deployments
4. Look for errors related to:
   - S3 operations
   - "Bucket not found"
   - "Access denied"
   - "Invalid endpoint"

## 🔍 Step 5: Verify Endpoint Format

The endpoint should be one of these formats:

**Option 1 (Base URL - recommended):**
```
S3_ENDPOINT=https://fesjvdynrrarrljwbqdh.storage.supabase.co
```
The config will automatically add `/storage/v1/s3`

**Option 2 (Full path):**
```
S3_ENDPOINT=https://fesjvdynrrarrljwbqdh.storage.supabase.co/storage/v1/s3
```

**Don't use:**
```
S3_ENDPOINT=https://fesjvdynrrarrljwbqdh.supabase.co/storage/v1/s3  ❌ Wrong domain
```

## ✅ Quick Fix Checklist

- [ ] Bucket `payload-media` exists in Supabase Storage
- [ ] Bucket is set to **Public**
- [ ] All S3 environment variables are set in Vercel
- [ ] `S3_ENDPOINT` format is correct
- [ ] Credentials match Supabase S3 API credentials
- [ ] Redeployed after changing environment variables

## 🔧 Common Fixes

### Fix 1: Redeploy After Adding Environment Variables

**After setting environment variables in Vercel:**
1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Wait for build to complete

### Fix 2: Create the Bucket

If the bucket doesn't exist:
1. Go to Supabase Dashboard → Storage
2. Click **New bucket**
3. Name: `payload-media`
4. Set to **Public**
5. Click **Create bucket**
6. Redeploy CMS on Vercel

### Fix 3: Update Endpoint Format

If endpoint format is wrong:
1. Go to Vercel → Settings → Environment Variables
2. Update `S3_ENDPOINT` to:
   ```
   https://fesjvdynrrarrljwbqdh.storage.supabase.co
   ```
3. Redeploy

### Fix 4: Verify Credentials

If credentials are wrong:
1. Go to Supabase Dashboard → Settings → API
2. Find **S3 API** credentials
3. Copy the Access Key ID and Secret Access Key
4. Update in Vercel environment variables
5. Redeploy

## 📊 Debugging Steps

### Check Server Logs

In Vercel, check the function logs for detailed error messages:

1. **Vercel Dashboard** → Your Project
2. **Functions** → View Logs
3. Look for S3-related errors

### Test S3 Connection Locally

Test the connection locally first:

```bash
# In your local .env file, add:
S3_BUCKET_NAME=payload-media
S3_ACCESS_KEY_ID=653e777fd7742aae4acec2113a625a2b
S3_SECRET_ACCESS_KEY=fb875b7a03b6999591838ade279e9e888d3beb4f4b9b24254e246283b6209796
S3_REGION=us-east-1
S3_ENDPOINT=https://fesjvdynrrarrljwbqdh.storage.supabase.co

# Then run:
pnpm dev

# Try uploading a file in admin panel
```

## 🚨 Error Messages & Solutions

### "Bucket not found" or "NoSuchBucket"
- **Solution:** Create the bucket in Supabase Storage
- **Check:** Bucket name matches `S3_BUCKET_NAME` exactly

### "Access Denied" or "Forbidden"
- **Solution:** Verify S3 credentials are correct
- **Check:** Credentials match Supabase S3 API settings

### "Invalid endpoint" or "Endpoint not found"
- **Solution:** Check `S3_ENDPOINT` format
- **Use:** `https://{project-ref}.storage.supabase.co` (base URL)

### "Connection timeout" or "Network error"
- **Solution:** Check Supabase project is active
- **Check:** No firewall blocking connections

## 📝 Verify After Fix

After applying fixes:

1. **Redeploy CMS** on Vercel
2. **Go to admin panel:** `https://cms.ftiaxesite.gr/admin`
3. **Try uploading an image** in Media collection
4. **Check Supabase Storage** - file should appear in bucket
5. **Verify file URL** - should be accessible

## 🆘 Still Not Working?

If the issue persists:

1. **Check Vercel logs** for specific error messages
2. **Verify all environment variables** are set correctly
3. **Test bucket manually** in Supabase Storage dashboard
4. **Check Supabase project status** - ensure it's active
5. **Review Payload CMS logs** for detailed error information

---

**Common Issue:** Most 500 errors are caused by missing environment variables or bucket not existing. Start with those checks first!

