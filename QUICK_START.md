# Quick Start Guide

Get the Production Tracking System running in 10 minutes.

## Prerequisites Check

Before starting, ensure you have:
- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL 14+ installed (`psql --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git installed (`git --version`)

If any are missing, install them first:
- Node.js: https://nodejs.org/
- PostgreSQL: https://www.postgresql.org/download/
- Git: https://git-scm.com/downloads

## Step 1: Install Dependencies (2 minutes)

```bash
# Navigate to project directory
cd "c:\Users\freak\Desktop\Opex Labs"

# Install all dependencies
npm install
```


This installs dependencies for both backend and frontend (monorepo setup).

## Step 2: Setup Database (3 minutes)

### Option A: Using psql command line

```bash
# Create database
createdb production_tracker

# Or if createdb doesn't work:
psql -U postgres
CREATE DATABASE production_tracker;
\q
```

### Option B: Using pgAdmin

1. Open pgAdmin
2. Right-click "Databases" → "Create" → "Database"
3. Name: `production_tracker`
4. Click "Save"

### Update Database Credentials (if needed)

Edit `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=production_tracker
DB_USER=postgres        # Your PostgreSQL username
DB_PASSWORD=postgres    # Your PostgreSQL password
```

### Run Migrations

```bash
npm run migrate --workspace=backend
```

You should see: ✅ Database migration completed successfully!

### Add Sample Data (Optional but Recommended)

```bash
npm run seed --workspace=backend
```

This creates:
- 3 sample clients
- 4 sample designs
- 5 sample operators
- 4 sample machines
- 2 sample lots with sub-lots

## Step 3: Start Application (1 minute)

```bash
# Start both backend and frontend
npm run dev
```

You should see:
```
🚀 Production Tracker API running on http://localhost:3000
📊 Health check: http://localhost:3000/health

VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

## Step 4: Open Application (1 minute)

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the Production Tracker application with the navigation menu.

## Step 5: Test the System (3 minutes)

### Test 1: Master Data
1. Click "Master Data" in the navigation
2. View existing clients, designs, machines, operators
3. Try adding a new client:
   - Name: "Test Company"
   - Phone: "+91 99999 99999"
   - Click "Create"

### Test 2: Dashboard
1. Click "Dashboard" in the navigation
2. See factory overview with statistics
3. View sub-lot status counts

### Test 3: Inbound UI
1. Click "Inbound" in the navigation
2. See the list of existing lots
3. Try creating a new lot (optional)

### Test 4: Shift Entry (Mobile View)
1. Navigate to: `http://localhost:5173/shift/1`
2. This is the mobile-optimized shift entry interface
3. Note the large tap targets and simple design

## Troubleshooting

### Port Already in Use

If port 3000 or 5173 is already in use:

**Backend (port 3000):**
```bash
# Edit backend/.env
PORT=3001
```

**Frontend (port 5173):**
```bash
# Edit frontend/vite.config.js
server: {
  port: 5174,  // Change this
}
```

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

Solutions:
1. Check PostgreSQL is running:
   ```bash
   # Windows (in Services):
   # Look for "postgresql-x64-14" and start it
   
   # Or via command line:
   pg_ctl -D "C:\Program Files\PostgreSQL\14\data" start
   ```

2. Verify credentials in `backend/.env`

3. Test connection:
   ```bash
   psql -U postgres -d production_tracker
   ```

### Migration Fails

```
Error: relation "clients" already exists
```

This means tables are already created. You can either:
1. Drop and recreate database:
   ```bash
   dropdb production_tracker
   createdb production_tracker
   npm run migrate --workspace=backend
   ```

2. Or continue with existing tables

### npm install Fails

Try:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

# Reinstall
npm install
```

## Common Commands

```bash
# Development
npm run dev              # Start both backend and frontend
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only

# Database
npm run migrate --workspace=backend    # Run migrations
npm run seed --workspace=backend       # Add sample data

# Testing
npm test --workspace=backend           # Run backend tests

# Production Build
npm run build                          # Build both
npm run start                          # Start production server
```

## API Testing

Test the backend API directly:

```bash
# Health check
curl http://localhost:3000/health

# List clients
curl http://localhost:3000/api/clients

# List designs
curl http://localhost:3000/api/designs

# Create a client
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"API Test Client","phone":"+91 88888 88888"}'
```

## Next Steps

### Learn the System
1. Read `README.md` for complete feature overview
2. Check `API.md` for full API documentation
3. Review `ARCHITECTURE.md` for system design

### Start Development
1. Explore the codebase:
   - `backend/src/models/` - Data models
   - `backend/src/routes/` - API endpoints
   - `frontend/src/pages/` - UI components

2. Make changes and see them live (hot reload enabled)

3. Test your changes in the browser

### Deploy to Production
Follow the comprehensive guide in `DEPLOYMENT.md` when ready to deploy.

## File Locations

Key files you might need to edit:

```
Configuration:
  backend/.env              # Backend configuration
  frontend/vite.config.js   # Frontend configuration

Database:
  backend/src/db/schema.sql   # Database schema
  backend/src/db/migrate.js   # Migration script
  backend/src/db/seed.js      # Sample data

Backend:
  backend/src/server.js       # Express app
  backend/src/routes/*.js     # API routes
  backend/src/models/*.js     # Database models

Frontend:
  frontend/src/App.jsx        # React app
  frontend/src/pages/*.jsx    # Page components
  frontend/src/styles/*.css   # Styles
```

## Getting Help

1. **Check the logs:**
   - Backend: Look at the terminal running `npm run dev:backend`
   - Frontend: Look at browser console (F12)

2. **Review documentation:**
   - `README.md` - Project overview
   - `API.md` - API reference
   - `DEPLOYMENT.md` - Deployment guide
   - `ARCHITECTURE.md` - System design

3. **Common issues:**
   - Database connection: Check PostgreSQL is running
   - Port conflicts: Change ports in config files
   - Dependencies: Run `npm install` again

## Success Indicators

You know everything is working when:
- ✅ Backend starts without errors
- ✅ Frontend loads at http://localhost:5173
- ✅ Dashboard shows statistics
- ✅ You can navigate between pages
- ✅ Master Data page shows sample data (if seeded)
- ✅ No console errors in browser

## Ready to Go!

You now have a fully functional Production Tracking System running locally. Explore the application, try out the different interfaces, and refer to the comprehensive documentation for more details.

**Happy coding! 🚀**
