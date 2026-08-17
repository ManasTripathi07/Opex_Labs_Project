# Quick Start Guide

Get the Production Tracking System running in 10 minutes.

## Prerequisites Check

Before starting, ensure you have:
- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL 14+ installed (PostgreSQL 15, 16, or 17 recommended)
- [ ] npm installed (`npm --version`)
- [ ] Git installed (`git --version`)

If any are missing, install them first:
- **Node.js**: https://nodejs.org/ (LTS version recommended)
- **PostgreSQL**: https://www.postgresql.org/download/windows/
  - During installation, remember the password you set for the `postgres` user
  - Default port: 5432
  - You can install pgAdmin 4 (GUI tool) when prompted
- **Git**: https://git-scm.com/downloads

**Note:** This guide is tested with PostgreSQL 17 on Windows, but works with PostgreSQL 14+.

## Step 1: Install Dependencies (2 minutes)

```bash
# Navigate to project directory
cd "c:\Users\freak\Desktop\Opex Labs"

# Install all dependencies
npm install
```


This installs dependencies for both backend and frontend (monorepo setup).

## Step 2: Setup PostgreSQL Database (5 minutes)

### 2.1 Add PostgreSQL to PATH (Windows)

PostgreSQL's command-line tools need to be in your system PATH.

**Find your PostgreSQL installation:**
- Default location: `C:\Program Files\PostgreSQL\17\bin`
- Or check: `C:\Program Files\PostgreSQL\16\bin` or `C:\Program Files\PostgreSQL\15\bin`

**Option A: Add to PATH Temporarily (Quick Test)**

In PowerShell:
```powershell
# Add PostgreSQL bin to PATH for current session only
$env:Path += ";C:\Program Files\PostgreSQL\17\bin"

# Verify it works
psql --version
# Expected: psql (PostgreSQL) 17.x
```

**Option B: Add to PATH Permanently (Recommended)**

1. Open **Start Menu** → Search for "Environment Variables"
2. Click **"Edit the system environment variables"**
3. Click **"Environment Variables..."** button
4. Under **"System variables"**, find and select **"Path"**
5. Click **"Edit..."**
6. Click **"New"**
7. Add: `C:\Program Files\PostgreSQL\17\bin` (adjust version if different)
8. Click **"OK"** on all dialogs
9. **Restart VS Code** and your terminal for changes to take effect

**Verify PostgreSQL is accessible:**
```bash
# Check psql version
psql --version

# Expected output:
# psql (PostgreSQL) 17.x
```

### 2.2 Verify PostgreSQL is Running

```powershell
# Check if PostgreSQL is listening on port 5432
Test-NetConnection localhost -Port 5432

# Expected output:
# TcpTestSucceeded : True
```

If PostgreSQL is not running:
- Open **Services** (search in Start Menu)
- Find **"postgresql-x64-17"** (or your version)
- Right-click → **"Start"**

### 2.3 Create the Database

**Connect to PostgreSQL:**
```bash
# Connect as postgres user (you'll be prompted for password)
psql -U postgres -d postgres
```

**Create the database:**
```sql
-- In the psql prompt, run:
CREATE DATABASE production_tracker;

-- Verify it was created:
\l

-- Exit psql:
\q
```

**Alternative: Using pgAdmin (GUI)**

If you prefer a GUI:
1. Open **pgAdmin**
2. Connect to your PostgreSQL server
3. Right-click **"Databases"** → **"Create"** → **"Database..."**
4. Enter name: `production_tracker`
5. Click **"Save"**

### 2.4 Configure Database Credentials

Edit `backend/.env` with your PostgreSQL password:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=production_tracker
DB_USER=postgres
DB_PASSWORD=your_actual_postgresql_password_here
```

**IMPORTANT:** Replace `your_actual_postgresql_password_here` with the password you set during PostgreSQL installation. Never commit this file with real credentials to version control.

### 2.5 Run Database Migrations

From the **project root directory** (`c:\Users\freak\Desktop\Opex Labs`):

```bash
npm run migrate --workspace=backend
```

**Expected successful output:**
```
Starting database migration...
Executed query { text: '...', duration: XX, rows: 0 }
✅ Database migration completed successfully!
```

This creates all 10 tables (clients, designs, machines, operators, lots, sub_lots, assignments, shift_logs, etc.) with proper relationships and constraints.

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

### PostgreSQL Issues (Windows)

#### `psql is not recognized as an internal or external command`

**Problem:** PostgreSQL's bin directory is not in your system PATH.

**Solution:**
1. Add PostgreSQL bin directory to PATH (see Step 2.1 above)
2. Restart your terminal/VS Code
3. Verify: `psql --version`

#### `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Problem:** PostgreSQL service is not running or not listening on port 5432.

**Solution 1 - Start PostgreSQL Service:**
```powershell
# Check service status
Get-Service postgresql*

# Open Services app
# Search for "postgresql-x64-17" (or your version)
# Right-click → Start
```

**Solution 2 - Verify port 5432:**
```powershell
Test-NetConnection localhost -Port 5432
# Should show: TcpTestSucceeded : True
```

**Solution 3 - Check PostgreSQL is installed:**
```bash
# Verify installation
psql --version

# Try connecting
psql -U postgres -d postgres
```

#### `password authentication failed for user "postgres"`

**Problem:** The password in `backend/.env` doesn't match your PostgreSQL postgres user's password.

**Solution:**
1. Open `backend/.env`
2. Update `DB_PASSWORD=` with your actual PostgreSQL password
3. This is the password you set during PostgreSQL installation
4. Save the file and try connecting again:
   ```bash
   psql -U postgres -d production_tracker
   ```

#### `database "production_tracker" does not exist`

**Problem:** You haven't created the database yet.

**Solution:**
```bash
# Connect to PostgreSQL
psql -U postgres -d postgres

# Create database
CREATE DATABASE production_tracker;

# Exit
\q
```

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

### Migration Fails - Tables Already Exist

```
Error: relation "clients" already exists
```

**Problem:** Tables are already created (you ran migrations before).

**Solution 1 - Drop and recreate database (Clean Start):**
```bash
# Connect to PostgreSQL
psql -U postgres -d postgres

# Drop existing database
DROP DATABASE production_tracker;

# Recreate it
CREATE DATABASE production_tracker;

# Exit psql
\q

# Run migrations again
npm run migrate --workspace=backend
```

**Solution 2 - Continue with existing tables:**
- If tables are already created correctly, you can skip migration and proceed to Step 3

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

### Using PowerShell (Windows)

```powershell
# Health check
Invoke-RestMethod -Uri http://localhost:3000/health

# List clients
Invoke-RestMethod -Uri http://localhost:3000/api/clients

# List designs
Invoke-RestMethod -Uri http://localhost:3000/api/designs

# Create a client
$body = @{
    name = "API Test Client"
    phone = "+91 88888 88888"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/clients -Method Post -Body $body -ContentType "application/json"
```

### Using curl (Linux/Mac/Git Bash)

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

### Using Browser

Simply open in your browser:
- Health: http://localhost:3000/health
- Clients: http://localhost:3000/api/clients
- Designs: http://localhost:3000/api/designs

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
- ✅ PostgreSQL is running and accessible via `psql`
- ✅ Database migrations completed successfully

## PostgreSQL Installation Reference (Windows)

### Installation Checklist
- ✅ PostgreSQL installed (version 14+, tested with 17)
- ✅ Installation location: `C:\Program Files\PostgreSQL\17`
- ✅ Bin directory added to PATH: `C:\Program Files\PostgreSQL\17\bin`
- ✅ Service running: `postgresql-x64-17` in Windows Services
- ✅ Port 5432 listening: `Test-NetConnection localhost -Port 5432`
- ✅ Password remembered for `postgres` user
- ✅ Database created: `production_tracker`

### Quick PostgreSQL Commands

```bash
# Check version
psql --version

# Connect to default database
psql -U postgres -d postgres

# Connect to production_tracker database
psql -U postgres -d production_tracker

# List all databases
psql -U postgres -c "\l"

# Exit psql
\q
```

### Common PostgreSQL Locations (Windows)
```
Installation: C:\Program Files\PostgreSQL\17
Data files:   C:\Program Files\PostgreSQL\17\data
Binaries:     C:\Program Files\PostgreSQL\17\bin
Config file:  C:\Program Files\PostgreSQL\17\data\postgresql.conf
```

## Ready to Go!

You now have a fully functional Production Tracking System running locally. Explore the application, try out the different interfaces, and refer to the comprehensive documentation for more details.

### What's Next?

1. **Explore the UI**: Try all 4 interfaces (Dashboard, Inbound, Production, Shift Entry)
2. **Read the docs**: Check `README.md` for features, `API.md` for endpoints
3. **Start developing**: Modify code and see live reloads
4. **Deploy**: Follow `DEPLOYMENT.md` when ready for production

**Happy coding! 🚀**
