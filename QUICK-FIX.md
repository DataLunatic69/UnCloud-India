# Quick Fix: Mock Backend for Testing

If you want to test the frontend without deploying the backend, you can temporarily use mock responses.

## Option 1: Deploy Backend (Recommended)
Follow the DEPLOYMENT.md guide to deploy your backend to Vercel.

## Option 2: Temporary Mock for Testing

Replace the authService calls with mock data temporarily:

```typescript
// In src/services/authService.ts, replace the signUp method with:
async signUp(userData: SignUpData): Promise<AuthResponse> {
  // Mock successful response for testing
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Account created successfully!',
        data: {
          user: {
            id: 'mock-user-id',
            email: userData.email,
            name: userData.name || 'User',
            preferences: {
              language: 'en',
              reminders: true,
              darkMode: false
            },
            isVerified: false,
            createdAt: new Date().toISOString()
          },
          token: 'mock-jwt-token'
        }
      });
    }, 1000);
  });
}
```

This will allow you to test the UI flow while you set up the backend deployment.