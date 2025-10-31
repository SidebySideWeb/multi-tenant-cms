# Vercel Deployment Guide - Multi-Tenant CMS

Complete guide for deploying the multi-tenant Payload CMS to Vercel.

## 🚀 Quick Deploy

### Step 1: Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository: `SidebySideWeb/multi-tenant-cms`
4. Vercel will auto-detect Next.js

### Step 2: Configure Project Settings

**Root Directory:** Leave as `.` (root) or set to `multi-tenant` if deploying from monorepo

**Framework Preset:** Next.js (auto-detected)

**Build Command:** `pnpm build` (or `npm run build`)

**Output Directory:** `.next` (default)

**Install Command:** `pnpm install` (or `npm install`)

### Step 3: Set Environment Variables

Go to **Settings** → **Environment Variables** and add:

#### Required Variables

```env
# Database (Supabase PostgreSQL)
POSTGRES_URL=postgresql://postgres.fesjvdynrrarrljwbqdh:P0pb5gBTfgByzplq@aws-1-eu-west-1.pooler.supabase.com:6543/postgres

# Storage (Supabase S3-compatible)
# IMPORTANT: Use base URL (without /storage/v1/s3) - config adds it automatically
S3_ENDPOINT=https://fesjvdynrrarrljwbqdh.storage.supabase.co
S3_BUCKET_NAME=payload-media
S3_ACCESS_KEY_ID=653e777fd7742aae4acec2113a625a2b
S3_SECRET_ACCESS_KEY=fb875b7a03b6999591838ade279e9e888d3beb4f4b9b24254e246283b6209796
S3_REGION=us-east-1

# Payload
PAYLOAD_SECRET=your-random-secret-key-here-min-32-chars
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://another-frontend.com

# Node Environment
NODE_ENV=production
```

#### Optional Variables

```env
# Database Seeding (set to true only for first deployment)
SEED_DB=false

# Server URL (your Vercel deployment URL)
PAYLOAD_PUBLIC_SERVER_URL=https://cms.ftiaxesite.gr
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete
3. Your CMS will be live at: `https://cms.ftiaxesite.gr`

### Step 5: Access Admin Panel

1. Go to: `https://cms.ftiaxesite.gr/admin`
2. Create your first super-admin user
3. Start managing tenants!

---

## ⚙️ Important Configuration

### Root Directory

If deploying from monorepo, set **Root Directory** to `multi-tenant` in Vercel project settings.

### Build Settings

Vercel should auto-detect:
- **Framework:** Next.js
- **Build Command:** `pnpm build` or `npm run build`
- **Output Directory:** `.next`

### Node Version

Vercel automatically uses Node.js 18+ or 20+. No configuration needed.

---

## 🔐 Environment Variables Details

### POSTGRES_URL
Your Supabase PostgreSQL connection string.
- Format: `postgresql://user:password@host:port/database`
- Use connection pooling URL for better performance

### S3 Storage (Supabase)
Supabase S3-compatible storage credentials.
- `S3_ENDPOINT`: Use base URL `https://{project-ref}.storage.supabase.co` (config adds `/storage/v1/s3` automatically)
- `S3_BUCKET_NAME`: Your bucket name
- `S3_ACCESS_KEY_ID`: Storage access key
- `S3_SECRET_ACCESS_KEY`: Storage secret key
- `S3_REGION`: Usually `us-east-1`

### PAYLOAD_SECRET
Random secret key for Payload (minimum 32 characters).
- Generate with: `openssl rand -base64 32`
- Or use any random string generator

### ALLOWED_ORIGINS
Comma-separated list of frontend domains that can access the CMS API.
- Example: `https://ftiaxesite.gr,https://another-site.com`
- Use `*` for development (not recommended for production)

---

## 📋 Pre-Deployment Checklist

- [ ] Repository pushed to GitHub
- [ ] Environment variables prepared
- [ ] Database accessible from Vercel
- [ ] Storage bucket created and configured
- [ ] PAYLOAD_SECRET generated
- [ ] ALLOWED_ORIGINS set with frontend domains

---

## 🧪 Post-Deployment

### Verify Deployment

1. **Check build logs** in Vercel dashboard
2. **Test admin panel**: `https://cms.ftiaxesite.gr/admin`
3. **Test API**: `https://cms.ftiaxesite.gr/api/pages`
4. **Check database**: Verify migrations ran successfully

### Create First User

1. Go to admin panel
2. Click **"Create First User"**
3. Fill in email and password
4. Set role to **super-admin**
5. Log in and start creating tenants!

### Run Migrations (If Needed)

If you need to run migrations manually:

1. Use Vercel CLI:
   ```bash
   vercel env pull .env.local
   pnpm payload migrate
   ```

2. Or set `SEED_DB=true` temporarily and redeploy (only for first setup)

---

## 🔄 Updating Deployment

### After Code Changes

1. Push changes to GitHub
2. Vercel automatically redeploys
3. Check deployment status in dashboard

### After Environment Variable Changes

1. Update variables in Vercel dashboard
2. Redeploy manually or wait for next push
3. Variables take effect on next deployment

---

## 🌍 Domain Configuration

### Custom Domain

1. Go to **Settings** → **Domains**
2. Add your custom domain (e.g., `cms.yourdomain.com`)
3. Update DNS records as instructed
4. Update `ALLOWED_ORIGINS` to include new domain

### Update Frontend Sites

After deploying CMS, update frontend sites with:

```env
NEXT_PUBLIC_PAYLOAD_URL=https://cms.ftiaxesite.gr
```

---

## 🚨 Troubleshooting

### Build Fails

**Check:**
- Environment variables are set correctly
- Database connection string is valid
- Storage credentials are correct
- Node version compatibility

**Solution:** Check build logs in Vercel dashboard for specific errors.

### Database Connection Error

**Error:** `Error connecting to database`

**Solution:**
- Verify `POSTGRES_URL` is correct
- Check Supabase database is accessible
- Ensure connection pooling is enabled
- Try direct connection URL if pooler fails

### Storage Upload Fails

**Error:** `S3 upload failed`

**Solution:**
- Verify `S3_ENDPOINT` includes `/storage/v1/s3`
- Check bucket exists and is accessible
- Verify access keys are correct
- Check bucket permissions in Supabase

### CORS Errors

**Error:** `CORS policy blocked`

**Solution:**
- Add frontend domain to `ALLOWED_ORIGINS`
- Redeploy after changing environment variables
- Check frontend is using correct CMS URL

### Admin Panel Not Loading

**Error:** `404` or blank page

**Solution:**
- Check build completed successfully
- Verify `PAYLOAD_SECRET` is set
- Check Vercel function logs
- Try accessing `/api/pages` to test API

---

## 📊 Monitoring

### Vercel Dashboard

- **Deployments**: View build history and status
- **Functions**: Monitor serverless function performance
- **Analytics**: View traffic and performance metrics
- **Logs**: Access real-time logs

### Payload Logs

Check Vercel function logs for Payload-specific errors:
1. Go to Vercel Dashboard → Your Project → Functions
2. Click on any function → View Logs

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Use Vercel environment variables
2. **Use strong PAYLOAD_SECRET** - Minimum 32 characters, random
3. **Limit ALLOWED_ORIGINS** - Only include your frontend domains
4. **Enable Supabase RLS** - Row Level Security for database
5. **Regular backups** - Set up Supabase automated backups

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Payload CMS Deployment](https://payloadcms.com/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)

---

## ✅ Quick Deploy Checklist

1. [ ] Repository on GitHub
2. [ ] Vercel account created
3. [ ] Project imported to Vercel
4. [ ] Environment variables set
5. [ ] Build command configured
6. [ ] Deployed successfully
7. [ ] Admin panel accessible
8. [ ] First user created
9. [ ] Frontend sites updated with CMS URL

---

**Ready to deploy?** Follow the steps above and your CMS will be live! 🚀

