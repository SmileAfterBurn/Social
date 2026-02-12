# Deployment Guide for Vercel

## Prerequisites

- Vercel account (sign up at [vercel.com](https://vercel.com))
- GitHub repository connected to Vercel

## Quick Deploy

### Option 1: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository: `SmileAfterBurn/Social`
3. Configure the project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Add environment variables (if needed):
   - `VITE_GOOGLE_MAPS_API_KEY` (for Google Maps functionality)
   - `VITE_GEMINI_API_KEY` (for AI assistant)
   - `VITE_FIREBASE_API_KEY` (for Firebase)
   - Other Firebase configuration variables as needed
5. Click **Deploy**

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Configuration

The repository includes a `vercel.json` configuration file with:

- **Build settings**: Automatic Vite framework detection
- **Routing**: SPA fallback to index.html for all routes
- **Security headers**: Content security and XSS protection
- **Caching**: Optimized caching for static assets

## Environment Variables

The application may require the following environment variables for full functionality:

### Required for Google Maps
```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Required for AI Assistant (Gemini)
```
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Required for Firebase
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

> **Note**: Add these variables in the Vercel dashboard under **Project Settings → Environment Variables**

## Post-Deployment

After successful deployment:

1. **Verify the deployment**: Visit your Vercel deployment URL
2. **Test functionality**: 
   - Check if the map loads correctly
   - Test the AI assistant
   - Verify organization data displays properly
3. **Custom Domain** (optional): 
   - Go to **Project Settings → Domains**
   - Add your custom domain
   - Configure DNS records as instructed

## Automatic Deployments

Vercel automatically deploys:
- **Production**: Pushes to the `main` branch
- **Preview**: Pull requests and other branches

## Monitoring

Monitor your deployment:
- **Analytics**: Available in Vercel dashboard
- **Logs**: Real-time logs in the deployment details
- **Performance**: Web Vitals and Core Web Vitals metrics

## Troubleshooting

### Build fails
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility
- Review build logs in Vercel dashboard

### Runtime errors
- Ensure all environment variables are set
- Check browser console for errors
- Verify API keys are valid

### Map not loading
- Verify `VITE_GOOGLE_MAPS_API_KEY` is set correctly
- Check API key has necessary permissions
- Verify billing is enabled for Google Maps API

## Support

For issues or questions:
- GitHub Issues: [SmileAfterBurn/Social/issues](https://github.com/SmileAfterBurn/Social/issues)
- Email: chernov.illia@icloud.com

---

## About

**SmileAfterBurn Social Projects**  
© 2026 Ілля Чернов. Усі права захищено.

🇺🇦 Made with love for Ukraine 🇺🇦
