# 🚀 Backend Deployment Fix Guide

## Current Status ❌
Your backend at `https://uncloud-india-backend.vercel.app` is returning 404 errors, which means the deployment has issues.

## Fixed Issues ✅
1. ✅ Updated `.env` file with correct backend URL
2. ✅ Fixed `server/vercel.json` configuration
3. ✅ Added root endpoint for testing
4. ✅ Modified server to work with Vercel serverless

## Next Steps to Fix Backend Deployment

### Step 1: Redeploy Your Backend
1. **Commit and push your changes**:
   ```bash
   git add .
   git commit -m "Fix backend Vercel deployment configuration"
   git push origin main
   ```

2. **Redeploy in Vercel**:
   - Go to your backend project in Vercel dashboard
   - Click "Redeploy" or it should auto-deploy from the git push

### Step 2: Set Environment Variables in Vercel
In your backend Vercel project, add these environment variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://UnCloud-India:Shadow%401234@uncloud.vt8u87q.mongodb.net/?retryWrites=true&w=majority&appName=UnCloud
JWT_SECRET=uncloud_super_secure_jwt_secret_key_2025_mindbloom_bharat_very_long_string_for_security
JWT_EXPIRES_IN=10d
FRONTEND_URL=https://un-cloud-india.vercel.app
```

### Step 3: Test Backend Endpoints
After redeployment, these URLs should work:
- **Root**: https://uncloud-india-backend.vercel.app
- **Health**: https://uncloud-india-backend.vercel.app/api/health
- **Auth**: https://uncloud-india-backend.vercel.app/api/auth/signup

### Step 4: Update Frontend Environment Variables
In your main frontend Vercel project, ensure you have:
```
VITE_API_BASE_URL_PRODUCTION=https://uncloud-india-backend.vercel.app/api
```

### Step 5: Redeploy Frontend
After backend is working, redeploy your frontend to pick up the changes.

## Alternative: Deploy Backend from Server Folder

If the above doesn't work, try deploying the backend separately:

1. **Create a new repository** with only the server folder contents
2. **Deploy that repository** to Vercel
3. **Set the environment variables** in the new deployment

## Testing Commands

After deployment, test with these curl commands:

```bash
# Test root endpoint
curl https://uncloud-india-backend.vercel.app

# Test health endpoint
curl https://uncloud-india-backend.vercel.app/api/health

# Test signup (should show validation errors but not 404)
curl -X POST https://uncloud-india-backend.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

## Common Issues & Solutions

1. **Still getting 404**: Make sure your Vercel project's Root Directory is set correctly
2. **Module import errors**: The server now uses conditional listening for Vercel compatibility
3. **Database connection**: Verify MongoDB Atlas IP whitelist includes Vercel IPs (0.0.0.0/0)

Once the backend is working, your sign-up form will connect properly! 🎉