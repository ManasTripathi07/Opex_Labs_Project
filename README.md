# Production Tracking System

A comprehensive production tracking system for embroidery manufacturing facilities. This system digitizes production tracking, replacing physical notebooks with a web-based platform to calculate worker compensation based on machine output.

## Features

### Core Functionality
- **Lot Management**: Track lots and sub-lots through their complete lifecycle (received → allocated → in_production → completed → dispatched)
- **Machine Assignments**: Assign sub-lots to machines and track production progress
- **Shift Logging**: Record operator shifts with automatic stitch calculations
- **Salary Reports**: Generate operator compensation reports based on production output
- **Daily Production Reports**: View production summaries by machine and design

### Four Specialized User Interfaces

1. **Dashboard (Leadership)**
   - Factory overview with real-time metrics
   - Active machine assignments
   - Daily production summaries
   - Sub-lot status tracking

2. **Inbound UI (Office Staff)**
   - Lot receipt and registration
   - Sub-lot splitting with design assignment
   - Piece count validation

3. **Production UI (Supervisors)**
   - Machine assignment management
   - Progress tracking
   - Salary report generation
   - Sub-lot state management

4. **Shift Entry (Mobile-First for Operators)**
   - Simple, touch-friendly interface
   - Auto-populated previous counter readings
   - Real-time validation
   - Large tap targets for ease of use

## Technology Stack

### Backend
- **Node.js** with Express
- **PostgreSQL** database
- RESTful API architecture
- Complex business logic for stitch calculations

### Frontend
- **React** with React Router
- **Vite** for fast development and building
- **Axios** for API communication
- Responsive design (mobile-first for shift entry)

## Getting Started

### Quick Start

**For detailed step-by-step instructions, especially for Windows + PostgreSQL setup, see [QUICK_START.md](QUICK_START.md).**

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+ (tested with PostgreSQL 17)
- Git

**Windows Users:** PostgreSQL requires additional PATH configuration. See [QUICK_START.md](QUICK_START.md#21-add-postgresql-to-path-windows) for detailed instructions.

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd production-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:

**Linux/Mac:**
```bash
# Create PostgreSQL database
createdb production_tracker

# Update database credentials in backend/.env
# Then run migrations
npm run migrate --workspace=backend
```

**Windows:**
```powershell
# Add PostgreSQL to PATH first (see QUICK_START.md)
# Then connect to PostgreSQL
psql -U postgres -d postgres

# Create database
CREATE DATABASE production_tracker;
\q

# Update database credentials in backend/.env
# Then run migrations
npm run migrate --workspace=backend
```

See [QUICK_START.md](QUICK_START.md#step-2-setup-postgresql-database-5-minutes) for troubleshooting database issues.

4. Start development servers:
```bash
# Start both backend and frontend
npm run dev

# Or start individually
npm run dev:backend
npm run dev:frontend
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Health: http://localhost:3000/health

## Website Tutorial

This tutorial will guide you through using the Production Tracking System, explaining each page and the complete production workflow.

### Understanding the Interface

The system has **4 main pages** accessible from the navigation bar:

1. **Dashboard** - Factory overview and metrics
2. **Inbound** - Receiving and registering new lots
3. **Production** - Managing machine assignments and reports
4. **Master Data** - Managing clients, designs, machines, and operators

### Initial Setup: Add Master Data First

Before you can track production, you need to set up your master data.

#### Step 0: Navigate to Master Data

Click **"Master Data"** in the navigation. You'll see 4 tabs:

**1. Clients Tab** - Add your customers
- Click **"Add New"**
- Enter **Name**: e.g., "ABC Textiles"
- Enter **Phone**: e.g., "+91 98765 43210"
- Click **"Create"**
- Repeat to add more clients

**2. Designs Tab** - Add embroidery designs
- Click **"Add New"**
- Enter **Identifier**: e.g., "ROSE-001"
- Enter **Stitches per Piece**: e.g., 578293
- Enter **Rate per Stitch** (optional): e.g., 0.0015
- Click **"Create"**
- This rate determines operator compensation

**3. Machines Tab** - Add production machines
- Click **"Add New"**
- Enter **Identifier**: e.g., "M-001"
- Enter **Name**: e.g., "Tajima TMEX-C1501"
- Click **"Create"**

**4. Operators Tab** - Add machine operators
- Click **"Add New"**
- Enter **Name**: e.g., "Rajesh Kumar"
- Enter **Phone**: e.g., "+91 98765 00001"
- Click **"Create"**

**Tip:** You can also run `npm run seed --workspace=backend` to automatically create sample master data.

---

### Production Workflow: Step-by-Step Guide

Follow these steps in order to track a complete production cycle.

#### Step 1: Receive a Lot (Inbound Page)

When you receive an order from a client:

1. Click **"Inbound"** in the navigation
2. Click **"New Lot"** button (top right)
3. Fill in the lot details:
   - **Lot Number**: e.g., "LOT-2024-001" (must be unique)
   - **Client**: Select from dropdown
   - **Total Pieces**: e.g., 1000
   - **Received Date**: Today's date (pre-filled)

4. **Add Sub-Lots** (split the lot by design):
   - Click **"Add Sub-Lot"** button
   - **Sub-Lot Number**: e.g., "LOT-2024-001-A"
   - **Design**: Select which embroidery design
   - **Piece Count**: e.g., 600
   - Add more sub-lots if needed
   - ⚠️ **Important**: Total sub-lot pieces must equal lot total pieces

5. Click **"Create Lot"**

**What happens:** 
- Lot is saved with state: `received`
- Sub-lots are created with state: `received`
- Lot appears in "Recent Lots" table

---

#### Step 2: Allocate Sub-Lots (Inbound Page)

Before assigning work to machines, sub-lots must be allocated:

1. Still on **"Inbound"** page
2. Find your lot in the "Recent Lots" table
3. Click **"Allocate"** button next to it
4. Success message appears

**What happens:**
- Sub-lots move from `received` → `allocated` state
- **Dashboard now shows**: "Allocated" = 1 ✅

**Why this step?** It ensures lots are ready for production and prevents accidental assignment of unverified orders.

---

#### Step 3: Assign to Machine (Production Page)

Assign allocated sub-lots to production machines:

1. Click **"Production"** in the navigation
2. Click **"New Assignment"** button
3. Fill in assignment details:
   - **Machine**: Select from dropdown
   - **Sub-Lot**: Select an allocated sub-lot
   - **Pieces Issued**: How many pieces to produce (≤ sub-lot total)

4. Click **"Create Assignment"**

**What happens:**
- Sub-lot state changes: `allocated` → `in_production`
- **Dashboard updates**:
  - "Active Machines" = 1 ✅
  - "In Production" = 1 ✅
  - "Allocated" = 0

**Business Rule:** Only one active assignment per machine at a time. Complete or cancel current assignment before creating a new one.

---

#### Step 4: Log Production Shifts (Shift Entry Page)

Operators log their work output each shift:

**Accessing Shift Entry:**
- Navigate to: `http://localhost:5173/shift/[MACHINE_ID]`
- Replace `[MACHINE_ID]` with your machine ID (e.g., 1, 2, 3)
- **Tip:** You can generate QR codes for each machine that encode this URL

**Logging a Shift:**

1. Select **Operator** from dropdown
2. Select **Date** (defaults to today)
3. Select **Shift Type**:
   - Morning
   - Afternoon  
   - Night

4. **Previous Counter** is auto-filled
   - Shows the last counter reading for this machine + design
   - Will be 0 for the first shift

5. Enter **Current Counter Reading**:
   - Read the machine's stitch counter
   - Example: 348963

6. Enter **Rounds Completed**:
   - How many full rotations/cycles completed
   - Example: 1
   - Use this when counter resets/overflows

7. Click **"Submit Shift Log"**

**What happens:**
- System calculates total stitches automatically using formula:
  ```
  total_stitches = current - previous + (rounds × stitches_per_piece)
  ```
- Piece equivalents calculated
- Warnings shown if output seems unusual (>50 pieces)
- Errors shown if negative stitch count detected

**Mobile-Friendly Design:**
- Large buttons for easy tapping
- Minimal typing required
- Clear success/error feedback
- Works on low-end devices

---

#### Step 5: View Reports (Production & Dashboard)

**Salary Report (Production Page):**

1. Go to **"Production"** page
2. Scroll to **"Salary Report"** section
3. Select **Operator** from dropdown
4. Click **"Generate Report"**

**Report Shows:**
- Total stitches by design
- Rate per stitch for each design
- Calculated amount (stitches × rate)
- Grand total (only if all designs have rates)
- Date range: Current month (can be customized)

**Daily Production Report (Dashboard):**

1. Go to **"Dashboard"** page
2. Scroll to **"Daily Production Report"** section
3. **Change date** using date picker (defaults to today)

**Report Shows:**
- Production by machine
- Design being produced
- Operators who worked
- Total stitches produced
- Piece equivalents

---

### Understanding the Dashboard

The **Dashboard** is your factory overview. Here's what each metric means:

**Top Statistics Cards:**

1. **Active Machines (0-N)**
   - Number of machines currently running with active assignments
   - Green = working, 0 = idle

2. **In Production (0-N)**
   - Number of sub-lots currently being produced
   - Shows active work in progress

3. **Allocated (0-N)**
   - Sub-lots assigned to machines but not started yet
   - Ready for production assignment

4. **Completed Today (0-N)**
   - Sub-lots finished today
   - Resets daily

**Active Machine Assignments Table:**
- Shows which machine is working on what
- Progress bars show completion percentage
- Updated in real-time as shifts are logged

**Daily Production Report:**
- Summary of all production for selected date
- Grouped by machine and design
- Shows operators and output

**Sub-Lot Status Overview:**
- Visual breakdown of all sub-lots by state
- Received → Allocated → In Production → Completed → Dispatched

---

### Common Workflows & Tips

**Adding a New Client Order:**
1. Inbound → New Lot → Fill details → Add sub-lots → Create
2. Inbound → Find lot → Click "Allocate"
3. Production → New Assignment → Assign to machine

**Checking Daily Production:**
1. Dashboard → Daily Production Report → Select date
2. Review machine output and operators

**Calculating Operator Pay:**
1. Production → Salary Report → Select operator → Generate
2. Review designs and rates
3. Export or note grand total

**Viewing Machine Status:**
1. Dashboard → Active Machine Assignments
2. See what's currently running
3. Check progress percentages

**Handling Errors:**
- **"Failed to create"**: Check backend is running (`npm run dev:backend`)
- **"Invalid transition"**: Sub-lots can only move forward in state
- **"Machine already has active assignment"**: Complete current work first
- **Negative stitches**: Check counter readings and rounds are correct

---

### Understanding State Flow

Sub-lots move through these states in order:

```
received → allocated → in_production → completed → dispatched
```

**received**: Just arrived, not yet verified
**allocated**: Verified and ready for production assignment
**in_production**: Currently being worked on by a machine
**completed**: Production finished, ready to dispatch
**dispatched**: Sent back to client

You **cannot skip states** or **go backward**. This ensures proper tracking and audit trail.

---

### Quick Reference: What Goes Where

**Master Data** - One-time setup
- Add clients, designs, machines, operators
- Update design rates as needed
- Manage master records

**Inbound** - Daily receiving
- Register new lots from clients
- Split into sub-lots by design
- Allocate for production

**Production** - Daily management
- Assign sub-lots to machines
- View active work
- Generate salary reports
- Track progress

**Dashboard** - Real-time overview
- Monitor factory status
- View daily production
- Track sub-lot states
- Check machine utilization

**Shift Entry** - Operator use (mobile)
- Log production output
- Record counter readings
- Simple, fast interface
- Works on phones/tablets

---

### Sample Workflow Example

Let's walk through a complete example:

**Scenario:** ABC Textiles orders 1000 pieces of ROSE-001 design

1. **Receive Order (Inbound)**:
   - Create lot "LOT-2024-001" for ABC Textiles, 1000 pieces
   - Add sub-lot "LOT-2024-001-A", ROSE-001 design, 1000 pieces
   - Click Allocate

2. **Start Production (Production)**:
   - Assign sub-lot to Machine M-001, 1000 pieces issued
   - Dashboard shows: Active Machines = 1, In Production = 1

3. **Morning Shift (Shift Entry)**:
   - Operator: Rajesh Kumar
   - Previous: 0 (first shift)
   - Current: 289146
   - Rounds: 0
   - Result: 289,146 stitches = 0.5 pieces

4. **Afternoon Shift (Shift Entry)**:
   - Operator: Priya Sharma
   - Previous: 289146 (auto-filled)
   - Current: 59109
   - Rounds: 1 (counter rolled over)
   - Result: 348,256 stitches = 0.6 pieces

5. **Check Reports (Production & Dashboard)**:
   - Daily Production: M-001 produced 1.1 pieces today
   - Salary Report: Rajesh earned ₹433.72 (289,146 × 0.0015)

**Result**: Complete tracking from order to production with automatic calculations!

---

### Need Help?

- **Setup Issues**: See [QUICK_START.md](QUICK_START.md)
- **API Reference**: See [API.md](API.md)
- **Architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md)

## Project Structure

```
production-tracker/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.sql          # Database schema
│   │   │   ├── connection.js       # Database connection
│   │   │   └── migrate.js          # Migration script
│   │   ├── models/                 # Data models
│   │   ├── routes/                 # API routes
│   │   ├── services/
│   │   │   └── stitchCalculator.js # Core business logic
│   │   ├── tests/                  # Test files
│   │   └── server.js               # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js           # API client
│   │   ├── components/             # Shared components
│   │   ├── pages/                  # Page components
│   │   ├── styles/                 # Global styles
│   │   ├── App.jsx                 # App component
│   │   └── main.jsx                # Entry point
│   └── package.json
├── README.md
└── package.json                    # Workspace root
```

## Core Business Logic

### Stitch Calculation Formula

The system calculates total stitches produced in a shift using:

```
total_stitches = current_running - previous_running + (rounds_completed × stitches_per_piece)
```

**Example:**
- Design: 578,293 stitches per piece
- Previous counter: 564,117
- Current reading: 348,963
- Rounds completed: 1
- **Result**: 363,139 total stitches

### Validation Rules

1. **Negative Totals**: Flagged as errors
2. **Excessive Output**: Warnings for >50 piece equivalents per shift
3. **Counter Overflow**: Warnings when counter exceeds design stitch count without documented rounds
4. **Previous Counter**: Auto-populated from last shift; defaults to zero for first entry

### State Transitions

Sub-lots follow strict state progression:
- `received` → `allocated`
- `allocated` → `in_production`
- `in_production` → `completed`
- `completed` → `dispatched`

No backward transitions are permitted.

## API Endpoints

### Master Data
- `GET/POST /api/clients` - Client management
- `GET/POST /api/designs` - Design management
- `GET/POST /api/machines` - Machine management
- `GET/POST /api/operators` - Operator management

### Lot Management
- `GET/POST /api/lots` - Lot operations
- `GET /api/sublots` - Sub-lot listing
- `PUT /api/sublots/:id/state` - State transitions

### Production
- `GET/POST /api/assignments` - Assignment management
- `GET /api/assignments/machine/:machineId/active` - Active assignment lookup
- `PUT /api/assignments/:id/progress` - Update progress

### Shift Logging
- `GET/POST /api/shiftlogs` - Shift log operations
- `GET /api/shiftlogs/previous-running` - Get previous counter reading
- `GET /api/shiftlogs/daily-production` - Daily production report
- `GET /api/shiftlogs/salary-report/:operatorId` - Salary report

## Testing

Run tests for the backend:
```bash
npm test --workspace=backend
```

## Deployment

### Production Build

```bash
# Build both frontend and backend
npm run build

# Or build individually
npm run build --workspace=frontend
npm run build --workspace=backend
```

### Environment Variables

Backend (.env):
```
PORT=3000
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=production_tracker
DB_USER=postgres
DB_PASSWORD=your_password
CORS_ORIGIN=https://your-domain.com
```

## Key Features Implementation

### Auto-populated Previous Counter
The system automatically fetches the last counter reading for the same machine and design, ensuring data integrity in the stitch calculation chain.

### Concurrent Shift Handling
Multiple machines can log shifts simultaneously. The system maintains separate counter chains per machine-design combination.

### Data Integrity
- Sub-lot pieces must sum to lot total pieces
- State transitions are validated and audited
- Previous-running chain integrity is critical for accurate salary calculations

### Performance Considerations
- Database indexes on frequently queried fields
- Efficient joins for reporting queries
- Sub-2-second target for page loads

## Mobile Optimization

The Shift Entry interface is optimized for low-end mobile devices:
- Large touch targets (minimum 44px)
- Minimal text input
- Clear visual feedback
- Pre-filled form data
- Simple, focused UI

## Contributing

This is a trial project. For questions or issues, contact the project maintainer.

## License

Proprietary - All rights reserved
