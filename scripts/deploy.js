const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the environment from command line arguments
const args = process.argv.slice(2);
const env = args[0] || 'production';

console.log(`Deploying to ${env} environment...`);

// Generate the service worker with environment variables
console.log('Generating service worker...');
try {
  execSync('node scripts/generate-sw.js', { stdio: 'inherit' });
  console.log('Service worker generated successfully!');
} catch (error) {
  console.error('Error generating service worker:', error);
  process.exit(1);
}

// Build the application
console.log('Building the application...');
try {
  execSync('next build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Error building the application:', error);
  process.exit(1);
}

console.log(`\nDeployment for ${env} environment completed successfully!`);
console.log('\nTo start the application, run:');
console.log('  npm start');

console.log('\nFor more information on deployment options, refer to DEPLOYMENT.md');