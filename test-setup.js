// Simple test script to validate the setup
console.log('🧪 Testing Uncloud Setup...\n');

// Check environment variables
const requiredEnvVars = [
  'VITE_OPENAI_API_KEY',
  'MONGODB_URI', 
  'JWT_SECRET',
  'VITE_API_BASE_URL'
];

let missingVars = [];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
  } else {
    console.log(`✅ ${varName}: Set`);
  }
});

if (missingVars.length > 0) {
  console.log('\n❌ Missing environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\nPlease update your .env file with the missing variables.');
  process.exit(1);
} else {
  console.log('\n✅ All environment variables are set!');
  console.log('\n🚀 Setup looks good! You can now run:');
  console.log('   npm run dev:all');
}