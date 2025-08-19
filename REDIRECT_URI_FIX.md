# Fix redirect_uri_mismatch Error

## The Problem
Google OAuth requires the redirect URI in your request to **exactly match** what's configured in Google Cloud Console.

## Debug Your Current Setup

1. **Check Debug Info**: Look at the debug panel in your app showing:
   - Current URL (what your app is running on)
   - Configured redirect URI (what your code is sending)
   - Generated OAuth URL

## Google Cloud Console Setup

Go to: https://console.cloud.google.com/apis/credentials

Find your OAuth 2.0 Client ID: `204501514447-i1rsq4br0oh872p803qth5loitagb1u6.apps.googleusercontent.com`

### Add ALL These Redirect URIs:

**Authorized JavaScript Origins:**
```
http://localhost:5000
http://127.0.0.1:5000
```

**Authorized Redirect URIs:**
```
http://localhost:5000
http://localhost:5000/
http://127.0.0.1:5000
http://127.0.0.1:5000/
```

## Common Issues & Solutions

### Issue 1: Trailing Slash
- ❌ App sends: `http://localhost:5000`
- ❌ Console has: `http://localhost:5000/`
- ✅ **Solution**: Add both versions

### Issue 2: Port Mismatch
- ❌ App runs on port 5000, Console has port 3000
- ✅ **Solution**: Update Console to match your dev server port

### Issue 3: localhost vs 127.0.0.1
- Some browsers use `127.0.0.1` instead of `localhost`
- ✅ **Solution**: Add both in Google Console

### Issue 4: Case Sensitivity
- URIs are case-sensitive
- ✅ **Solution**: Copy exact URL from debug panel

## Test Steps

1. **Save** changes in Google Cloud Console
2. **Wait 2-3 minutes** for changes to propagate
3. **Clear browser cache** and localStorage
4. **Restart your dev server**: `npm run dev`
5. **Try signing in** again

## Alternative: Create New OAuth Client

If the existing client won't work:

1. Create new OAuth 2.0 Client ID in Google Console
2. Application type: "Web application"
3. Name: "Fashion AI Development"
4. Authorized JavaScript origins: `http://localhost:5000`
5. Authorized redirect URIs: `http://localhost:5000`
6. Copy new Client ID
7. Update `.env` file with new Client ID

## Verify Setup

The debug panel will show you exactly what your app is sending vs what Google expects. Make sure they match character-for-character!