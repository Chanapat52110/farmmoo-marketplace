# FarmMoo Deployment Readiness Checklist

## ✅ Frontend (Vercel Ready)

- [x] Build command configured: `npm run build`
- [x] Output directory: `dist/`
- [x] Base path: `/` (set in vite.config.ts)
- [x] Environment variable: `VITE_API_URL` configured
- [x] .env.production: Points to Render API
- [x] vercel.json: Configuration file created
- [x] TypeScript: 0 errors (2173 modules)
- [x] Production build: ✓ built in 1.15s
- [x] Package.json: Build script uses TypeScript check + Vite
- [x] All imports: Verified and working
- [x] Components: All reusable and tested

## ✅ Backend (Render Ready)

- [x] Django system checks: 0 issues
- [x] Settings.py: Environment variable configuration ready
- [x] CORS settings: Configured with env variable
- [x] Database: Supports PostgreSQL configuration via env vars
- [x] Static files: Configured for production
- [x] Media files: ImageField support configured
- [x] Migrations: All applied and ready
- [x] API endpoints: Verified and working
- [x] Authentication: JWT tokens configured
- [x] Error handling: API response envelopes configured

## 📋 Configuration Files

### Frontend
- [x] vite.config.ts - base: "/" added
- [x] .env.production - API URL set to Render
- [x] .env.example - Updated with Vercel instructions
- [x] vercel.json - Deployment config created
- [x] package.json - Build script verified

### Backend
- [x] settings.py - CORS using environment variable
- [x] .env.example - Production configuration documented
- [x] Database: Ready for PostgreSQL
- [x] MEDIA_URL/MEDIA_ROOT: Configured

## 🔐 Security Checklist

- [ ] Generate unique SECRET_KEY for production
- [ ] Set DEBUG=False on Render
- [ ] Configure ALLOWED_HOSTS on Render
- [ ] Set CORS_ALLOWED_ORIGINS to Vercel domain
- [ ] Enable SECURE_SSL_REDIRECT on Render
- [ ] Configure database SSL connection
- [ ] Use strong database password
- [ ] Store secrets in Render/Vercel dashboards (not in git)

## 📡 Deployment Steps (In Order)

### 1. Backend (Render)
- [ ] Create Render account
- [ ] Connect GitHub repository
- [ ] Create PostgreSQL database
- [ ] Create Web Service with Django
- [ ] Set all environment variables
- [ ] Deploy and test API endpoint

### 2. Frontend (Vercel)
- [ ] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Set VITE_API_URL environment variable
- [ ] Deploy and get Vercel URL
- [ ] Note the Vercel domain (e.g., farmmoo.vercel.app)

### 3. Connect Frontend to Backend
- [ ] Update Render CORS_ALLOWED_ORIGINS with Vercel URL
- [ ] Render redeploys automatically
- [ ] Test cross-origin API calls

## 🧪 Testing Checklist

### Backend (Render API)
- [ ] API responds to requests
- [ ] Products endpoint returns data: GET /api/products/
- [ ] Shop endpoint returns data: GET /api/shops/
- [ ] Authentication working: POST /api/token/
- [ ] CORS headers present for Vercel domain
- [ ] Database operations working

### Frontend (Vercel)
- [ ] Home page loads
- [ ] Products display correctly
- [ ] Product detail works
- [ ] Shop detail works
- [ ] Login/Register works
- [ ] Cart functionality works
- [ ] Checkout completes
- [ ] No CORS errors in console

### Cross-Origin
- [ ] Browser console has no CORS errors
- [ ] API calls succeed from Vercel domain
- [ ] Authentication tokens work
- [ ] Media/images load correctly
- [ ] Cookies/credentials work

## 📊 Performance

- [ ] Frontend bundle size: < 300 KB gzipped
- [ ] API response time: < 500 ms
- [ ] Database queries: Optimized
- [ ] Static files: Cached appropriately
- [ ] Images: Optimized format

## 📝 Documentation

- [x] DEPLOYMENT.md - Complete deployment guide
- [x] .env.example - Environment configuration documented
- [x] .env (backend) - Development defaults set
- [x] .env.production (frontend) - Production API URL set
- [x] README files - Updated with deployment info

## 🚀 Pre-Launch

- [ ] Verify all tests pass locally
- [ ] Review all environment variables
- [ ] Check database backups configured
- [ ] Monitor logs setup
- [ ] Alert setup for errors
- [ ] Update DNS (if using custom domain)

## 📞 Support Contacts

- Vercel Support: https://vercel.com/support
- Render Support: https://render.com/docs
- Django Docs: https://docs.djangoproject.com/
- React Docs: https://react.dev/

## 🎯 Success Criteria

When deployment is complete and working:

1. ✓ Frontend accessible at `https://farmmoo.vercel.app`
2. ✓ Backend accessible at `https://farmmoo-marketplace.onrender.com/api`
3. ✓ No CORS errors in browser console
4. ✓ All API calls successful
5. ✓ User can complete full checkout flow
6. ✓ Database persists data correctly
7. ✓ Images upload and display correctly
8. ✓ Authentication tokens work across deployments
9. ✓ No errors in browser DevTools or Render logs
10. ✓ Application performs well under normal load

## 📅 Timeline Estimates

- Backend setup on Render: 15-30 minutes
- Frontend setup on Vercel: 10-15 minutes
- Configuration and testing: 20-30 minutes
- Troubleshooting (if needed): Variable
- **Total: 1-2 hours for first-time deployment**

## 🔄 Maintenance

After deployment:

- [ ] Monitor Render logs daily
- [ ] Check Vercel analytics
- [ ] Test API endpoints weekly
- [ ] Review error rates
- [ ] Plan database backups
- [ ] Schedule security updates
- [ ] Gather user feedback

---

## Next Steps

1. **Verify all configurations** using this checklist
2. **Read DEPLOYMENT.md** for detailed instructions
3. **Review environment variables** on both platforms
4. **Test locally** before deploying
5. **Deploy backend** first (Render)
6. **Deploy frontend** second (Vercel)
7. **Update CORS** to use Vercel domain
8. **Test the connection** thoroughly
9. **Monitor logs** for errors
10. **Celebrate! 🎉**

