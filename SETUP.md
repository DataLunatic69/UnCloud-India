# 🚀 Quick Setup Guide for Uncloud India

## ✅ What's Been Added

### Backend Features
- **MongoDB Integration**: Complete database setup with user authentication
- **JWT Authentication**: Secure token-based authentication system
- **User Management**: Sign up, sign in, sign out functionality
- **Password Security**: bcryptjs hashing with 12 rounds
- **API Security**: Rate limiting, CORS, Helmet.js protection
- **Input Validation**: Express-validator for form validation

### Frontend Features
- **Authentication UI**: Beautiful sign in/sign up pages with error handling
- **User Context**: React context for managing authentication state
- **Protected Routes**: Route protection for authenticated users
- **User Profile**: Header with user avatar and dropdown menu
- **Loading States**: Loading indicators during authentication
- **Form Validation**: Client-side form validation with error messages

### Project Structure
```
Project/
├── server/              # Backend API server
│   ├── config/         # Database configuration
│   ├── models/         # MongoDB schemas (User, Mood, ChatSession)
│   ├── routes/         # API endpoints (/auth/*)
│   ├── middleware/     # Authentication middleware
│   └── index.js        # Express server
├── src/
│   ├── services/       # API service layer
│   ├── contexts/       # AuthContext for user state
│   ├── hooks/          # useAuth custom hook
│   └── components/     # ProtectedRoute component
└── .env                # Environment variables
```

## 🔧 Required Setup Steps

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure MongoDB
You need a MongoDB database. Choose one option:

#### Option A: MongoDB Atlas (Cloud) - Recommended
1. Go to https://www.mongodb.com/atlas
2. Create a free account and cluster
3. Create a database user
4. Get your connection string
5. Update `.env` file with your connection string

#### Option B: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Update `.env` with: `MONGODB_URI=mongodb://localhost:27017/uncloud-db`

### 3. Set Environment Variables
Update `.env` file:
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_super_secure_random_string_at_least_32_characters_long
JWT_EXPIRES_IN=7d
VITE_API_BASE_URL=http://localhost:5000/api
```

### 4. Test Connection
```bash
cd server
npm run test:connection
```

### 5. Start the Application
```bash
npm run dev:all
```

This starts:
- Backend server: http://localhost:5000
- Frontend server: http://localhost:5173

## 🔒 Authentication Features

### Sign Up
- Email and password validation
- Optional name field
- Password strength requirements
- Terms of service agreement
- Automatic login after registration

### Sign In
- Email/password authentication
- Secure JWT token generation
- Remember me functionality
- Error handling for invalid credentials

### User Management
- Profile updates
- Preference management
- Secure logout
- Session management

### Security Features
- Password hashing (bcryptjs, 12 rounds)
- JWT tokens with expiration
- Rate limiting (5 auth attempts per 15 minutes)
- Input validation and sanitization
- CORS protection
- Security headers with Helmet.js

## 🧪 Testing the Setup

1. **Test MongoDB connection**: `cd server && npm run test:connection`
2. **Start servers**: `npm run dev:all`
3. **Visit**: http://localhost:5173
4. **Try sign up**: Create a new account
5. **Try sign in**: Log in with your credentials
6. **Check header**: User avatar should appear after login

## 🐛 Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running (local) or connection string is correct (Atlas)
- Check firewall and network connectivity
- Verify database user credentials

### JWT Errors
- Ensure JWT_SECRET is set and secure (at least 32 characters)
- Check token expiration settings

### Port Conflicts
- Change backend port in server/index.js if 5000 is in use
- Change frontend port with `npm run dev -- --port 3000`

### CORS Issues
- Ensure frontend URL matches in server configuration
- Check API base URL in environment variables

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/me` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Example Request/Response

**Sign Up:**
```json
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "securepassword123",
  "confirmPassword": "securepassword123",
  "name": "John Doe"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

## 🎯 Next Steps

1. Set up your MongoDB database
2. Configure environment variables  
3. Test the connection
4. Start development servers
5. Try the authentication flow
6. Customize the UI as needed

Happy coding! 🚀