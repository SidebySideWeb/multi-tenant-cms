# Vercel Deployment Checklist

Quick checklist for deploying to Vercel.

## ✅ Before Deploying

- [ ] Code is pushed to GitHub
- [ ] Build works locally (`pnpm build`)
- [ ] Environment variables list prepared
- [ ] Database is accessible
- [ ] Storage is configured

## 🚀 Deploy Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import: `SidebySideWeb/multi-tenant-cms`
4. Click **"Import"**

### 2. Configure Settings

**Framework Preset:** Next.js (auto-detected) ✅

**Root Directory:** `.` (leave as root)

**Build Command:** `pnpm build` ✅

**Output Directory:** `.next` ✅

**Install Command:** `pnpm install` ✅

### 3. Add Environment Variables

Click **"Environment Variables"** and add:

#### Copy-Paste These:

```env
POSTGRES_URL=postgresql://postgres.fesjvdynrrarrljwbqdh:P0pb5gBTfgByzplq@aws-1-eu-west-1.pooler.supabase.com:6543/postgres

S3_ENDPOINT=https://fesjvdynrrarrljwbqdh.supabase.co/storage/v1/s3
S3_BUCKET_NAME=payload-media
S3_ACCESS_KEY_ID=653e777fd7742aae4acec2113a625a2b
S3_SECRET_ACCESS_KEY=fb875b7a03b6999591838ade279e9e888d3beb4f4b9b24254e246283b6209796
S3_REGION=us-east-1

PAYLOAD_SECRET=generate-random-32-chars-minimum
ALLOWED_ORIGINS=*
NODE_ENV=production
```

**Note:** Generate a new `PAYLOAD_SECRET` - don't use the example!

### 4. Deploy

Click **"Deploy"** and wait for build to complete.

### 5. Access Admin

1. Go to: `https://cms.ftiaxesite.gr/admin`
2. Create first super-admin user
3. Start using!

---

## 🔐 Generate PAYLOAD_SECRET

Use this command or any random string generator:

```bash
# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# Or use online generator
# https://randomkeygen.com/
```

Minimum 32 characters, use letters and numbers.

---

## ✅ After Deployment

- [ ] Admin panel loads: `/admin`
- [ ] Can create first user
- [ ] Can create tenant
- [ ] API works: `/api/pages`
- [ ] Media upload works

---

**That's it!** See `VERCEL_DEPLOYMENT.md` for detailed troubleshooting.

