# Supabase OAuth Configuration Guide

## 🚀 Setting Up Google and Apple SSO

### Prerequisites
- Supabase project created
- Google Cloud Console account
- Apple Developer account (for Apple Sign In)

---

## 1. Google OAuth Setup

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"

4. **Configure OAuth Client**
   ```
   Name: AURUM App
   
   Authorized JavaScript origins:
   - http://localhost:5173 (for development)
   - https://your-domain.com (for production)
   
   Authorized redirect URIs:
   - https://your-supabase-project.supabase.co/auth/v1/callback
   ```

5. **Save Credentials**
   - Copy the `Client ID` and `Client Secret`

### Step 2: Configure Supabase

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication**
   - Go to "Authentication" → "Providers"
   - Find "Google" in the list

3. **Enable Google Provider**
   ```
   Enable Google: ✅ ON
   
   Client ID: [Your Google Client ID]
   Client Secret: [Your Google Client Secret]
   
   Redirect URL: https://your-supabase-project.supabase.co/auth/v1/callback
   ```

4. **Save Configuration**

---

## 2. Apple Sign In Setup

### Step 1: Configure Apple Developer Account

1. **Go to Apple Developer Console**
   - Visit: https://developer.apple.com/account/
   - Sign in with your Apple Developer account

2. **Create App ID**
   - Go to "Certificates, Identifiers & Profiles"
   - Click "Identifiers" → "+"
   - Choose "App IDs"
   - Configure:
     ```
     Description: AURUM App
     Bundle ID: com.aurum.app (or your domain)
     Capabilities: Sign In with Apple ✅
     ```

3. **Create Service ID**
   - Go to "Identifiers" → "+"
   - Choose "Services IDs"
   - Configure:
     ```
     Description: AURUM Web Service
     Identifier: com.aurum.web (or your domain)
     ```

4. **Configure Service ID**
   - Select your Service ID
   - Enable "Sign In with Apple"
   - Click "Configure"
   - Add domains and redirect URLs:
     ```
     Primary App ID: [Your App ID from step 2]
     
     Domains and Subdomains:
     - localhost (for development)
     - your-domain.com (for production)
     - your-supabase-project.supabase.co
     
     Return URLs:
     - https://your-supabase-project.supabase.co/auth/v1/callback
     ```

5. **Create Private Key**
   - Go to "Keys" → "+"
   - Configure:
     ```
     Key Name: AURUM Apple Sign In Key
     Services: Sign In with Apple ✅
     ```
   - Download the `.p8` file and note the Key ID

### Step 2: Configure Supabase

1. **Go to Supabase Dashboard**
   - Navigate to "Authentication" → "Providers"
   - Find "Apple" in the list

2. **Enable Apple Provider**
   ```
   Enable Apple: ✅ ON
   
   Service ID: [Your Service ID from Apple]
   Team ID: [Your Apple Team ID - found in Apple Developer account]
   Key ID: [Your Key ID from the private key]
   Private Key: [Contents of the .p8 file]
   
   Redirect URL: https://your-supabase-project.supabase.co/auth/v1/callback
   ```

3. **Save Configuration**

---

## 3. Update Environment Variables

Add these to your `.env` file:

```env
# Supabase Configuration (already exists)
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OAuth Configuration (optional - handled by Supabase)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_APPLE_CLIENT_ID=your-apple-service-id
```

---

## 4. Test OAuth Integration

### Development Testing

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Test Google Sign In**
   - Go to http://localhost:5173/login
   - Click "Continue with Google"
   - Should redirect to Google OAuth
   - After approval, should redirect back to your app

3. **Test Apple Sign In** (iOS/macOS Safari only)
   - Go to http://localhost:5173/login on Safari
   - Click "Continue with Apple"
   - Should show Apple Sign In modal
   - After approval, should redirect back to your app

### Production Testing

1. **Deploy your app**
2. **Update OAuth configurations** with production URLs
3. **Test both providers** in production environment

---

## 5. Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" Error**
   - Ensure redirect URIs match exactly in OAuth provider settings
   - Check for trailing slashes and protocol (http vs https)

2. **Apple Sign In not showing**
   - Only works on iOS Safari and macOS Safari
   - Check if device detection is working correctly

3. **Google OAuth not working**
   - Verify Google+ API is enabled
   - Check client ID and secret are correct
   - Ensure JavaScript origins are configured

4. **CORS Issues**
   - Add your domain to Supabase allowed origins
   - Check browser console for CORS errors

### Debug Steps

1. **Check Supabase Logs**
   - Go to Supabase Dashboard → "Logs"
   - Look for authentication errors

2. **Browser Developer Tools**
   - Check Network tab for failed requests
   - Look for console errors

3. **Test with Supabase CLI**
   ```bash
   npx supabase functions serve
   ```

---

## 6. Security Best Practices

1. **Environment Variables**
   - Never commit OAuth secrets to version control
   - Use different credentials for development/production

2. **Redirect URIs**
   - Only add necessary redirect URIs
   - Use HTTPS in production

3. **Scopes**
   - Request minimal necessary permissions
   - Review OAuth scopes regularly

4. **Rate Limiting**
   - Implement rate limiting for auth endpoints
   - Monitor for suspicious activity

---

## 7. Additional Features

### Custom OAuth Flows

You can customize the OAuth experience:

```typescript
// Custom Google Sign In with additional scopes
await signInWithGoogle({
  options: {
    scopes: 'email profile',
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  }
});

// Custom Apple Sign In
await signInWithApple({
  options: {
    scopes: 'name email',
  }
});
```

### Profile Data Handling

The app automatically extracts profile data:

```typescript
// User object after OAuth sign in
{
  id: "uuid",
  email: "user@example.com",
  user_metadata: {
    full_name: "John Doe",
    avatar_url: "https://...",
    provider: "google" | "apple"
  }
}
```

---

## 8. Next Steps

After OAuth is configured:

1. **Test thoroughly** on different devices
2. **Set up user profiles** in your database
3. **Implement role-based access** if needed
4. **Add logout functionality**
5. **Monitor authentication metrics**

---

## Support

If you encounter issues:

1. **Supabase Documentation**: https://supabase.com/docs/guides/auth
2. **Google OAuth Documentation**: https://developers.google.com/identity/protocols/oauth2
3. **Apple Sign In Documentation**: https://developer.apple.com/sign-in-with-apple/

The authentication system is now ready for production use with secure, modern OAuth flows! 🎉