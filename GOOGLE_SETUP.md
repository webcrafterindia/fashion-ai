# Google OAuth Setup Instructions

## Fix "The given origin is not allowed" Error

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Select your project (or create a new one)

### 2. Enable Google+ API (if not already enabled)
- Go to "APIs & Services" → "Library"
- Search for "Google+ API" 
- Click "Enable"

### 3. Configure OAuth 2.0 Credentials
- Go to "APIs & Services" → "Credentials"
- Find your OAuth 2.0 Client ID: `204501514447-i1rsq4br0oh872p803qth5loitagb1u6.apps.googleusercontent.com`
- Click on it to edit

### 4. Add Authorized JavaScript Origins
Add these origins to your OAuth client:

**For Development:**
```
http://localhost:5000
http://127.0.0.1:5000
```

**For Production (when you deploy):**
```
https://yourdomain.com
```

### 5. Add Authorized Redirect URIs
Add these redirect URIs:

**For Development:**
```
http://localhost:5000
http://127.0.0.1:5000
```

**For Production (when you deploy):**
```
https://yourdomain.com
```

### 6. Save Changes
- Click "Save" in the Google Cloud Console
- Wait a few minutes for changes to propagate

## Alternative: Create New OAuth Client

If you can't edit the existing client, create a new one:

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Choose "Web application"
4. Name: "Fashion AI Local Development"
5. Add origins: `http://localhost:5000`
6. Add redirect URIs: `http://localhost:5000`
7. Copy the new Client ID
8. Update your `.env` file with the new Client ID

## Test the Setup

After making changes:

1. Restart your development server: `npm run dev`
2. Clear browser cache and localStorage
3. Try signing in with Google again

The authentication should now work without origin errors!