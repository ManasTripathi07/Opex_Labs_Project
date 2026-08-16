# 🚀 Deploy Frontend + Backend Together (Same Server)

## ✅ **YES! You Can Deploy Both on One Server!**

**This is actually the EASIEST and most common way!**

---

## 🎯 **Why Deploy Together?**

### **Benefits:**
✅ **Simpler** - One server, not two  
✅ **Cheaper** - Pay for one server only  
✅ **No CORS issues** - Same domain  
✅ **Easier to manage** - Everything in one place  
✅ **Faster** - No cross-domain requests  
✅ **One domain** - yoursite.com (not yoursite.com + api.yoursite.com)  

### **How It Works:**
```
Your Server (yoursite.com)
├── Frontend files (static HTML/CSS/JS)
├── Backend (Node.js API)
└── Database (PostgreSQL)

User visits: yoursite.com
├─ Frontend loads (homepage, dashboard, etc.)
└─ API calls go to: yoursite.com/api/*
```

**Everything on ONE server!**

---

## 🎨 **Architecture:**

### **Current (Development):**
```
Frontend: localhost:5173 (Vite dev server)
Backend:  localhost:3000 (Node.js)
Database: localhost:5432 (PostgreSQL)

3 separate processes
```

### **Production (Together):**
```
Server (yoursite.com)
├─ Nginx (port 80/443)
│  ├─ Serves frontend files (/, /dashboard, etc.)
│  └─ Proxies /api/* to backend
├─ Node.js Backend (port 3000)
│  └─ Handles API requests
└─ PostgreSQL (port 5432)
   └─ Stores data

Everything on ONE server, ONE domain!
```

---

## 🚀 **Method 1: Single Server with Nginx (Best for VPS)**

### **How It Works:**
1. Node.js runs in background (port 3000)
2. Frontend files in `/var/www/`
3. Nginx serves frontend AND proxies API

### **Setup Steps:**

#### **1. Prepare Your Code:**
```bash
# On your local machine:

# Build frontend
cd frontend
npm run build
# This creates frontend/dist/ folder

# Copy everything to server
rsync -avz . user@yourserver:/var/www/production-tracker/
```

#### **2. On Your Server:**
```bash
# Install Node.js, PostgreSQL, Nginx
sudo apt update
sudo apt install nodejs npm postgresql nginx

# Set up database
sudo -u postgres createdb production_tracker
sudo -u postgres psql production_tracker < schema.sql

# Install dependencies and start backend
cd /var/www/production-tracker/backend
npm install
npm run migrate

# Start backend with PM2 (keeps it running)
sudo npm install -g pm2
pm2 start src/server.js --name production-api
pm2 save
pm2 startup
```

#### **3. Configure Nginx:**

**Create:** `/etc/nginx/sites-available/production-tracker`

```nginx
server {
    listen 80;
    server_name yoursite.com;

    # Serve frontend files
    root /var/www/production-tracker/frontend/dist;
    index index.html;

    # Frontend routes (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/production-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### **4. Update Configuration:**

**Backend `.env`:**
```env
PORT=3000
NODE_ENV=production
CORS_ORIGIN=http://yoursite.com
# (Or don't set CORS since same domain!)
```

**Frontend** - No change needed!
Since both are on same domain, API calls work automatically!

#### **5. Add SSL (HTTPS):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yoursite.com
```

**Done!** Visit `https://yoursite.com` 🎉

---

## 🎯 **Method 2: Express Serves Both (Simplest!)**

### **How It Works:**
Node.js serves BOTH frontend AND API!

### **Setup:**

#### **1. Modify Backend Server:**

**Edit:** `backend/src/server.js`

**Add after existing code:**
```javascript
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ... existing code ...

// Serve frontend static files (AFTER all API routes!)
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// All other requests go to index.html (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

// ... rest of code ...
```

#### **2. Build and Deploy:**
```bash
# Build frontend
cd frontend
npm run build

# Start backend (serves both!)
cd ../backend
npm start

# Done! Visit http://yourserver:3000
```

#### **3. Update Frontend API:**

**Edit:** `frontend/src/api/client.js`

**Change:**
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

**To:**
```javascript
const API_BASE_URL = '/api';  // Relative URL!
```

**Done!** Backend serves both frontend and API!

---

## 🌐 **Method 3: Cloud Platform (Easiest!)**

### **Render.com (Recommended):**

**One platform, auto-deploys both!**

#### **Setup:**

1. **Create `render.yaml` in project root:**

```yaml
services:
  # Backend
  - type: web
    name: production-tracker-api
    env: node
    region: oregon
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: production-tracker-db
          property: connectionString

  # Frontend
  - type: web
    name: production-tracker-web
    env: static
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: ./frontend/dist
    routes:
      - type: rewrite
        source: /api/*
        destination: https://production-tracker-api.onrender.com/api/*

databases:
  - name: production-tracker-db
    databaseName: production_tracker
    user: postgres
```

2. **Push to GitHub**
3. **Connect Render to GitHub**
4. **Click Deploy**

**Done!** Render deploys both automatically! 🎉

---

## 🚂 **Method 4: Railway (Super Easy!)**

### **Deploy Both from One Repo:**

#### **1. Create Railway Project:**
- Go to railway.app
- Click "New Project"
- Select "Deploy from GitHub repo"

#### **2. Add Services:**

**Service 1: Backend**
```bash
Build Command: cd backend && npm install
Start Command: cd backend && npm start
Root Directory: /
```

**Service 2: Frontend**
```bash
Build Command: cd frontend && npm install && npm run build
Start Command: npx serve -s frontend/dist
Root Directory: /
```

**Service 3: PostgreSQL**
- Click "New" → "Database" → "PostgreSQL"
- Railway auto-configures connection!

#### **3. Set Environment Variables:**

**Backend:**
```env
PORT=3000
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Auto-filled!
```

**Frontend:**
```env
VITE_API_URL=https://your-backend-url.railway.app/api
```

**Done!** Railway handles everything! 🎉

---

## 📦 **Method 5: Docker (All-in-One)**

### **One Container, Everything Inside!**

#### **Create:** `Dockerfile` in project root:

```dockerfile
FROM node:18

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
RUN cd backend && npm install
RUN cd frontend && npm install && npm run build

# Expose port
EXPOSE 3000

# Start backend (serves both)
CMD ["node", "backend/src/server.js"]
```

#### **Create:** `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_NAME=production_tracker
      - DB_USER=postgres
      - DB_PASSWORD=yourpassword
    depends_on:
      - db

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=production_tracker
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=yourpassword
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

#### **Deploy:**
```bash
docker-compose up -d
```

**Done!** Everything in one container! 🎉

---

## 🎯 **Which Method Should You Use?**

### **Choose Based on Your Situation:**

| Method | Best For | Difficulty | Cost | Time |
|--------|----------|------------|------|------|
| **Nginx (Method 1)** | You have a VPS | Medium | $5-10/mo | 2-3 hours |
| **Express Serves Both (Method 2)** | Simplest setup | Easy | $5-10/mo | 30 mins |
| **Render (Method 3)** | No server management | Easy | Free/$7/mo | 20 mins |
| **Railway (Method 4)** | Quick deploy | Easiest | Free/$5/mo | 15 mins |
| **Docker (Method 5)** | Containerization | Medium | Varies | 1 hour |

### **My Recommendation:**

**For Beginners:** Railway (Method 4) - Easiest!  
**For Small Projects:** Express Serves Both (Method 2) - Simplest code!  
**For Production:** Nginx (Method 1) - Most control!  
**For Scaling:** Render (Method 3) - Auto-scales!  

---

## ⚙️ **Configuration Changes:**

### **When Deploying Together on Same Domain:**

#### **Backend `.env`:**
```env
PORT=3000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=production_tracker
DB_USER=postgres
DB_PASSWORD=your_password

# CORS - Can be removed if same domain!
# CORS_ORIGIN=https://yoursite.com  # Or just remove this line
```

#### **Frontend - Option 1 (Relative URL):**

**Edit:** `frontend/src/api/client.js`
```javascript
const API_BASE_URL = '/api';  // Relative URL!
```

**Benefits:**
- Works on any domain
- No configuration needed
- Same origin = no CORS issues

#### **Frontend - Option 2 (Environment Variable):**

**Create:** `frontend/.env.production`
```env
VITE_API_URL=/api
```

**Edit:** `frontend/src/api/client.js`
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
```

---

## 🎊 **Advantages of Same Server Deployment:**

### **1. Simpler Configuration**
```
Before (Separate):
Frontend: https://app.yoursite.com
Backend:  https://api.yoursite.com
- Need DNS for 2 domains
- Need SSL for 2 domains
- Configure CORS

After (Together):
Everything: https://yoursite.com
- One domain
- One SSL certificate
- No CORS needed
```

### **2. Cost Savings**
```
Separate:
- Frontend server: $5/month
- Backend server: $10/month
- Total: $15/month

Together:
- One server: $10/month
- Total: $10/month

Savings: $5/month ($60/year!)
```

### **3. Easier Maintenance**
```
Separate:
- Update frontend → deploy to server 1
- Update backend → deploy to server 2
- Check 2 servers
- Monitor 2 services

Together:
- Update anything → deploy once
- Check one server
- Monitor one service
```

### **4. Better Performance**
```
Separate:
Browser → Frontend server → Backend server → Database
         (extra hop)

Together:
Browser → Server (serves both) → Database
         (direct!)
```

---

## 🚀 **Quick Start: Deploy Together in 20 Minutes**

### **Using Express Serves Both (Simplest):**

```bash
# 1. Update backend to serve frontend
# Add to backend/src/server.js (see Method 2 above)

# 2. Update frontend API to relative URL
# Change to: const API_BASE_URL = '/api'

# 3. Build frontend
cd frontend
npm run build

# 4. Deploy to server
# Copy everything to server
scp -r . user@yourserver:/var/www/app/

# 5. On server, start backend
cd /var/www/app/backend
npm install
npm run migrate
pm2 start src/server.js --name production-app

# 6. Done! Visit http://yourserver:3000
```

**Total time: ~20 minutes!**

---

## ✅ **Checklist for Same-Server Deployment:**

### **Before Deploying:**
- [ ] Build frontend (`npm run build`)
- [ ] Update API URL to relative (`/api`)
- [ ] Configure backend to serve static files (if using Method 2)
- [ ] Or configure Nginx (if using Method 1)
- [ ] Test locally

### **During Deployment:**
- [ ] Upload code to server
- [ ] Install dependencies
- [ ] Run database migrations
- [ ] Start backend
- [ ] Configure web server (if using Nginx)
- [ ] Set up SSL certificate

### **After Deployment:**
- [ ] Test homepage loads
- [ ] Test API calls work
- [ ] Test all pages
- [ ] Check mobile view
- [ ] Monitor logs

---

## 🎉 **Bottom Line:**

### **YES! Deploy Both Together!**

**It's:**
✅ **Easier** than separate deployment  
✅ **Cheaper** (one server, not two)  
✅ **Simpler** to configure  
✅ **Faster** to set up  
✅ **Better** for small-medium projects  

**Only deploy separately if:**
- Very high traffic (need to scale independently)
- Want different hosting for static files (CDN)
- Complex microservices architecture

**For your Production Tracking System:**
**→ Deploy together on one server!** 🚀

---

**Recommended Method:** Railway (Method 4) or Express Serves Both (Method 2)  
**Deployment Time:** 15-20 minutes  
**Cost:** Free to $10/month  
**Difficulty:** Easy! ✅
