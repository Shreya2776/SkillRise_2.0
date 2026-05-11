# 🚀 Deployment Guide - SkillRise India

## Overview
This guide covers deploying the SkillRise India platform to production using:
- **Backend:** Render (or Railway/Heroku)
- **Frontend:** Vercel (or Netlify)
- **Database:** MongoDB Atlas

---

## 📋 Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] Database indexes created
- [ ] API keys obtained
- [ ] Domain name purchased (optional)
- [ ] SSL certificates ready (handled by hosting)
- [ ] Backup strategy in place

---

## 1️⃣ Database Setup (MongoDB Atlas)

### Create Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Click "Build a Database"
4. Choose "Shared" (Free tier) or "Dedicated"
5. Select cloud provider and region (closest to your users)
6. Name your cluster (e.g., "skillrise-prod")
7. Click "Create Cluster"

### Configure Database Access
1. Go to "Database Access"
2. Click "Add New Database User"
3. Create username and strong password
4. Set privileges to "Read and write to any database"
5. Click "Add User"

### Configure Network Access
1. Go to "Network Access"
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add specific IPs of your hosting provider
5. Click "Confirm"

### Get Connection String
1. Go to "Database" → "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with your database name (e.g., "skillrise")

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/skillrise?retryWrites=true&w=majority
```

### Create Indexes (Optional but Recommended)
Connect to your database and run:
```javascript
// Users collection
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

// Profiles collection
db.profiles.createIndex({ user: 1 });
db.profiles.createIndex({ skills: 1 });

// Opportunities collection
db.opportunities.createIndex({ location: 1 });
db.opportunities.createIndex({ skills: 1 });
db.opportunities.createIndex({ createdAt: -1 });

// Chat threads
db.chatthreads.createIndex({ userId: 1 });
db.chatthreads.createIndex({ createdAt: -1 });
```

---

## 2️⃣ Backend Deployment (Render)

### Prepare Repository
1. Ensure `backend/` directory is in your GitHub repository
2. Ensure `.gitignore` excludes:
   ```
   node_modules/
   .env
   *.log
   uploads/
   ```

### Create Render Account
1. Go to [Render](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure service:
   - **Name:** `skillrise-backend`
   - **Region:** Choose closest to your users
   - **Branch:** `main` (or your production branch)
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (or paid for better performance)

### Set Environment Variables
In Render dashboard, go to "Environment" and add:

```env
PORT=8000
NODE_ENV=production

# Database
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/skillrise

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRE=7d

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend-url.onrender.com/api/auth/google/callback

# AI Services
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama3-8b-8192
GEMINI_API_KEY=your-gemini-api-key

# Frontend URL (for CORS)
CLIENT_URL=https://your-frontend-url.vercel.app
```

### Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Note your backend URL: `https://skillrise-backend.onrender.com`

### Verify Deployment
1. Visit: `https://your-backend-url.onrender.com/api/health`
2. Should return:
   ```json
   {
     "success": true,
     "status": "SkillRise API Online",
     "services": ["auth", "resume", "interview", "chatbot"]
   }
   ```

### Configure Custom Domain (Optional)
1. Purchase domain (e.g., from Namecheap, GoDaddy)
2. In Render, go to "Settings" → "Custom Domain"
3. Add your domain (e.g., `api.skillrise.com`)
4. Update DNS records as instructed by Render
5. Wait for SSL certificate to be issued (automatic)

---

## 3️⃣ Frontend Deployment (Vercel)

### Prepare Repository
1. Ensure `client/` directory is in your GitHub repository
2. Update `client/.env.production`:
   ```env
   VITE_API_URL=https://your-backend-url.onrender.com/api/auth
   ```

### Create Vercel Account
1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Authorize Vercel to access your repositories

### Import Project
1. Click "Add New..." → "Project"
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Set Environment Variables
In Vercel dashboard, go to "Settings" → "Environment Variables":

```env
VITE_API_URL=https://your-backend-url.onrender.com/api/auth
```

### Deploy
1. Click "Deploy"
2. Wait for deployment (2-5 minutes)
3. Note your frontend URL: `https://your-project.vercel.app`

### Configure Custom Domain (Optional)
1. In Vercel, go to "Settings" → "Domains"
2. Add your domain (e.g., `skillrise.com` or `www.skillrise.com`)
3. Update DNS records as instructed by Vercel
4. Wait for SSL certificate (automatic)

### Update Backend CORS
1. Go back to Render backend
2. Update `CLIENT_URL` environment variable to your Vercel URL
3. Redeploy backend

---

## 4️⃣ Google OAuth Configuration

### Update Authorized Origins
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Click on your OAuth 2.0 Client ID
5. Add to "Authorized JavaScript origins":
   ```
   https://your-frontend-url.vercel.app
   https://your-backend-url.onrender.com
   ```
6. Add to "Authorized redirect URIs":
   ```
   https://your-backend-url.onrender.com/api/auth/google/callback
   ```
7. Click "Save"

---

## 5️⃣ Email Configuration (Gmail)

### Generate App Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification (if not already enabled)
3. Go to "App passwords"
4. Select "Mail" and "Other (Custom name)"
5. Name it "SkillRise Backend"
6. Click "Generate"
7. Copy the 16-character password
8. Use this as `EMAIL_PASS` in environment variables

---

## 6️⃣ API Keys Setup

### Groq API Key
1. Go to [Groq Console](https://console.groq.com)
2. Sign up or log in
3. Go to "API Keys"
4. Click "Create API Key"
5. Name it "SkillRise Production"
6. Copy the key
7. Use as `GROQ_API_KEY`

### Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Select or create a project
5. Copy the key
6. Use as `GEMINI_API_KEY`

---

## 7️⃣ Post-Deployment Configuration

### Update Backend CORS
Ensure `backend/server.js` includes production URLs:
```javascript
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8000",
  "https://your-frontend.vercel.app",
  "https://your-backend.onrender.com",
  process.env.CLIENT_URL
].filter(Boolean);
```

### Create Admin Account
1. SSH into your backend or use Render shell
2. Run seed script:
   ```bash
   node scripts/seedAdmin.js
   ```
3. Or manually create admin in MongoDB Atlas

### Test Production Deployment
1. Visit your frontend URL
2. Test user registration
3. Test login
4. Test Google OAuth
5. Test all major features
6. Check browser console for errors
7. Check backend logs in Render

---

## 8️⃣ Monitoring & Maintenance

### Set Up Monitoring
1. **Render:**
   - Enable "Auto-Deploy" for automatic deployments on git push
   - Set up "Health Check Path": `/api/health`
   - Configure "Alerts" for downtime

2. **Vercel:**
   - Enable "Production Branch" auto-deploy
   - Set up "Deployment Protection" (optional)

### Log Monitoring
1. **Render Logs:**
   - Go to "Logs" tab in Render dashboard
   - Monitor for errors and warnings

2. **Vercel Logs:**
   - Go to "Deployments" → Select deployment → "Logs"

### Database Monitoring
1. **MongoDB Atlas:**
   - Go to "Metrics" tab
   - Monitor connections, operations, memory usage
   - Set up alerts for high usage

### Performance Monitoring (Optional)
Consider integrating:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Google Analytics** - User analytics
- **Hotjar** - User behavior

---

## 9️⃣ Backup Strategy

### Database Backups
1. **MongoDB Atlas:**
   - Go to "Backup" tab
   - Enable "Cloud Backup"
   - Configure backup schedule (daily recommended)
   - Set retention policy

2. **Manual Backups:**
   ```bash
   mongodump --uri="mongodb+srv://..." --out=./backup
   ```

### Code Backups
- Use Git tags for releases
- Keep production branch protected
- Maintain changelog

---

## 🔟 Scaling Considerations

### When to Scale

**Backend (Render):**
- Upgrade to paid plan when:
  - Response times > 2 seconds
  - Memory usage > 80%
  - CPU usage consistently high
  - Need more than 512MB RAM

**Database (MongoDB Atlas):**
- Upgrade when:
  - Storage > 80% of free tier (512MB)
  - Connections frequently maxed out
  - Query performance degrades

**Frontend (Vercel):**
- Usually scales automatically
- Upgrade for:
  - Custom domains
  - More team members
  - Advanced analytics

### Optimization Tips
1. **Backend:**
   - Enable response caching
   - Optimize database queries
   - Use connection pooling
   - Implement rate limiting

2. **Frontend:**
   - Code splitting
   - Lazy loading
   - Image optimization
   - CDN for static assets

3. **Database:**
   - Create proper indexes
   - Implement pagination
   - Archive old data
   - Use aggregation pipelines

---

## 🚨 Troubleshooting

### Backend Won't Start
- Check environment variables are set
- Verify MongoDB connection string
- Check Render logs for errors
- Ensure `package.json` has correct start script

### Frontend Can't Connect to Backend
- Verify `VITE_API_URL` is correct
- Check CORS configuration in backend
- Verify backend is running (health check)
- Check browser console for CORS errors

### Google OAuth Not Working
- Verify redirect URIs in Google Console
- Check `GOOGLE_CALLBACK_URL` matches exactly
- Ensure frontend URL is in authorized origins
- Clear browser cookies and try again

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist
- Check connection string format
- Ensure database user has correct permissions
- Test connection with MongoDB Compass

### Slow Performance
- Check Render logs for memory/CPU usage
- Optimize database queries
- Enable caching
- Consider upgrading hosting plan

---

## 📊 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables documented
- [ ] Database indexes created
- [ ] API keys obtained
- [ ] CORS configured
- [ ] Error handling implemented
- [ ] Logging configured

### Deployment
- [ ] MongoDB Atlas cluster created
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set
- [ ] Google OAuth configured
- [ ] Email service configured
- [ ] Custom domains configured (optional)

### Post-Deployment
- [ ] Health check endpoint working
- [ ] User registration working
- [ ] Login working
- [ ] Google OAuth working
- [ ] All features tested
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Documentation updated

---

## 🎉 Deployment Complete!

Your SkillRise India platform is now live! 🚀

**URLs:**
- Frontend: `https://your-frontend.vercel.app`
- Backend: `https://your-backend.onrender.com`
- Health Check: `https://your-backend.onrender.com/api/health`

**Next Steps:**
1. Share with users
2. Monitor performance
3. Gather feedback
4. Iterate and improve

---

## 📞 Support Resources

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com
- **GitHub Issues:** Report bugs in your repository

---

**Happy Deploying! 🎊**
