# Deployment Guide for SETALKEL Project

## Prerequisites

- Node.js (version 16.x or higher)
- npm or yarn
- A server with Node.js support (e.g., Vercel, Netlify, AWS, DigitalOcean, etc.)
- Firebase project (for authentication and messaging features)

## Build Process

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create or update the `.env` file in the project root with the following variables:
   ```
   # API Configuration
   NEXT_PUBLIC_API_URL=https://st.amjadshbib.com/api
   # Or your custom API URL if you're deploying your own backend

   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
   NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
   NEXT_PUBLIC_FIREBASE_VAPID_KEY=YOUR_VAPID_KEY
   ```
   Replace the Firebase placeholder values with your actual Firebase project credentials.

3. **Build the project:**
   ```bash
   npm run build
   ```
   This will create an optimized production build in the `.next` directory.

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy to Vercel:
   ```bash
   vercel
   ```
   Follow the prompts to configure your deployment.

3. For production deployment:
   ```bash
   vercel --prod
   ```

### Option 2: Traditional Node.js Server

1. Build the project as described above.

2. Start the production server:
   ```bash
   npm start
   ```
   This will start the Next.js server on port 3000 by default.

3. For production deployment, you can use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start npm --name "setalkel" -- start
   ```

### Option 3: Static Export (for static hosting)

1. Build and export the project:
   ```bash
   npm run build
   npm run export
   ```
   This will create a static version of your site in the `out` directory.

2. Deploy the contents of the `out` directory to any static hosting service like Netlify, GitHub Pages, or Amazon S3.

## Additional Configuration

### Firebase Configuration

Update the Firebase configuration in `src/firebase/firebase.js` and `public/firebase-messaging-sw.js` with your actual Firebase project credentials.

### API URL Configuration

The application is currently configured to use `https://st.amjadshbib.com/api/` as the API base URL. If you need to use a different API endpoint, update the `.env` file and ensure all API calls in the codebase use the environment variable.

## Troubleshooting

- If you encounter issues with the build process, check the Next.js build logs for specific errors.
- Ensure all environment variables are correctly set before building and deploying.
- For Firebase-related issues, verify your Firebase project configuration and credentials.

## Maintenance

- Regularly update dependencies to ensure security and performance improvements.
- Monitor server logs for any errors or performance issues.
- Keep your Firebase project and API endpoints secure and up-to-date.