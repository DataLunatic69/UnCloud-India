# UnCloud India - Deployment Guide

## The Issue
When you deploy only the frontend to Vercel, the app tries to connect to `http://localhost:5001/api` which doesn't exist in production, causing the "Network error: Unable to connect to the server" message.

## Solution: Deploy Backend and Frontend Separately

### Step 1: Deploy Your Backend to Vercel

1. Create a **separate** Vercel project for your backend:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your repository again, but this time:
     - Set the **Framework Preset** to "Other"
     - Set the **Root Directory** to `server`
     - This will deploy only the backend

2. Add environment variables to your backend deployment:
   - In your backend Vercel project settings, go to "Environment Variables"
   - Add these variables:
     ```
     NODE_ENV=production
     MONGODB_URI=your_mongodb_connection_string_here
     JWT_SECRET=your_jwt_secret_here
     JWT_EXPIRES_IN=7d
     FRONTEND_URL=https://un-cloud-india.vercel.app
     ```

3. Your backend will be deployed to something like: `https://uncloud-india-api.vercel.app`

### Step 2: Update Frontend Environment Variables

1. In your main Vercel project (frontend), add this environment variable:
   ```
   VITE_API_BASE_URL_PRODUCTION=https://your-backend-url.vercel.app/api
   ```
   Replace `your-backend-url` with your actual backend deployment URL.

### Step 3: Redeploy Frontend

1. Push your updated code to GitHub
2. Vercel will automatically redeploy your frontend
3. The frontend will now connect to your deployed backend

## Alternative Solution: Use Vercel Serverless Functions

If you prefer to keep everything in one project, you can convert your Express routes to Vercel serverless functions:

1. Create `api/` folder in your project root
2. Convert each route file to a serverless function
3. Update the authService to use `/api/` endpoints

## Testing Your Deployment

1. Check backend health: Visit `https://your-backend-url.vercel.app/api/health`
2. Test sign up on your frontend: `https://un-cloud-india.vercel.app/sign-up`

## Current Configuration

The app now automatically detects whether it's running in production or development:
- **Development**: Uses `http://localhost:5001/api`
- **Production**: Uses the URL specified in `VITE_API_BASE_URL_PRODUCTION`

## Files Modified

- `src/services/authService.ts` - Updated to use different API URLs based on environment
- `.env` - Added production API URL variable
- `server/vercel.json` - Configuration for backend deployment