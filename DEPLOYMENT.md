# Deployment Guide - Threat Intelligence Platform

## Prerequisites

1. Supabase account and project
2. Node.js and npm installed
3. Supabase CLI (optional, for advanced deployments)

## Step 1: Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project dashboard.

## Step 2: Deploy Edge Functions

### Option A: Using Supabase Dashboard (Recommended)

1. Navigate to your Supabase project
2. Go to Edge Functions section
3. Create new function `rss-feed-processor`
4. Copy content from `supabase/functions/rss-feed-processor/index.ts`
5. Deploy the function
6. Repeat for `threat-profile-generator`

### Option B: Using Supabase CLI

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy both functions
supabase functions deploy rss-feed-processor
supabase functions deploy threat-profile-generator
```

## Step 3: Setup Database

Execute the database migration SQL in your Supabase SQL Editor.

The migration creates:
- 6 main tables with proper relationships
- Row Level Security (RLS) policies
- Indexes for performance
- Initial data for industries, regions, technologies, and threat feeds

You can find the migration file referenced in the documentation.

## Step 4: Configure API Proxy (Development)

For local development, you may need to proxy API calls. Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'YOUR_SUPABASE_URL/functions/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

## Step 5: Build and Deploy Frontend

```bash
# Install dependencies
npm install

# Build for production
npm run build

# The dist/ folder contains your production build
```

Deploy the `dist/` folder to your preferred hosting:
- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages
- Any static hosting service

## Step 6: Verify Deployment

1. Access your deployed application
2. Configure a test threat profile
3. Verify feeds are processing correctly
4. Check that profile generation completes successfully

## Troubleshooting

### CORS Errors

Ensure Edge Functions include proper CORS headers:
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};
```

### Function Timeouts

Some RSS feeds may be slow. Consider:
- Reducing the number of feeds processed simultaneously
- Implementing retry logic
- Increasing function timeout settings

### Database Connection Issues

Verify:
- Environment variables are correctly set
- Supabase project is active
- Database migration was successful
- RLS policies are properly configured

## Production Considerations

1. **Rate Limiting**: Implement rate limiting on Edge Functions
2. **Caching**: Cache RSS feed results to reduce external requests
3. **Monitoring**: Set up logging and monitoring for Edge Functions
4. **Error Handling**: Implement comprehensive error tracking
5. **Authentication**: Add user authentication if multi-tenant
6. **Backup**: Regular database backups of threat profiles

## Security Checklist

- ✅ RLS enabled on all tables
- ✅ Environment variables secured
- ✅ CORS properly configured
- ✅ Input validation in Edge Functions
- ✅ No secrets in client-side code
- ✅ HTTPS enforced

## Performance Optimization

1. **Database Indexes**: Already created in migration
2. **Function Cold Starts**: Keep functions warm with scheduled pings
3. **Client-Side Caching**: Implement service workers for offline capability
4. **Lazy Loading**: Components are already optimized
5. **Bundle Size**: Monitor and optimize using build analyzer

## Monitoring and Maintenance

### Key Metrics to Track

- Edge Function execution time
- RSS feed fetch success rate
- Database query performance
- User profile generation time
- Error rates

### Regular Maintenance Tasks

- Weekly: Review failed feed fetches
- Monthly: Update threat feed list
- Quarterly: Analyze and optimize database queries
- As needed: Update industries/regions/technologies catalogs

## Support and Updates

For updates and support:
1. Check the main documentation
2. Review Supabase logs for Edge Functions
3. Monitor RSS feed sources for changes
4. Keep dependencies updated

## Cost Estimation

Supabase Free Tier includes:
- 500MB database
- 2GB bandwidth
- 500K Edge Function invocations

For production use, consider:
- Pro tier for higher limits
- Database usage based on article storage
- Edge Function invocations per profile generation

Typical monthly usage:
- 100 profile generations: ~1000 Edge Function calls
- Database storage: <100MB for 6 months of articles
- Well within free tier for small to medium use

## Next Steps

After deployment:
1. Create your first threat profile
2. Schedule regular profile generation
3. Integrate with your security workflow
4. Export profiles for SIEM integration
5. Train team on using the platform
