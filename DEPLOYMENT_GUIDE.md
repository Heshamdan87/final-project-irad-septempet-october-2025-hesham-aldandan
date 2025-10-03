# GitHub Actions Deployment Guide

This guide will help you set up automated CI/CD for your Syriana Student App using GitHub Actions.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Setting Up GitHub Secrets](#setting-up-github-secrets)
4. [Deployment Options](#deployment-options)
5. [Environment Variables](#environment-variables)
6. [Monitoring and Logs](#monitoring-and-logs)

---

## 🎯 Overview

We've set up 4 GitHub Actions workflows:

1. **CI/CD Pipeline** (`ci-cd.yml`) - Runs on every push/PR
   - Tests backend and frontend
   - Builds the application
   - Runs security audits
   - Creates deployment artifacts

2. **Deploy to Heroku** (`deploy-heroku.yml`) - Backend deployment
3. **Deploy to Vercel** (`deploy-vercel.yml`) - Frontend deployment
4. **Deploy to Railway** (`deploy-railway.yml`) - Alternative full-stack deployment

---

## ✅ Prerequisites

Before deploying, ensure you have:

- [ ] GitHub repository with your code
- [ ] MongoDB Atlas account (for production database)
- [ ] Deployment platform account (Heroku/Vercel/Railway)
- [ ] Admin access to GitHub repository settings

---

## 🔐 Setting Up GitHub Secrets

### Step 1: Access Repository Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### Step 2: Add Required Secrets

#### For All Deployments:
```
JWT_SECRET          → Your JWT secret key (generate a strong random string)
MONGODB_URI         → MongoDB Atlas connection string
NODE_ENV            → production
```

#### For Heroku Deployment:
```
HEROKU_API_KEY             → Your Heroku API key (from Account Settings)
HEROKU_EMAIL               → Your Heroku account email
HEROKU_BACKEND_APP_NAME    → Your Heroku app name (e.g., syriana-backend)
PORT                       → 5000 (or your preferred port)
```

#### For Vercel Deployment:
```
VERCEL_TOKEN        → Vercel deployment token
VERCEL_ORG_ID       → Your Vercel organization ID
VERCEL_PROJECT_ID   → Your Vercel project ID
REACT_APP_API_URL   → Your backend API URL (e.g., https://your-backend.herokuapp.com)
```

#### For Railway Deployment:
```
RAILWAY_TOKEN       → Railway deployment token
```

---

## 🚀 Deployment Options

### Option 1: Heroku (Backend) + Vercel (Frontend) ⭐ RECOMMENDED

**Best for:** Production-ready apps with good performance

#### Setup Heroku Backend:

1. **Create Heroku App:**
   ```bash
   heroku create syriana-backend
   ```

2. **Get Heroku API Key:**
   - Go to https://dashboard.heroku.com/account
   - Scroll to **API Key** section
   - Click **Reveal** and copy the key

3. **Add Heroku Config Vars:**
   ```bash
   heroku config:set MONGODB_URI="your-mongodb-uri" --app syriana-backend
   heroku config:set JWT_SECRET="your-jwt-secret" --app syriana-backend
   heroku config:set NODE_ENV="production" --app syriana-backend
   ```

4. **Create Procfile** (already in backend folder):
   ```
   web: node server.js
   ```

#### Setup Vercel Frontend:

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Link Project:**
   ```bash
   cd syriana-student-app/frontend
   vercel
   ```

3. **Get Vercel Token:**
   - Go to https://vercel.com/account/tokens
   - Create new token
   - Copy and add to GitHub secrets

4. **Set Environment Variables in Vercel:**
   ```bash
   vercel env add REACT_APP_API_URL production
   # Enter your Heroku backend URL
   ```

---

### Option 2: Railway (Full Stack)

**Best for:** Quick deployment, both backend and frontend

1. **Create Railway Account:** https://railway.app

2. **Get Railway Token:**
   ```bash
   railway login
   railway whoami --token
   ```

3. **Link Project:**
   ```bash
   cd syriana-student-app/backend
   railway link
   ```

4. **Set Environment Variables:**
   - Go to Railway dashboard
   - Add all environment variables

---

### Option 3: Render (Alternative)

**Best for:** Free tier with good performance

1. Create account at https://render.com
2. Connect GitHub repository
3. Create Web Service for backend
4. Create Static Site for frontend
5. Configure environment variables

---

## 🌍 Environment Variables

### Backend (.env):
```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRE=7d

# Email (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# CORS
CORS_ORIGIN=https://your-frontend-url.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env):
```env
REACT_APP_API_URL=https://your-backend.herokuapp.com
REACT_APP_ENV=production
```

---

## 📊 Monitoring and Logs

### View GitHub Actions Logs:
1. Go to your repository
2. Click **Actions** tab
3. Click on any workflow run
4. View detailed logs for each job

### View Heroku Logs:
```bash
heroku logs --tail --app syriana-backend
```

### View Vercel Logs:
```bash
vercel logs
```

### View Railway Logs:
- Go to Railway dashboard
- Click on your project
- View logs in real-time

---

## 🔧 Troubleshooting

### Build Fails on GitHub Actions

**Problem:** Dependencies not installing
```bash
# Solution: Make sure package-lock.json is committed
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

**Problem:** Tests failing
```bash
# Solution: Run tests locally first
cd syriana-student-app/backend
npm test

cd ../frontend
npm run test:ci
```

### Deployment Fails

**Problem:** Environment variables missing
- Check GitHub Secrets are set correctly
- Verify secret names match workflow file
- Check platform-specific environment variables

**Problem:** Build timeout
- Check if build process is too long
- Consider increasing timeout in workflow
- Optimize dependencies and build process

### Application Crashes After Deployment

**Problem:** Database connection fails
- Verify MongoDB Atlas whitelist includes 0.0.0.0/0
- Check connection string format
- Test connection locally with production URI

**Problem:** CORS errors
- Add frontend URL to CORS_ORIGIN in backend
- Check if protocol (http/https) matches
- Verify API URL in frontend .env

---

## 📝 Workflow Status Badges

Add these badges to your README.md:

```markdown
[![CI/CD Pipeline](https://github.com/Heshamdan87/final-project-irad-septempet-october-2025-hesham-aldandan/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Heshamdan87/final-project-irad-septempet-october-2025-hesham-aldandan/actions/workflows/ci-cd.yml)

[![Deploy to Heroku](https://github.com/Heshamdan87/final-project-irad-septempet-october-2025-hesham-aldandan/actions/workflows/deploy-heroku.yml/badge.svg)](https://github.com/Heshamdan87/final-project-irad-septempet-october-2025-hesham-aldandan/actions/workflows/deploy-heroku.yml)
```

---

## 🎉 Next Steps

1. ✅ Push workflow files to GitHub
2. ✅ Configure GitHub Secrets
3. ✅ Set up deployment platform
4. ✅ Push code to trigger first deployment
5. ✅ Monitor deployment in Actions tab
6. ✅ Test deployed application
7. ✅ Set up custom domain (optional)
8. ✅ Configure SSL certificate (usually automatic)

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Heroku Node.js Guide](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/)

---

## 💡 Best Practices

1. **Always test locally before pushing**
2. **Use environment-specific configurations**
3. **Keep secrets secure - never commit them**
4. **Monitor application logs regularly**
5. **Set up alerts for failed deployments**
6. **Use staging environment before production**
7. **Implement proper error handling**
8. **Keep dependencies updated**

---

## 🆘 Need Help?

If you encounter issues:
1. Check workflow logs in GitHub Actions
2. Review deployment platform logs
3. Verify all environment variables are set
4. Test API endpoints with Postman/Thunder Client
5. Check MongoDB Atlas connection
6. Review CORS settings

---

**Happy Deploying! 🚀**
