# User Guide - Production Tracking System

Quick reference guide for daily operations.

## Quick Links

- **Complete Tutorial**: [WEBSITE_TUTORIAL.md](WEBSITE_TUTORIAL.md) - Detailed step-by-step guide
- **Setup Guide**: [QUICK_START.md](QUICK_START.md) - Installation and setup
- **API Reference**: [API.md](API.md) - API endpoints documentation
- **Main Documentation**: [README.md](README.md) - Project overview

---

## Daily Operations Cheat Sheet

### Morning Routine (Office Staff)

**Check Incoming Orders:**
1. Go to **Inbound**
2. Create new lots for received orders
3. Split into sub-lots by design
4. Click **"Allocate"** for each lot

**Assign Work:**
1. Go to **Production**
2. Create assignments for available machines
3. Verify sub-lots are allocated

### During Production (Supervisors)

**Monitor Progress:**
1. Go to **Dashboard**
2. Check active machines count
3. Review in-progress sub-lots
4. Monitor daily production

**Handle Issues:**
- Check assignment progress bars
- Verify shift logs are being entered
- Address any warnings/errors

### End of Shift (Operators)

**Log Production:**
1. Navigate to shift entry: `/shift/[machine-id]`
2. Select your name
3. Enter counter reading
4. Enter rounds if applicable
5. Submit

### End of Day (Management)

**Review Reports:**
1. **Dashboard** → Daily Production Report
2. **Production** → Salary Reports
3. Check completed sub-lots
4. Review operator output

---

## Common Tasks

### Adding a New Client

Master Data → Clients → Add New → Enter name & phone → Create

### Adding a New Design

Master Data → Designs → Add New → Enter identifier, stitches, rate → Create

### Creating a Lot

Inbound → New Lot → Fill details → Add sub-lots → Create → Allocate

### Assigning Work

Production → New Assignment → Select machine, sub-lot, pieces → Create

### Logging a Shift

Shift Entry → Select operator, date, shift → Enter counter → Submit

### Checking Salary

Production → Salary Report → Select operator → Generate Report

---

## Page Overview

| Page | Primary Users | Main Functions |
|------|---------------|----------------|
| **Dashboard** | Management, Supervisors | Monitor factory, view metrics, daily reports |
| **Inbound** | Office Staff | Receive lots, create sub-lots, allocate |
| **Production** | Supervisors | Create assignments, track progress, generate salary reports |
| **Master Data** | Admins | Manage clients, designs, machines, operators |
| **Shift Entry** | Operators | Log production output (mobile-optimized) |

---

## State Flow Reference

```
Lot Created → Allocated → Assigned to Machine → In Production → Completed → Dispatched
```

**States:**
- **received**: Just arrived from client
- **allocated**: Verified and ready for assignment
- **in_production**: Currently being worked on
- **completed**: Production finished
- **dispatched**: Sent back to client

---

## Formula Reference

### Stitch Calculation

```
total_stitches = current_counter - previous_counter + (rounds_completed × stitches_per_piece)
```

**Example:**
- Previous: 564,117
- Current: 348,963  
- Rounds: 1
- Stitches per piece: 578,293
- **Total**: 363,139 stitches

### Piece Equivalents

```
piece_equivalents = total_stitches / stitches_per_piece
```

### Operator Compensation

```
amount = total_stitches × rate_per_stitch
```

---

## Troubleshooting Quick Reference

| Error | Cause | Solution |
|-------|-------|----------|
| "Failed to create" | Backend not running | Start backend: `npm run dev:backend` |
| "Invalid state transition" | Trying to skip states | Follow state order: received → allocated → in_production |
| "Machine already has active assignment" | Machine is busy | Complete current assignment first |
| "Sub-lot pieces must equal lot total" | Math error in sub-lots | Verify sub-lot piece counts sum correctly |
| Negative stitches | Counter reading error | Check counter value and rounds |
| Dashboard shows zeros | No data exists | Create lots and assignments |
| Previous counter wrong | Data entry error | Check shift log history |

---

## Keyboard Shortcuts & Tips

### Navigation
- Click page names in top navigation bar
- Back button returns to previous page

### Forms
- **Tab** - Move to next field
- **Enter** - Submit form (when focused on button)
- **Escape** - Cancel form (click Cancel button)

### Shift Entry (Mobile)
- Large buttons designed for finger taps
- Minimal typing required
- Portrait mode recommended
- Works offline (with limitations)

---

## Best Practices

### Data Entry
✅ Use consistent naming conventions for lots (e.g., LOT-YYYY-NNN)
✅ Double-check counter readings before submitting
✅ Verify sub-lot pieces sum to lot total
✅ Set design rates before generating salary reports

### Production Management
✅ Allocate lots as soon as they're verified
✅ Assign work to machines at shift start
✅ Monitor dashboard throughout the day
✅ Generate reports at end of day/week/month

### Shift Logging
✅ Log shifts promptly (same day)
✅ Verify previous counter matches expectation
✅ Document rounds when counter resets
✅ Check for warnings/errors after submission

### Reporting
✅ Review daily production reports each evening
✅ Generate salary reports before payroll
✅ Verify all designs have rates set
✅ Archive/export important reports

---

## Mobile Access

### Shift Entry on Phones

**Recommended Setup:**
1. Generate QR code for each machine
2. QR code encodes URL: `/shift/[machine-id]`
3. Operators scan QR code with phone
4. Log shift directly from machine

**URL Format:**
```
http://localhost:5173/shift/1
http://localhost:5173/shift/2
http://localhost:5173/shift/3
```

**Benefits:**
- No need to remember machine IDs
- Fast access from production floor
- Works on any smartphone
- No app installation required

---

## Reporting Schedule

### Daily Reports
- **End of Day**: Daily Production Report
- **Purpose**: Track daily output by machine

### Weekly Reports
- **End of Week**: Salary Reports for all operators
- **Purpose**: Weekly payroll preparation

### Monthly Reports
- **End of Month**: Complete salary reports
- **Purpose**: Monthly compensation
- **End of Month**: Production summaries
- **Purpose**: Performance analysis

---

## Data Backup Recommendations

### Database Backups
- **Frequency**: Daily (automated)
- **Retention**: 30 days minimum
- **Location**: Off-site backup storage

### Report Exports
- **Frequency**: Weekly
- **Format**: CSV or PDF
- **Storage**: Document management system

---

## Security Notes

### Access Control
- Master Data: Admin only
- Inbound: Office staff
- Production: Supervisors and admins
- Shift Entry: All operators
- Dashboard: All users (read-only)

### Data Privacy
- Operator phone numbers: Confidential
- Salary rates: Restricted access
- Client information: Confidential
- Production data: Internal use only

---

## Support & Resources

### Documentation
- [WEBSITE_TUTORIAL.md](WEBSITE_TUTORIAL.md) - Complete tutorial
- [QUICK_START.md](QUICK_START.md) - Setup guide
- [API.md](API.md) - API reference
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical details
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment
- [DATA_MODEL.md](DATA_MODEL.md) - Database schema

### Getting Help
1. Check this user guide first
2. Review relevant documentation
3. Check troubleshooting section
4. Contact system administrator

---

## Glossary

**Lot**: A batch of work received from a client
**Sub-lot**: A portion of a lot assigned to a specific design
**Assignment**: A sub-lot allocated to a machine for production
**Shift Log**: Record of operator production during a shift
**Counter**: Machine stitch counter reading
**Rounds**: Complete rotations/cycles of machine head
**Piece Equivalents**: Production output measured in complete pieces
**Rate**: Compensation per stitch for a design
**State**: Current status of a sub-lot in production workflow

---

**Last Updated**: 2026-08-16
**Version**: 1.0.0
