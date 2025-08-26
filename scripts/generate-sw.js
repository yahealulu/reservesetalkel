const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Read the template file
const templatePath = path.join(__dirname, '../public/firebase-messaging-sw-template.js');
const outputPath = path.join(__dirname, '../public/firebase-messaging-sw.js');

let swContent = fs.readFileSync(templatePath, 'utf8');

// Replace placeholders with environment variables
swContent = swContent.replace('__FIREBASE_API_KEY__', process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'YOUR_API_KEY');
swContent = swContent.replace('__FIREBASE_AUTH_DOMAIN__', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN');
swContent = swContent.replace('__FIREBASE_PROJECT_ID__', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID');
swContent = swContent.replace('__FIREBASE_STORAGE_BUCKET__', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET');
swContent = swContent.replace('__FIREBASE_MESSAGING_SENDER_ID__', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID');
swContent = swContent.replace('__FIREBASE_APP_ID__', process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'YOUR_APP_ID');

// Write the generated service worker
fs.writeFileSync(outputPath, swContent);

console.log('Firebase service worker generated successfully!');