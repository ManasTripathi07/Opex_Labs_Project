# 🚀 Deploy to Render + Vercel (Step-by-Step Guide)

## ✅ Everything is READY! Follow these steps:

---

## 📋 **What You'll Deploy:**

- **Render** = Backend API + Database
- **Vercel** = Frontend (React app)

**Total Time:** ~30 minutes  
**Cost:** FREE (both have free tiers!)

---

## 🎯 **Prerequisites:**

✅ GitHub account (free)  
✅ Render account → [render.com](https://render.com) (free)  
✅ Vercel account → [vercel.com](https://vercel.com) (free)  

---

## 📦 **STEP 0: Push to GitHub (If Not Already)**

```bash
# In your project folder:
cd "c:\Users\freak\Desktop\Opex Labs"

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Create repo on GitHub.com, then:
git remote add origin https://github.com/YOUR-USERNAME/production-tracker.git
git branch -M main
git push -u origin main
```

**✅ Your code is now on GitHub!**

---

## 🔵 **PART 1: Deploy Backend to Render**

### **Step 1: Create Render Account**
1. Go to [render.com](https://render.com)
2. Click "Get Started for Free"
3. Sign up with GitHub

### **Step 2: Create New Web Service**
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select your `production-tracker` repo
4. Click "Connect"

### **Step 3: Configure Service**

**Basic Settings:**
```
Name: production-tracker-api
Region: Oregon (US West)
Branch: main
Runtime: Node
```

**Build & Deploy:**
```
Root Directory: (leave blank)
Build Command: cd backend && npm install
Start Command: cd backend && npm start
```

**Instance Type:**
```
Free (0.1 CPU, 512 MB RAM)
```

### **Step 4: Add Database**

1. Scroll down to "Environment"
2. Click "Add Database"
3. Select "PostgreSQL"
4. Name: `production-tracker-db`
5. Click "Create Database"

**Render will automatically:**
- Create PostgreSQL database
- Add `DATABASE_URL` environment variable
- Connect backend to database

### **Step 5: Add Environment Variables**

Click "Advanced" → "Add Environment Variable":

```env
NODE_ENV = production
PORT = 3000
```

**For CORS_ORIGIN:**
- Leave blank for now (we'll add after Vercel gives us URL)

### **Step 6: Create Service**

1. Click "Create Web Service"
2. Wait 5-10 minutes for deployment
3. ✅ Backend is deploying!

### **Step 7: Run Database Migrations**

Once deployed:

1. Go to your service dashboard
2. Click "Shell" tab
3. Run:
```bash
cd backend
npm run migrate
```

4. ✅ Database is ready!

### **Step 8: Note Your Backend URL**

You'll see something like:
```
https://production-tracker-api.onrender.com
```

**Copy this URL!** You'll need it for Vercel.

---

## 🔷 **PART 2: Deploy Frontend to Vercel**

### **Step 1: Create Vercel Account**
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Sign up with GitHub

### **Step 2: Import Project**
1. Click "Add New..." → "Project"
2. Select your `production-tracker` repository
3. Click "Import"

### **Step 3: Configure Project**

**Framework Preset:**
```
Vite (auto-detected)
```

**Root Directory:**
```
frontend
```

**Build Settings:**
```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### **Step 4: Add Environment Variables**

Click "Environment Variables":

```env
VITE_API_URL = https://production-tracker-api.onrender.com/api
```

**⚠️ IMPORTANT:** Replace with YOUR actual Render URL from Step 8 above!

### **Step 5: Deploy**

1. Click "Deploy"
2. Wait 2-3 minutes
3. ✅ Frontend is deploying!

### **Step 6: Note Your Frontend URL**

You'll get something like:
```
https://production-tracker-xyz123.vercel.app
```

**Copy this URL!**

---

## 🔗 **PART 3: Connect Backend to Frontend (CORS)**

### **Step 1: Update Render Environment**

1. Go back to Render dashboard
2. Click on your `production-tracker-api` service
3. Go to "Environment"
4. Add new variable:

```env
CORS_ORIGIN = https://production-tracker-xyz123.vercel.app
```

**⚠️ Replace with YOUR actual Vercel URL!**

### **Step 2: Redeploy Backend**

1. Click "Manual Deploy" → "Deploy latest commit"
2. Wait 2-3 minutes
3. ✅ CORS configured!

---

## ✅ **PART 4: Test Your Deployment**

### **Step 1: Open Your Website**

Visit your Vercel URL:
```
https://production-tracker-xyz123.vercel.app
```

### **Step 2: Test Features**

1. ✅ Dashboard loads
2. ✅ Check KPI cards show data
3. ✅ Worker character appears
4. ✅ Theme toggle works
5. ✅ Navigate to Master Data
6. ✅ Try creating a machine/design/operator

### **Step 3: Test API Connection**

1. Open browser console (F12)
2. Navigate to Dashboard
3. Check for API calls
4. Should see successful requests to Render URL

### **Step 4: Test Full Workflow**

1. Go to Master Data → Add test data
2. Go to Inbound → Create a lot
3. Go to Production → Assign to machine
4. Go to Dashboard → Click "Log Shift"
5. ✅ Verify progress updates automatically!

---

## 🎉 **YOU'RE DONE!**

### **Your URLs:**

**Frontend (Users visit here):**
```
https://production-tracker-xyz123.vercel.app
```

**Backend API:**
```
https://production-tracker-api.onrender.com/api
```

**Database:**
```
Managed by Render (automatic backups!)
```

---

## 💰 **Pricing (Free Tier):**

### **Render:**
- ✅ Free tier: 750 hours/month
- ✅ Sleeps after 15 min inactivity
- ✅ Wakes up on first request (~30 seconds)
- ✅ PostgreSQL: 90 days free, then $7/month

### **Vercel:**
- ✅ 100GB bandwidth/month free
- ✅ Unlimited deployments
- ✅ Always on (no sleep)
- ✅ Auto HTTPS

---

## 🔄 **How to Update After Changes:**

### **Update Backend:**
1. Make changes locally
2. Commit and push to GitHub:
```bash
git add .
git commit -m "Update backend"
git push
```
3. Render auto-deploys! ✅

### **Update Frontend:**
1. Make changes locally
2. Commit and push to GitHub:
```bash
git add .
git commit -m "Update frontend"
git push
```
3. Vercel auto-deploys! ✅

**Both platforms auto-deploy on every push to main!**

---

## 🔧 **Troubleshooting:**

### **Problem: Backend shows "Service Unavailable"**
**Solution:**
- Wait a few minutes (still deploying)
- Check Render logs for errors
- Verify environment variables are set

### **Problem: Frontend shows API errors**
**Solution:**
- Check `VITE_API_URL` in Vercel
- Make sure it ends with `/api`
- Verify Render backend is running
- Check CORS_ORIGIN in Render matches Vercel URL

### **Problem: Database connection error**
**Solution:**
- Go to Render → Databases
- Check database is "Available"
- Verify migrations ran successfully
- Try running migrations again in Shell

### **Problem: Frontend shows blank page**
**Solution:**
- Check Vercel build logs
- Make sure build command is `npm run build`
- Verify output directory is `dist`
- Check browser console for errors

### **Problem: Render backend sleeps (free tier)**
**Solution:**
- Free tier sleeps after 15 min inactivity
- First request wakes it (~30 seconds)
- Upgrade to $7/month for always-on
- Or use UptimeRobot to ping every 10 minutes

---

## 📊 **Monitoring Your Deployment:**

### **Render Dashboard:**
- View logs: Click service → "Logs" tab
- Monitor CPU/Memory: "Metrics" tab
- Run commands: "Shell" tab
- View environment: "Environment" tab

### **Vercel Dashboard:**
- View deployments: Project → "Deployments"
- Check analytics: "Analytics" tab
- View logs: Click on deployment → "Logs"
- Monitor performance: Built-in metrics

---

## 🎯 **Pro Tips:**

### **Custom Domain (Optional):**

**Vercel:**
1. Buy domain (Namecheap, GoDaddy)
2. Go to Vercel project → "Settings" → "Domains"
3. Add your domain
4. Update DNS records (Vercel shows instructions)
5. ✅ Use your-domain.com!

**Render:**
1. Same backend URL OR
2. Use custom domain for API (api.your-domain.com)

### **Environment Variables:**

**To add more:**
- Render: Service → "Environment" → Add variable → "Save Changes"
- Vercel: Project → "Settings" → "Environment Variables" → Add

### **Database Backups:**

**Render includes:**
- Automatic daily backups (free tier: 7 days)
- Manual backup: Database → "Backups" → "Create Backup"

### **SSL/HTTPS:**

Both platforms include FREE SSL certificates!
- ✅ Automatically enabled
- ✅ Auto-renew
- ✅ Nothing to configure

---

## 🚀 **Next Steps:**

### **1. Add More Features:**
- Continue development locally
- Push to GitHub
- Auto-deploys to production!

### **2. Monitor Usage:**
- Check Render dashboard weekly
- Monitor Vercel bandwidth
- Check database size

### **3. Upgrade When Ready:**
- Render: $7/month for always-on + persistent DB
- Vercel: Pro ($20/month) for more bandwidth
- Or stay on free tier if it works!

---

## 📝 **Quick Reference:**

### **Your Deployment:**
```
Users → Vercel (Frontend)
         ↓
      Render (Backend API)
         ↓
      Render (PostgreSQL)
```

### **URLs:**
```
Frontend: https://your-app.vercel.app
Backend:  https://your-api.onrender.com
Database: (internal to Render)
```

### **Environment Variables:**

**Render (Backend):**
```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-app.vercel.app
DATABASE_URL=(auto-filled by Render)
```

**Vercel (Frontend):**
```env
VITE_API_URL=https://your-api.onrender.com/api
```

---

## 🎊 **Congratulations!**

Your Production Tracking System is now:
- ✅ Deployed to production
- ✅ Accessible from anywhere
- ✅ Using professional hosting
- ✅ With automatic backups
- ✅ With free SSL
- ✅ With auto-deploy on push!

**Share your Vercel URL with users and start tracking production!** 🎉

---

**Need Help?** Check:
- Render Docs: [render.com/docs](https://render.com/docs)
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Your project logs on both platforms

---

**Last Updated:** August 16, 2026  
**Status:** Ready to Deploy! ✅
