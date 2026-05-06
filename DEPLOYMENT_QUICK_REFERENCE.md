# FarmMoo Deployment - Quick Reference

## What Was Configured

### ✅ Completed

1. **Frontend (.env.production)**
   - `VITE_API_URL=https://farmmoo-marketplace.onrender.com/api`

2. **Frontend (vite.config.ts)**
   - Added `base: "/"`
   - Verified build command: `npm run build`

3. **Frontend (vercel.json)**
   - Created deployment configuration
   - Specified output directory: `dist`

4. **Backend (settings.py)**
   - CORS uses environment variable
   - Ready for production configuration
   - Database supports PostgreSQL

5. **Documentation**
   - DEPLOYMENT.md - Complete guide (70+ sections)
   - DEPLOYMENT_CHECKLIST.md - Ready checklist
   - .env.example - Production configuration template
   - All files updated with Render/Vercel instructions

---

## Quick Deployment Workflow

### Phase 1: Backend (Render) - 15-30 min

```bash
# 1. Create Render Account
#    Go to: https://render.com

# 2. Create PostgreSQL Database
#    - Click "New +" → "PostgreSQL"
#    - Note connection details

# 3. Create Web Service
#    - Click "New +" → "Web Service"
#    - Connect GitHub repo
#    - Root: / (or leave default)

# 4. Build Command
echo "pip install -r requirements.txt && \
python manage.py migrate && \
python manage.py collectstatic --noinput"

# 5. Start Command
echo "gunicorn FarmMoo.wsgi:application --bind 0.0.0.0:\$PORT"

# 6. Environment Variables (In Render Dashboard)
DEBUG=False
SECRET_KEY=<generate-unique-key>
ALLOWED_HOSTS=farmmoo-marketplace.onrender.com
DB_ENGINE=django.db.backends.postgresql
DB_NAME=<from PostgreSQL>
DB_USER=<from PostgreSQL>
DB_PASSWORD=<from PostgreSQL>
DB_HOST=<from PostgreSQL>
DB_PORT=5432
DB_SSLMODE=require
CORS_ALLOWED_ORIGINS=<update later with Vercel URL>
USE_S3=False
```

**Result:** `https://farmmoo-marketplace.onrender.com/api`

### Phase 2: Frontend (Vercel) - 10-15 min

```bash
# 1. Create Vercel Account
#    Go to: https://vercel.com

# 2. Import Project from GitHub
#    - Select your repository
#    - Root Directory: frontend

# 3. Build Settings (Auto-detected)
# Build Command: npm run build
# Output Directory: dist

# 4. Environment Variables (In Vercel Dashboard)
# Key: VITE_API_URL
# Value: https://farmmoo-marketplace.onrender.com/api
# Apply to: Production, Preview, Development

# 5. Deploy!
```

**Result:** `https://farmmoo.vercel.app`

### Phase 3: Connect (5 min)

```bash
# 1. Get your Vercel URL from dashboard
#    Example: https://farmmoo.vercel.app

# 2. Update Render CORS setting
#    Go to Render → Django Service → Environment
#    CORS_ALLOWED_ORIGINS=https://farmmoo.vercel.app
#    Save (service redeploys automatically)

# 3. Test connection
#    Open browser console and run:
fetch('https://farmmoo-marketplace.onrender.com/api/products/')
  .then(r => r.json())
  .then(d => console.log(d))
```

---

## Environment Variables Summary

### Render (Set in Dashboard)

| Variable | Value | Notes |
|----------|-------|-------|
| `DEBUG` | `False` | Never True in production |
| `SECRET_KEY` | `<unique-key>` | Use Django's `get_random_secret_key()` |
| `ALLOWED_HOSTS` | `farmmoo-marketplace.onrender.com` | Render domain only |
| `DB_ENGINE` | `django.db.backends.postgresql` | PostgreSQL required |
| `DB_NAME` | `<from PostgreSQL>` | Create instance first |
| `DB_USER` | `<from PostgreSQL>` | From PostgreSQL |
| `DB_PASSWORD` | `<from PostgreSQL>` | Strong password! |
| `DB_HOST` | `<from PostgreSQL>` | From PostgreSQL |
| `DB_PORT` | `5432` | PostgreSQL default |
| `DB_SSLMODE` | `require` | Force SSL connection |
| `CORS_ALLOWED_ORIGINS` | `https://your-vercel-domain.vercel.app` | Update after Vercel deploy |
| `USE_S3` | `False` | Or configure S3 for media |

### Vercel (Set in Dashboard)

| Variable | Value | Environments |
|----------|-------|--------------|
| `VITE_API_URL` | `https://farmmoo-marketplace.onrender.com/api` | All |

---

## File Checklist

```
✓ vite.config.ts          - base: "/" added
✓ .env.production         - Render API URL configured
✓ vercel.json             - Deployment config created
✓ package.json            - Build script correct
✓ settings.py             - CORS env var ready
✓ .env.example            - Updated with instructions
✓ DEPLOYMENT.md           - Complete guide
✓ DEPLOYMENT_CHECKLIST.md - Verification checklist
```

---

## Testing Commands

### Local Frontend Build
```bash
cd frontend
npm run build
# Should complete with ✓ built in ~1s
```

### Local Backend Check
```bash
cd FarmMoo
python manage.py check
# Should show: System check identified no issues (0 silenced)
```

### Test API Connection
```bash
# From browser console on Vercel deployment
fetch('https://farmmoo-marketplace.onrender.com/api/products/')
  .then(r => r.json())
  .then(d => {
    console.log('Success! Products:', d);
    return d;
  })
  .catch(e => console.error('Error:', e))
```

---

## Common Issues & Solutions

### CORS Error: "No 'Access-Control-Allow-Origin' header"

**Cause:** CORS_ALLOWED_ORIGINS on Render doesn't include Vercel domain

**Fix:**
1. Get your Vercel domain: `https://your-project.vercel.app`
2. Go to Render Dashboard
3. Open Django service → Environment
4. Update `CORS_ALLOWED_ORIGINS=https://your-project.vercel.app`
5. Save (service redeploys in ~1 min)

### Blank Page on Vercel

**Cause:** Build failed or wrong output directory

**Fix:**
1. Go to Vercel Dashboard → Deployments
2. Check latest build logs
3. Verify output directory is `dist`
4. Re-run build locally: `npm run build`

### API Returns 500 Error

**Cause:** Backend configuration issue or database problem

**Fix:**
1. Go to Render Dashboard → Logs
2. Look for Python error messages
3. Check environment variables are set correctly
4. Verify database credentials work

### Timeout on First Request

**Cause:** Free Render instance spinning up (cold start)

**Note:** This is normal for free tier - takes 30-60 seconds first request
- Upgrade to Starter plan for always-on
- Or accept the cold start delay

---

## Next Steps After Deployment

1. **Monitor Performance**
   - Vercel: Dashboard → Analytics
   - Render: Dashboard → Logs

2. **Test User Flow**
   - Home page loads ✓
   - Browse products ✓
   - View shop ✓
   - Add to cart ✓
   - Login/register ✓
   - Checkout ✓

3. **Review Logs**
   - Render: Check for errors
   - Browser: Check DevTools console
   - Vercel: Check function logs

4. **Set Up Monitoring**
   - Database backups (Render)
   - Error tracking (Sentry, etc.)
   - Uptime monitoring
   - Performance monitoring

5. **Security Hardening**
   - Change default database password
   - Configure firewall rules
   - Set up API rate limiting
   - Review CORS origins periodically

---

## Quick Links

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Readiness checklist
- [Render Docs](https://render.com/docs) - Render documentation
- [Vercel Docs](https://vercel.com/docs) - Vercel documentation
- [Django Docs](https://docs.djangoproject.com/) - Django documentation
- [Vite Docs](https://vitejs.dev/) - Vite documentation

---

## Support

**For deployment issues:**
1. Check DEPLOYMENT.md for troubleshooting
2. Check DEPLOYMENT_CHECKLIST.md for verification
3. Review environment variables on both platforms
4. Check logs (Render dashboard or Vercel logs)
5. Search for specific error messages in platform docs

**For code issues:**
1. Test locally first
2. Check browser console for errors
3. Check server logs
4. Review recent changes in git

---

**Status:** ✅ Ready for production deployment

**Estimated Deployment Time:** 1-2 hours (first time)

**Success Indicator:** Frontend on Vercel + Backend on Render communicating successfully

