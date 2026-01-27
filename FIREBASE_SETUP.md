# Firebase Setup Guide

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `badminton-league`
4. Click "Create project"
5. Wait for project creation to complete

## Step 2: Register a Web App

1. In Firebase Console, click the web icon (`</>`
2. Enter app name: `Badminton League`
3. Click "Register app"
4. Copy the config object that appears

## Step 3: Set Up Environment Variables

1. Create a file named `.env.local` in the project root (same level as `package.json`)
2. Copy the Firebase config values:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

3. Save the file

## Step 4: Enable Firestore Database

1. In Firebase Console, go to "Build" → "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Click "Next"
5. Select region closest to you
6. Click "Enable"

## Step 5: Set Firestore Security Rules (Important!)

1. Go to Firestore Database → Rules tab
2. Replace the default rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **Note**: This allows anyone to read/write. For production, add proper authentication!

3. Click "Publish"

## Step 6: Run Your App

```bash
npm run dev
```

The app will now sync data in real-time across all users! 🎉

## Deploying to Netlify

When deploying to Netlify:

1. Go to Netlify → Your Site → Site Settings → Build & Deploy → Environment
2. Add the environment variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
3. Trigger a redeploy

## Troubleshooting

- **"Firebase not configured" warning**: Make sure `.env.local` file exists with all Firebase credentials
- **Data not syncing**: Check Firestore Rules - might be too restrictive
- **401 Error**: Firebase credentials might be wrong - verify in Firebase Console
