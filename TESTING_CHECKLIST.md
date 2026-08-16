# Testing Checklist

This document tracks what has been tested and what needs testing.

## ✅ Code Quality Checks (Completed)

- ✅ JavaScript syntax validation (all backend files)
- ✅ File structure verification
- ✅ Dependencies installed
- ✅ Configuration files present
- ✅ No obvious syntax errors

## ⚠️ Runtime Testing Required

### Backend Testing

#### Database Layer
- [ ] PostgreSQL connection successful
- [ ] Database migrations run successfully
- [ ] All 10 tables created correctly
- [ ] Indexes created
- [ ] Triggers working (updated_at auto-update)
- [ ] Foreign key constraints enforced
- [ ] Check constraints working

#### Model Tests
- [ ] Client model CRUD operations
- [ ] Design model CRUD operations
- [ ] Machine model with rotations
- [ ] Operator model CRUD operations
- [ ] Lot model with sub-lots creation
- [ ] Sub-lot state transitions (valid only)
- [ ] Assignment model (single active per machine)
- [ ] ShiftLog model with auto-calculated stitches

#### Business Logic Tests
- [ ] StitchCalculator: Basic calculation
- [ ] StitchCalculator: First shift (previous = 0)
- [ ] StitchCalculator: With rounds completed
- [ ] StitchCalculator: Negative total detection
- [ ] StitchCalculator: >50 piece warning
- [ ] StitchCalculator: Counter overflow warning
- [ ] Previous counter auto-population
- [ ] Salary report with mixed rates

#### API Endpoint Tests
- [ ] GET /api/clients
- [ ] POST /api/clients
- [ ] GET /api/designs
- [ ] POST /api/designs (with rate)
- [ ] GET /api/machines/:id (with rotations)
- [ ] POST /api/machines (with rotations)
- [ ] GET /api/operators
- [ ] POST /api/lots (with sub-lots validation)
- [ ] PUT /api/sublots/:id/state (valid transition)
- [ ] PUT /api/sublots/:id/state (invalid transition - should fail)
- [ ] POST /api/assignments (machine already active - should fail)
- [ ] GET /api/assignments/machine/:id/active
- [ ] PUT /api/assignments/:id/progress
- [ ] POST /api/shiftlogs
- [ ] GET /api/shiftlogs/previous-running
- [ ] GET /api/shiftlogs/daily-production
- [ ] GET /api/shiftlogs/salary-report/:operatorId

#### Error Handling
- [ ] 404 for non-existent resources
- [ ] 400 for validation errors
- [ ] 409 for constraint violations
- [ ] 500 for database errors
- [ ] Proper error messages returned

### Frontend Testing

#### Build & Dev Server
- [ ] `npm run dev` starts without errors
- [ ] Vite dev server runs on port 5173
- [ ] Hot reload works
- [ ] No console errors on load

#### UI Pages
- [ ] Dashboard loads and displays stats
- [ ] Dashboard shows empty state correctly
- [ ] Inbound UI loads
- [ ] Inbound UI: Create lot with sub-lots
- [ ] Inbound UI: Sub-lot validation (pieces must sum)
- [ ] Production UI loads
- [ ] Production UI: Create assignment
- [ ] Production UI: View active assignments
- [ ] Production UI: Generate salary report
- [ ] Master Data tabs work
- [ ] Master Data: Create each entity type
- [ ] Shift Entry loads (/shift/:machineId)
- [ ] Shift Entry: Previous counter auto-populated
- [ ] Shift Entry: Submit shift log
- [ ] Shift Entry: Success/error messages

#### Mobile Responsiveness
- [ ] Shift Entry works on mobile viewport
- [ ] Large tap targets (44px minimum)
- [ ] No horizontal scroll on mobile
- [ ] Forms usable on small screens

#### API Integration
- [ ] API client handles errors gracefully
- [ ] Loading states shown
- [ ] Success messages displayed
- [ ] Error messages user-friendly
- [ ] Data refreshes after mutations

### Integration Tests

#### Complete Workflows
- [ ] Create lot → Split into sub-lots → Allocate → Assign to machine → Log shifts → Generate reports
- [ ] Multiple operators on same machine (different shifts)
- [ ] Multiple machines running simultaneously
- [ ] State transition enforcement end-to-end
- [ ] Salary calculation accuracy

#### Edge Cases
- [ ] First shift on machine (previous = 0)
- [ ] Counter rollover with rounds
- [ ] Very large stitch counts
- [ ] Designs without rates (salary report)
- [ ] Empty data states in UI
- [ ] Network errors during API calls

### Performance Tests
- [ ] Page load < 2 seconds
- [ ] API responses < 500ms (simple queries)
- [ ] API responses < 2 seconds (complex reports)
- [ ] Frontend handles 100+ lots
- [ ] Backend handles concurrent requests

## 🐛 Known Issues

### Fixed
1. ✅ Test script Windows compatibility (added cross-env)

### To Investigate
1. ⚠️ Need to run `npm install` in backend to get cross-env
2. ⚠️ Need PostgreSQL running to test database layer
3. ⚠️ Need to test actual API calls with running backend

## 📋 Pre-Deployment Checklist

Before deploying to production:
- [ ] All unit tests passing
- [ ] All API endpoint tests passing
- [ ] All UI workflows tested manually
- [ ] Mobile testing completed
- [ ] Security review completed
- [ ] Performance benchmarks met
- [ ] Documentation reviewed and accurate
- [ ] Environment variables configured correctly
- [ ] Database backups configured
- [ ] Monitoring/logging set up

## 🧪 How to Run Tests

### Unit Tests (Backend)
```bash
# Install updated dependencies first
npm install --workspace=backend

# Run tests
npm test --workspace=backend
```

### Manual API Testing
```bash
# Start backend
npm run dev:backend

# In another terminal, test endpoints:
curl http://localhost:3000/health
curl http://localhost:3000/api/clients
# ... etc
```

### Manual UI Testing
```bash
# Start both servers
npm run dev

# Open browser to http://localhost:5173
# Test each page manually
```

## ✍️ Testing Notes

Add notes here as you test:

```
Date: ___________
Tester: ___________
Test: ___________
Result: ___________
Issues Found: ___________
```
