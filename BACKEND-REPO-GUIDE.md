# 🚀 Backend Deployment Guide - Separate Repository

## Step 1: Create New GitHub Repository

1. **Go to GitHub** and create a new repository:
   - Repository name: `uncloud-india-backend`
   - Description: `Backend API for UnCloud India mental wellness app`
   - Make it **Public** (or Private if preferred)
   - ✅ Add a README file
   - ✅ Add .gitignore (Node.js template)

## Step 2: Prepare Backend Files Locally

### Method A: Copy Files to New Directory
1. **Create a new folder**: `uncloud-india-backend`
2. **Copy these files I've prepared** from `backend-repo-files/` folder:
   - ✅ `package.json` (updated for standalone deployment)
   - ✅ `index.js` (optimized for Vercel)
   - ✅ `vercel.json` (proper Vercel configuration)
   - ✅ `.env.example` (environment template)
   - ✅ `.gitignore` (Node.js gitignore)
   - ✅ `README.md` (complete documentation)

3. **Copy these folders** from your current `server/` directory:
   - ✅ `config/` folder (database.js)
   - ✅ `middleware/` folder (auth.js)  
   - ✅ `models/` folder (User.js, Mood.js, ChatSession.js)
   - ✅ `routes/` folder (auth.js)

### Method B: Use Command Line (Faster)
```bash
# Create new directory
mkdir uncloud-india-backend
cd uncloud-india-backend

# Copy files from backend-repo-files
cp "../backend-repo-files/*" .

# Copy server folders
cp -r "../server/config" .
cp -r "../server/middleware" .
cp -r "../server/models" .
cp -r "../server/routes" .
```

## Step 3: Initialize Git Repository

```bash
# Navigate to your new backend directory
cd uncloud-india-backend

# Initialize git
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial backend setup for UnCloud India API"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR-USERNAME/uncloud-india-backend.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel

1. **Connect repository to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your new `uncloud-india-backend` repository
   - Vercel will auto-detect it as Node.js project

2. **Add Environment Variables** in Vercel:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://UnCloud-India:Shadow%401234@uncloud.vt8u87q.mongodb.net/?retryWrites=true&w=majority&appName=UnCloud
   JWT_SECRET=uncloud_super_secure_jwt_secret_key_2025_mindbloom_bharat_very_long_string_for_security
   JWT_EXPIRES_IN=10d
   FRONTEND_URL=https://un-cloud-india.vercel.app
   ```

3. **Deploy**: Click "Deploy" button

## Step 5: Update Frontend Configuration

After your backend is deployed successfully, update your frontend:

1. **Get your new backend URL** from Vercel (something like `https://uncloud-india-backend-abc123.vercel.app`)

2. **Update your frontend's `.env` file**:
   ```env
   VITE_API_BASE_URL_PRODUCTION=https://your-new-backend-url.vercel.app/api
   ```

3. **Commit and push frontend changes**:
   ```bash
   git add .
   git commit -m "Update backend URL for production"
   git push origin main
   ```

4. **Redeploy frontend** (Vercel will auto-deploy from the push)

## Step 6: Test Everything

### Test Backend Directly:
- Root: `https://your-backend-url.vercel.app`
- Health: `https://your-backend-url.vercel.app/api/health`

### Test Frontend:
- Go to: `https://un-cloud-india.vercel.app/sign-up`
- Try creating an account
- Should work without network errors!

---

## 🎉 Success Checklist

- ✅ New GitHub repository created
- ✅ Backend files copied and configured  
- ✅ Repository pushed to GitHub
- ✅ Vercel deployment successful
- ✅ Environment variables set in Vercel
- ✅ Backend health check working
- ✅ Frontend updated with new backend URL
- ✅ Sign-up form working without errors

## 📋 Files Created in `backend-repo-files/`:
- `package.json` - Updated dependencies and scripts
- `index.js` - Optimized Express server for Vercel
- `vercel.json` - Proper Vercel deployment configuration  
- `.env.example` - Environment variables template
- `README.md` - Complete backend documentation
- `.gitignore` - Node.js gitignore file
