# Website Tutorial - Production Tracking System

This tutorial will guide you through using the Production Tracking System, explaining each page and the complete production workflow.

## Table of Contents
1. [Understanding the Interface](#understanding-the-interface)
2. [Initial Setup: Add Master Data](#initial-setup-add-master-data)
3. [Production Workflow](#production-workflow-step-by-step)
4. [Understanding the Dashboard](#understanding-the-dashboard)
5. [Common Workflows](#common-workflows--tips)
6. [State Flow](#understanding-state-flow)
7. [Quick Reference](#quick-reference-what-goes-where)
8. [Sample Workflow](#sample-workflow-example)

---

## Understanding the Interface

The system has **4 main pages** accessible from the navigation bar:

1. **Dashboard** - Factory overview and metrics
2. **Inbound** - Receiving and registering new lots
3. **Production** - Managing machine assignments and reports
4. **Master Data** - Managing clients, designs, machines, and operators

---

## Initial Setup: Add Master Data

Before you can track production, you need to set up your master data.

### Navigate to Master Data

Click **"Master Data"** in the navigation. You'll see 4 tabs:

### 1. Clients Tab - Add Your Customers

- Click **"Add New"**
- Enter **Name**: e.g., "ABC Textiles"
- Enter **Phone**: e.g., "+91 98765 43210"
- Click **"Create"**
- Repeat to add more clients

### 2. Designs Tab - Add Embroidery Designs

- Click **"Add New"**
- Enter **Identifier**: e.g., "ROSE-001"
- Enter **Stitches per Piece**: e.g., 578293
- Enter **Rate per Stitch** (optional): e.g., 0.0015
- Click **"Create"**
- This rate determines operator compensation

### 3. Machines Tab - Add Production Machines

- Click **"Add New"**
- Enter **Identifier**: e.g., "M-001"
- Enter **Name**: e.g., "Tajima TMEX-C1501"
- Click **"Create"**

### 4. Operators Tab - Add Machine Operators

- Click **"Add New"**
- Enter **Name**: e.g., "Rajesh Kumar"
- Enter **Phone**: e.g., "+91 98765 00001"
- Click **"Create"**

**Quick Tip:** You can also run `npm run seed --workspace=backend` to automatically create sample master data for testing.

---

## Production Workflow: Step-by-Step

Follow these steps in order to track a complete production cycle.

### Step 1: Receive a Lot (Inbound Page)

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

### Step 2: Allocate Sub-Lots (Inbound Page)

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

### Step 3: Assign to Machine (Production Page)

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

### Step 4: Log Production Shifts (Shift Entry Page)

Operators log their work output each shift:

#### Accessing Shift Entry

- Navigate to: `http://localhost:5173/shift/[MACHINE_ID]`
- Replace `[MACHINE_ID]` with your machine ID (e.g., 1, 2, 3)
- **Tip:** You can generate QR codes for each machine that encode this URL

#### Logging a Shift

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

#### What Happens

- System calculates total stitches automatically using formula:
  ```
  total_stitches = current - previous + (rounds × stitches_per_piece)
  ```
- Piece equivalents calculated
- Warnings shown if output seems unusual (>50 pieces)
- Errors shown if negative stitch count detected

#### Mobile-Friendly Design

- Large buttons for easy tapping
- Minimal typing required
- Clear success/error feedback
- Works on low-end devices

---

### Step 5: View Reports

#### Salary Report (Production Page)

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

#### Daily Production Report (Dashboard)

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

## Understanding the Dashboard

The **Dashboard** is your factory overview. Here's what each metric means:

### Top Statistics Cards

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

### Active Machine Assignments Table

- Shows which machine is working on what
- Progress bars show completion percentage
- Updated in real-time as shifts are logged

### Daily Production Report

- Summary of all production for selected date
- Grouped by machine and design
- Shows operators and output

### Sub-Lot Status Overview

- Visual breakdown of all sub-lots by state
- Received → Allocated → In Production → Completed → Dispatched

---

## Common Workflows & Tips

### Adding a New Client Order

1. Inbound → New Lot → Fill details → Add sub-lots → Create
2. Inbound → Find lot → Click "Allocate"
3. Production → New Assignment → Assign to machine

### Checking Daily Production

1. Dashboard → Daily Production Report → Select date
2. Review machine output and operators

### Calculating Operator Pay

1. Production → Salary Report → Select operator → Generate
2. Review designs and rates
3. Export or note grand total

### Viewing Machine Status

1. Dashboard → Active Machine Assignments
2. See what's currently running
3. Check progress percentages

### Handling Errors

- **"Failed to create"**: Check backend is running (`npm run dev:backend`)
- **"Invalid transition"**: Sub-lots can only move forward in state
- **"Machine already has active assignment"**: Complete current work first
- **Negative stitches**: Check counter readings and rounds are correct

---

## Understanding State Flow

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

## Quick Reference: What Goes Where

### Master Data - One-time setup
- Add clients, designs, machines, operators
- Update design rates as needed
- Manage master records

### Inbound - Daily receiving
- Register new lots from clients
- Split into sub-lots by design
- Allocate for production

### Production - Daily management
- Assign sub-lots to machines
- View active work
- Generate salary reports
- Track progress

### Dashboard - Real-time overview
- Monitor factory status
- View daily production
- Track sub-lot states
- Check machine utilization

### Shift Entry - Operator use (mobile)
- Log production output
- Record counter readings
- Simple, fast interface
- Works on phones/tablets

---

## Sample Workflow Example

Let's walk through a complete example:

**Scenario:** ABC Textiles orders 1000 pieces of ROSE-001 design

### 1. Receive Order (Inbound)

- Create lot "LOT-2024-001" for ABC Textiles, 1000 pieces
- Add sub-lot "LOT-2024-001-A", ROSE-001 design, 1000 pieces
- Click Allocate

### 2. Start Production (Production)

- Assign sub-lot to Machine M-001, 1000 pieces issued
- Dashboard shows: Active Machines = 1, In Production = 1

### 3. Morning Shift (Shift Entry)

- Operator: Rajesh Kumar
- Previous: 0 (first shift)
- Current: 289146
- Rounds: 0
- **Result**: 289,146 stitches = 0.5 pieces

### 4. Afternoon Shift (Shift Entry)

- Operator: Priya Sharma
- Previous: 289146 (auto-filled)
- Current: 59109
- Rounds: 1 (counter rolled over)
- **Result**: 348,256 stitches = 0.6 pieces

### 5. Check Reports

**Daily Production:**
- M-001 produced 1.1 pieces today

**Salary Report:**
- Rajesh earned ₹433.72 (289,146 × 0.0015)
- Priya earned ₹522.38 (348,256 × 0.0015)

**Result**: Complete tracking from order to production with automatic calculations!

---

## Need Help?

- **Setup Issues**: See [QUICK_START.md](QUICK_START.md)
- **API Reference**: See [API.md](API.md)
- **Architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Main Documentation**: See [README.md](README.md)

---

**Next Steps:**
- Try the complete workflow yourself
- Experiment with different shift patterns
- Generate reports for different date ranges
- Set up QR codes for shift entry on mobile devices
