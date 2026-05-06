# FarmMoo Deployment Guide - Vercel + Render

This guide covers deploying FarmMoo frontend to Vercel and connecting it to the backend on Render.

---

## Overview

- **Frontend**: React + TypeScript on Vercel
- **Backend**: Django API on Render
- **Communication**: HTTPS cross-origin with CORS

---

## Prerequisites

1. ✅ Frontend code in `/frontend` directory
2. ✅ Backend code ready for Render deployment
3. Account on [Vercel](https://vercel.com)
4. Account on [Render](https://render.com)
5. GitHub repository with your code

---

## Step 1: Deploy Backend to Render

### 1.1 Prepare Django Settings

Ensure your Django settings use environment variables for production:

```python
# FarmMoo/settings.py - Already configured ✓
SECRET_KEY = _env('SECRET_KEY')
DEBUG = _env_bool('DEBUG', default=False)
ALLOWED_HOSTS = _env_list('ALLOWED_HOSTS', 'localhost')
DATABASE configuration (supports PostgreSQL via env vars)
```

### 1.2 Create Render Service

1. Go to [render.com](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:

   **Build Command:**
   ```bash
   pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
   ```

   **Start Command:**
   ```bash
   gunicorn FarmMoo.wsgi:application --bind 0.0.0.0:$PORT
   ```

5. Add Environment Variables (Important!):

   | Variable | Value |
   |----------|-------|
   | `DEBUG` | `False` |
   | `SECRET_KEY` | Generate a secure key |
   | `ALLOWED_HOSTS` | `farmmoo-marketplace.onrender.com` |
   | `DB_ENGINE` | `django.db.backends.postgresql` |
   | `DB_NAME` | (Create PostgreSQL database first) |
   | `DB_USER` | (From PostgreSQL instance) |
   | `DB_PASSWORD` | (From PostgreSQL instance) |
   | `DB_HOST` | (From PostgreSQL instance) |
   | `DB_PORT` | `5432` |
   | `CORS_ALLOWED_ORIGINS` | `https://YOUR_VERCEL_DOMAIN.vercel.app` |
   | `USE_S3` | `False` (or set up S3 for media files) |

6. Create PostgreSQL Database on Render:
   - Click "New +" → "PostgreSQL"
   - Configure and note connection details
   - Use these for `DB_*` variables above

7. Deploy the service
8. **Note the Render URL**: `https://farmmoo-marketplace.onrender.com`

### 1.3 Verify Backend is Working

```bash
curl https://farmmoo-marketplace.onrender.com/api/products/
```

Should return JSON with products (may be empty initially).

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Prepare Environment

Files already configured ✓:
- `frontend/.env.production` - API URL set to Render
- `frontend/vite.config.ts` - base: "/" configured
- `frontend/package.json` - build script: "tsc -b && vite build"
- `frontend/vercel.json` - Vercel deployment config

### 2.2 Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Option B: Using GitHub Integration (Recommended)**

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Select your GitHub repository
4. Configure:
   - **Project Name**: `farmmoo` (or your choice)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: `dist` (should auto-detect)

5. Add Environment Variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://farmmoo-marketplace.onrender.com/api`
   - Apply to: `Production`, `Preview`, `Development`

6. Click "Deploy"

### 2.3 Get Your Vercel URL

After deployment, Vercel will provide:
```
✓ https://farmmoo.vercel.app
```

**Important**: You need this URL for CORS configuration on Render.

---

## Step 3: Connect Frontend to Backend

### 3.1 Update Render CORS Settings

1. Go to Render Dashboard
2. Open your Django service
3. Click "Environment"
4. Update `CORS_ALLOWED_ORIGINS`:

   ```
   https://farmmoo.vercel.app
   ```

5. Click "Save" - service will redeploy automatically

### 3.2 Update Vercel API URL (if needed)

If your Render URL is different from the default:

1. Go to Vercel Dashboard
2. Open `farmmoo` project
3. Click "Settings" → "Environment Variables"
4. Update or add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-render-url.onrender.com/api`
5. Redeploy: Click "Deployments" → latest → "Redeploy"

---

## Step 4: Test the Connection

### 4.1 Check Frontend Build

```bash
cd frontend
npm run build
```

Should show:
```
✓ built in 1.45s
```

### 4.2 Test API Connection in Browser

1. Open `https://farmmoo.vercel.app`
2. Open Browser DevTools → Console
3. Test API call:

   ```javascript
   fetch('https://farmmoo-marketplace.onrender.com/api/products/')
     .then(r => r.json())
     .then(d => console.log(d))
     .catch(e => console.error(e))
   ```

   Should return products data.

### 4.3 Test Full Application

- Home page loads ✓
- Products display ✓
- Login works ✓
- Add to cart works ✓
- Checkout succeeds ✓

---

## Configuration Summary

### Backend (Render)
- Service: Django WSGI application
- Database: PostgreSQL
- Environment variables:
  - `CORS_ALLOWED_ORIGINS` = Vercel URL
  - `DEBUG` = False
  - Database connection details
  - `SECRET_KEY` (unique)

### Frontend (Vercel)
- Environment variables:
  - `VITE_API_URL` = Render API URL
- Build: `npm run build`
- Output: `dist`
- Base path: `/`

---

## Troubleshooting

### CORS Error: "No 'Access-Control-Allow-Origin' header"

**Solution**: Verify `CORS_ALLOWED_ORIGINS` on Render includes your Vercel domain:

```bash
curl -H "Origin: https://farmmoo.vercel.app" \
  https://farmmoo-marketplace.onrender.com/api/products/ -v
```

Should show:
```
access-control-allow-origin: https://farmmoo.vercel.app
```

### Blank Page or 404

**Solution**: Verify Vercel deployment:
1. Check "Deployments" tab shows latest build successful
2. Check "Preview" URL works
3. Run `npm run build` locally to verify build succeeds

### API Returns 500 Error

**Solution**: Check Render logs:
1. Go to Render Dashboard
2. Open service → "Logs"
3. Look for Python errors
4. Verify environment variables are set

### Cold Start Delays

**Note**: Free Render accounts spin down after 15 min inactivity.
- First request takes 30+ seconds to wake up
- This is normal behavior for free tier
- Upgrade to "Starter" plan for always-on service

---

## Monitoring

### Vercel Analytics

1. Go to Vercel Dashboard → `farmmoo` project
2. Click "Analytics"
3. Monitor:
   - Page load performance
   - Error rates
   - Request patterns

### Render Logs

1. Go to Render Dashboard → Django service
2. Click "Logs"
3. Monitor:
   - Request logs
   - Error messages
   - Deployment status

---

## Redeployment

### Update Frontend Code

```bash
git commit -m "..."
git push
# Vercel auto-deploys from GitHub
```

### Update Backend Code

```bash
git commit -m "..."
git push
# Render auto-deploys from GitHub if auto-deploy is enabled
```

### Manual Redeploy (if needed)

**Vercel:**
- Dashboard → Deployments → "Redeploy"

**Render:**
- Dashboard → Service → "Manual Deploy"

---

## Production Checklist

- [ ] Secret key is unique and strong
- [ ] DEBUG = False
- [ ] ALLOWED_HOSTS includes Render domain
- [ ] CORS_ALLOWED_ORIGINS includes Vercel domain
- [ ] Database uses PostgreSQL
- [ ] Media files configured (S3 or local)
- [ ] Static files collected and served
- [ ] SSL/HTTPS enabled (automatic on both platforms)
- [ ] Environment variables set on both platforms
- [ ] Frontend and backend successfully deployed
- [ ] Cross-origin API calls work in browser
- [ ] All features tested (login, cart, checkout, etc.)

---

## Environment Variables Reference

### Render (.env on Render Dashboard)

```env
DEBUG=False
SECRET_KEY=your-unique-secret-key-here
ALLOWED_HOSTS=farmmoo-marketplace.onrender.com
DB_ENGINE=django.db.backends.postgresql
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host.onrender.com
DB_PORT=5432
CORS_ALLOWED_ORIGINS=https://farmmoo.vercel.app
USE_S3=False
```

### Vercel (Environment Variables in Dashboard)

```env
VITE_API_URL=https://farmmoo-marketplace.onrender.com/api
```

---

## Local Development

To test with production URLs locally:

```bash
# In frontend directory
VITE_API_URL=https://farmmoo-marketplace.onrender.com/api npm run dev
```

Or update `.env.local`:

```env
VITE_API_URL=https://farmmoo-marketplace.onrender.com/api
```

---

## Support

For issues:

1. Check browser console for errors
2. Check Render logs for backend errors
3. Verify environment variables match configuration
4. Ensure GitHub credentials are current
5. Check CORS configuration

---

## Next Steps

- Monitor production performance
- Set up database backups on Render
- Consider CDN for static assets
- Optimize images and code splitting
- Track error rates and fix issues
- Gather user feedback and improve

