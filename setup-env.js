const fs = require('fs');
const path = require('path');

console.log('🔧 SETTING UP ENVIRONMENT VARIABLES...\n');

const envPath = path.join(__dirname, '.env.local');
const envContent = `# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=kriptocar

# Email Configuration (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
NEXT_PUBLIC_APP_URL=http://localhost:3000
`;

try {
  if (fs.existsSync(envPath)) {
    console.log('✅ .env.local file already exists');
    console.log('📋 Current content:');
    const currentContent = fs.readFileSync(envPath, 'utf8');
    console.log(currentContent);
  } else {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file');
    console.log('📋 Please update the following values:');
    console.log('  - DB_PASSWORD: Your MySQL password');
    console.log('  - EMAIL_USER: Your email (optional)');
    console.log('  - EMAIL_PASSWORD: Your email app password (optional)');
  }
  
  console.log('\n💡 IMPORTANT:');
  console.log('1. Replace "your_password_here" with your actual MySQL password');
  console.log('2. Make sure MySQL is running');
  console.log('3. Create the database: CREATE DATABASE kriptocar;');
  console.log('4. Run the SQL scripts to create tables');
  
} catch (error) {
  console.error('❌ Error creating .env.local file:', error.message);
}
