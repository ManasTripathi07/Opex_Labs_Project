# 🚀 Getting Started

Quick setup guide and daily operations workflow.

---

## 🎯 First Time Setup (One-Time)

### **Step 1: System Installation** (Technical Staff)

```bash
# Backend setup
cd backend
npm install
npm run migrate

# Frontend setup
cd frontend
npm install
npm run dev
```

### **Step 2: Create Master Data**

Before you can start production, set up your basics:

#### **Add Machines:**
1. Go to **Master Data** → **Machines** tab
2. Click **"New Machine"**
3. Enter:
   - Identifier: `M-001`
   - Name: `Machine 001`
4. Repeat for all machines
5. ✅ Machines ready

#### **Add Designs:**
1. Go to **Master Data** → **Designs** tab
2. Click **"New Design"**
3. Enter:
   - Identifier: `BUTTERFLY-004`
   - Stitches per piece: `12000`
   - Rate per stitch: `0.035`
4. Repeat for all designs
5. ✅ Designs ready

#### **Add Operators:**
1. Go to **Master Data** → **Operators** tab
2. Click **"New Operator"**
3. Enter:
   - Name: `John Doe`
   - Phone: `+91-9876543210`
4. Repeat for all operators
5. ✅ Operators ready

#### **Add Clients:**
1. Go to **Master Data** → **Clients** tab
2. Click **"New Client"**
3. Enter:
   - Name: `ABC Exports`
   - Phone: `+91-9876543210`
4. Repeat for all clients
5. ✅ Clients ready

**Setup complete!** You're ready for production.

---

## 📅 Daily Operations

### **Morning Routine:**

#### **1. Receiving Staff (8:00 AM):**
```
If new orders arrived:
├─ Open Inbound page
├─ Create new lot
├─ Enter lot details
├─ Split into sub-lots by design
└─ Submit
   └─ ✅ Sub-lots ready for assignment
```

#### **2. Supervisor (8:30 AM):**
```
├─ Check Dashboard for yesterday's status
├─ Open Production page
├─ Review available sub-lots
├─ Create assignments:
│  ├─ Select machine
│  ├─ Select sub-lot
│  ├─ Enter pieces to assign
│  └─ Submit
└─ ✅ Machines ready to start
```

#### **3. Operators (9:00 AM - Morning Shift Start):**
```
├─ Open shift entry page on phone
├─ Verify machine and design
├─ Note starting counter reading
├─ Begin production
└─ (Log shift at end)
```

---

### **Afternoon Routine:**

#### **Operators (12:00 PM - Morning Shift End):**
```
Morning shift ends:
├─ Check counter reading
├─ Open shift entry page
├─ Enter current counter
├─ Enter rounds (if any)
├─ Submit
└─ ✅ Progress automatically updated
   ├─ Dashboard refreshes
   ├─ Progress bar moves
   └─ If 100% → Auto-completes!
```

#### **Supervisor (1:00 PM):**
```
├─ Check Dashboard
├─ Review morning progress
├─ Investigate any warnings
├─ Create new assignments if needed
└─ ✅ Ready for afternoon shift
```

#### **Operators (1:00 PM - Afternoon Shift Start):**
```
├─ Open shift entry page
├─ Note counter reading
├─ Begin production
└─ (Log shift at end)
```

---

### **Evening Routine:**

#### **Operators (6:00 PM - Afternoon Shift End):**
```
Afternoon shift ends:
├─ Check counter reading
├─ Log shift
└─ ✅ Progress updates
```

---

### **Night Routine (If Applicable):**

#### **Operators (9:00 PM - Night Shift):**
```
Night shift (if running):
├─ Same process as other shifts
├─ Log at shift start or end
└─ ✅ Dashboard shows all shifts
```

---

### **End of Day (10:00 PM):**

#### **Supervisor:**
```
Daily review:
├─ Open Dashboard
├─ Check "Completed Today" count
├─ Review Daily Production Report
├─ Note any pending assignments
├─ Plan tomorrow's work
└─ ✅ Day complete
```

---

## 📊 End of Month Operations

### **Salary Processing:**

```
For each operator:
├─ Go to Production page
├─ Click operator name
├─ Select date range (Month start - end)
├─ Review breakdown:
│  ├─ Design-wise stitches
│  ├─ Rate per design
│  └─ Total amount
├─ Export or print report
└─ Process payment
```

### **Production Review:**

```
Monthly metrics:
├─ Total completed assignments
├─ Pieces produced per machine
├─ Operator performance
├─ Client order completion
└─ Dispatch status
```

---

## 🎓 Training New Users

### **For New Operators:**

**Day 1 (30 minutes):**
```
1. Show shift entry page
2. Explain counter reading
3. Demo: Log a practice shift
4. Practice: Let them log 2-3 shifts
5. Q&A
```

**Day 2 (15 minutes):**
```
1. Review yesterday's work
2. Answer questions
3. Supervised shift logging
4. ✅ Independent after this
```

### **For New Supervisors:**

**Week 1 (2 hours):**
```
Day 1:
├─ Dashboard overview
├─ Creating assignments
└─ Monitoring progress

Day 2:
├─ Reading warnings
├─ Generating reports
└─ Troubleshooting common issues

Day 3:
├─ Monthly operations
├─ Salary reports
└─ Advanced features
```

### **For New Receiving Staff:**

**Day 1 (1 hour):**
```
1. Show Inbound page
2. Create a practice lot
3. Split into sub-lots
4. Review status tracking
5. Practice with real data
```

---

## 🔄 Typical Work Cycles

### **Fast-Moving Design (1-2 Days):**

```
Day 1:
├─ 8 AM: Lot received, sub-lot created
├─ 9 AM: Assigned to M-001
├─ 12 PM: First shift logged (25% done)
├─ 6 PM: Second shift logged (60% done)
└─ Status: In Production

Day 2:
├─ 9 AM: Continue production
├─ 12 PM: Third shift (90% done)
├─ 3 PM: Final shift (100%)
├─ System auto-completes ✅
└─ 5 PM: Dispatched
```

### **Large Order (1 Week):**

```
Week Timeline:
├─ Monday: Lot arrives, split into 5 sub-lots
├─ Monday: All 5 assigned to different machines
├─ Tue-Fri: Daily shift logging
│  ├─ Progress updates automatically
│  ├─ Some complete mid-week
│  └─ New assignments created
└─ Friday: All complete, ready for dispatch
```

---

## 💡 Best Practices

### **Data Entry:**

✅ **DO:**
- Log shifts immediately after completion
- Double-check counter readings
- Document rounds when counter resets
- Review warnings before submitting
- Keep master data updated

❌ **DON'T:**
- Wait to log shifts in batch
- Guess counter readings
- Ignore warning messages
- Skip rounds documentation
- Let master data become outdated

### **Assignment Planning:**

✅ **DO:**
- Assign work based on machine capacity
- Balance workload across machines
- Check design availability before assigning
- Create assignments at shift start
- Monitor progress throughout day

❌ **DON'T:**
- Over-assign (more than machine can handle)
- Assign without checking design setup
- Leave machines idle when work available
- Create too many assignments at once
- Ignore progress warnings

### **Quality Control:**

✅ **DO:**
- Review daily production reports
- Check warning messages daily
- Verify suspicious outputs
- Cross-check with physical production
- Document recurring issues

❌ **DON'T:**
- Ignore red error messages
- Accept implausible outputs
- Skip daily reviews
- Override validations without checking
- Dismiss operator feedback

---

## 🎯 Success Metrics

### **Daily:**
- ✅ All shifts logged on time
- ✅ No unresolved errors
- ✅ Progress matches physical output
- ✅ Dashboard metrics accurate

### **Weekly:**
- ✅ All assignments completed or on track
- ✅ No late salary reports
- ✅ Operators trained and comfortable
- ✅ System running smoothly

### **Monthly:**
- ✅ Salary reports generated on time
- ✅ All lots dispatched
- ✅ Master data current
- ✅ Zero critical issues

---

## 🆘 Quick Start Checklist

### **Before First Use:**
- [ ] System installed and running
- [ ] Database migrated
- [ ] Master data created (machines, designs, operators, clients)
- [ ] Test lot created
- [ ] Practice assignment made
- [ ] Practice shift logged
- [ ] Dashboard showing data correctly

### **Day 1 Production:**
- [ ] Morning lots entered
- [ ] Assignments created
- [ ] Operators can access shift entry
- [ ] First shifts logged successfully
- [ ] Progress bars updating
- [ ] No errors in console

### **Week 1 Goals:**
- [ ] All operators trained
- [ ] All supervisors comfortable
- [ ] Daily workflow established
- [ ] Reports running correctly
- [ ] Backup procedures in place

---

**Ready to start?** Check [HOW_TO_USE.md](HOW_TO_USE.md) for detailed usage instructions.

**Last Updated:** August 17, 2026
