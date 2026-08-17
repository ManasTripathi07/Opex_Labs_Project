# 🆘 Troubleshooting Guide

Common issues and solutions for the Production Tracker.

---

## 📊 Dashboard Issues

### **Progress bar not moving?**

**Symptoms:**
- Operator logged shift
- Dashboard still shows 0% or old percentage
- Progress bar hasn't updated

**Solutions:**
1. **Refresh the page** (F5)
2. **Check assignment has ID:**
   - Go to Production page
   - Click assignment details
   - Verify `assignment_id` is set
3. **Verify shift was submitted:**
   - Check shift logs table
   - Look for recent entry
4. **Check database connection:**
   - Backend logs for errors
   - Verify DATABASE_URL is set

---

### **KPI counts incorrect?**

**Symptoms:**
- "In Production" count wrong
- "Completed Today" count off
- Numbers don't match physical reality

**Solutions:**
1. **Hard refresh** - Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Check date filter** - Ensure correct date selected
3. **Verify sub-lot states:**
   - Go to Inbound page
   - Check status of sub-lots
   - Compare with expected states
4. **Check completion timestamps:**
   - Completed assignments should have `completed_at` timestamp
   - Today's completions filter by date

---

### **Can't see worker character?**

**Symptoms:**
- Worker character not visible in navbar
- Top-right corner empty

**Solutions:**
1. **Check screen size:**
   - Character hides on very small screens (<640px)
   - Try landscape mode on phone
2. **Try different browser:**
   - Chrome, Firefox, Safari, Edge all supported
   - Update browser to latest version
3. **Check JavaScript:**
   - Ensure JavaScript is enabled
   - Check browser console for errors
4. **Clear cache:**
   - Hard refresh: Ctrl+Shift+R
   - Or clear browser cache completely

---

## 📱 Shift Entry Issues

### **"Negative stitches" error?**

**Symptoms:**
```
❌ Error: Negative total stitches calculated
```

**Causes:**
- Current counter < previous counter
- Forgot to log rounds when counter reset

**Solutions:**

**If counter DID reset to zero:**
1. Enter how many times it reset in "Rounds Completed"
2. Example:
   ```
   Previous: 98000
   Current: 5000
   Counter reset once (went to 100000, then started over)
   Solution: Enter Rounds = 1
   ```

**If counter did NOT reset:**
1. Check if you entered correct counter reading
2. Verify you're reading the right counter
3. Ask supervisor to check assignment history

---

### **"50-piece warning" appearing?**

**Symptoms:**
```
⚠️ Warning: Output seems high (52 pieces in one shift)
```

**This is NOT an error** - just a warning!

**Causes:**
- System thinks output is suspiciously high
- Flags for manual review

**Actions:**
1. **Double-check your entries:**
   - Counter reading correct?
   - Rounds documented?
   - Design correct?
2. **If everything is correct:**
   - Submit anyway
   - Warning is informational only
3. **If something is wrong:**
   - Correct the values
   - Re-submit

---

### **Auto-filled counter is wrong?**

**Symptoms:**
- Previous counter shows incorrect value
- Doesn't match last shift

**Causes:**
- System pulls last logged shift
- May be from different machine/assignment

**Solution:**
1. **Ignore auto-filled value**
2. **Enter actual current counter** from machine
3. **System will calculate correctly**
4. **Note:** Counter chain maintains integrity automatically

---

### **Submit button not working?**

**Symptoms:**
- Click Submit, nothing happens
- No error message, no success

**Solutions:**
1. **Check required fields:**
   - Counter reading filled?
   - Valid number?
2. **Check internet connection:**
   - Wi-Fi connected?
   - Mobile data on?
3. **Check browser console:**
   - Press F12
   - Look for red errors
   - Share with technical support
4. **Try refreshing page:**
   - Ctrl+R (Windows) or Cmd+R (Mac)
   - Re-enter data and retry

---

## 🏭 Production Page Issues

### **Can't create assignment?**

**Symptoms:**
- Click "New Assignment"
- Form doesn't submit or shows error

**Solutions:**

**No machines available:**
1. Go to Master Data
2. Create machines first
3. Return to Production

**No sub-lots available:**
1. Go to Inbound
2. Create lots and sub-lots
3. Return to Production

**Pieces exceeds sub-lot:**
1. Check sub-lot piece count
2. Enter ≤ available pieces
3. Can't assign more than available

---

### **Assignment shows but operators can't see it?**

**Symptoms:**
- Assignment visible in Production page
- Shift entry shows "No assignment"

**Solutions:**
1. **Verify machine assignment:**
   - Check correct machine assigned?
   - Check assignment status = "active"
2. **Refresh shift entry page:**
   - Operator should refresh browser
   - Hard refresh if needed
3. **Check assignment ID:**
   - Assignment should have valid ID
   - Check in database if needed

---

## 📥 Inbound Issues

### **Can't split lot into sub-lots?**

**Symptoms:**
- Error when creating sub-lots
- "Pieces don't match" error

**Cause:**
- Sub-lot pieces ≠ total lot pieces

**Solution:**
```
Example:
Lot total: 500 pieces

Sub-lot 1: 200 pieces ✓
Sub-lot 2: 300 pieces ✓
─────────────────────────
Total:     500 pieces ✅ Matches!

Sub-lot 1: 200 pieces
Sub-lot 2: 250 pieces
─────────────────────────
Total:     450 pieces ❌ Doesn't match!
```

**Fix:** Adjust sub-lot pieces to equal lot total.

---

### **Sub-lot stuck in wrong state?**

**Symptoms:**
- Shows "allocated" but work is done
- Shows "in_production" but not assigned

**Solutions:**
1. **Let system auto-update:**
   - State changes when shifts logged
   - Be patient, it's automatic
2. **If genuinely stuck:**
   - Check shift logs for this sub-lot
   - Verify assignment exists
   - Contact technical support

---

## 🎨 UI/Display Issues

### **Styles broken / looks wrong?**

**Symptoms:**
- Layout messed up
- Colors wrong
- Buttons missing
- Text overlapping

**Solutions:**
1. **Hard refresh:**
   - Ctrl+Shift+R (Windows)
   - Cmd+Shift+R (Mac)
   - Clears old cached styles
2. **Clear cache completely:**
   - Browser settings → Clear browsing data
   - Select "Cached images and files"
   - Time range: All time
   - Clear
3. **Try incognito/private mode:**
   - Tests without cache
   - If works there, cache is issue

---

### **Dark mode not working?**

**Symptoms:**
- Theme toggle doesn't switch
- Stuck in light or dark mode

**Solutions:**
1. **Check theme toggle:**
   - Click sun/moon icon in navbar
   - Should toggle immediately
2. **Clear localStorage:**
   ```javascript
   // In browser console (F12)
   localStorage.clear()
   location.reload()
   ```
3. **System preference:**
   - Respects OS dark mode setting
   - Check your system theme

---

## 📱 Mobile Issues

### **Text too small on phone?**

**Solutions:**
1. **Use landscape mode** for shift entry
2. **Zoom in** - Pinch to zoom
3. **Portrait mode** works for most tasks
4. **Check phone's text size:**
   - Settings → Display → Font size
   - Increase if needed

---

### **Buttons hard to tap?**

**Solutions:**
1. **Shift entry optimized for mobile:**
   - Large touch targets
   - Designed for thumbs
2. **Other pages:**
   - Desktop-optimized
   - Use pinch-to-zoom
   - Landscape mode helps

---

### **Page won't scroll?**

**Solutions:**
1. **Close any open modals/dialogs**
2. **Refresh page**
3. **Check if input is focused:**
   - Tap somewhere else
   - Then try scrolling

---

## 🔐 Access Issues

### **Can't access system?**

**Solutions:**
1. **Check URL:**
   - Correct domain?
   - HTTPS or HTTP?
   - Port number if local
2. **Check internet:**
   - Wi-Fi connected?
   - Mobile data on?
   - Try different network
3. **Server down?:**
   - Contact system administrator
   - Check server status
   - Backend may need restart

---

## 📊 Reports Issues

### **Salary report shows wrong amount?**

**Symptoms:**
- Total doesn't match expected
- Missing shifts
- Incorrect rates

**Solutions:**
1. **Check date range:**
   - Start and end dates correct?
   - Includes all shifts?
2. **Verify design rates:**
   - Go to Master Data → Designs
   - Check rate per stitch
   - Update if wrong
3. **Check shift logs:**
   - All shifts logged?
   - No missing days?
   - No errors in logs?
4. **Recalculate:**
   - System calculates live
   - Refresh report
   - Should update automatically

---

### **Daily production report empty?**

**Symptoms:**
- Dashboard shows "No data"
- Empty tables

**Causes:**
- No shifts logged today
- Wrong date selected
- Date filter issue

**Solutions:**
1. **Verify date:**
   - Check date selector
   - Ensure today's date selected
2. **Check shifts:**
   - Were shifts logged today?
   - Go to Production → View shifts
3. **Refresh page:**
   - F5 to reload
   - Data may be loading

---

## 🔧 Technical Issues

### **"Network Error" in console?**

**Symptoms:**
```
API Error: Network Error
Failed to fetch
```

**Solutions:**
1. **Check backend is running:**
   ```bash
   cd backend
   npm start
   ```
2. **Check API URL:**
   - Frontend → `.env` file
   - Verify `VITE_API_URL` correct
3. **Check CORS:**
   - Backend allows frontend origin?
   - CORS headers configured?
4. **Check ports:**
   - Backend on correct port (3000)?
   - Frontend on correct port (5173)?

---

### **Database connection error?**

**Symptoms:**
```
Error: Connection refused
Database not available
```

**Solutions:**
1. **Check PostgreSQL running:**
   ```bash
   # Windows
   pg_ctl status
   
   # Linux/Mac
   sudo service postgresql status
   ```
2. **Check DATABASE_URL:**
   - Backend `.env` file
   - Correct format?
   - Credentials correct?
3. **Run migrations:**
   ```bash
   cd backend
   npm run migrate
   ```

---

## 💡 General Tips

### **When something breaks:**

1. **Refresh page first** (90% of issues)
2. **Check internet connection**
3. **Try different browser**
4. **Clear cache** (Ctrl+Shift+R)
5. **Check console** (F12) for errors
6. **Contact support** with error details

### **Before reporting an issue:**

📋 **Collect this information:**
- What were you trying to do?
- What happened instead?
- Any error messages?
- Browser and version?
- Screenshots if possible
- Steps to reproduce

### **Temporary workarounds:**

- **Progress not updating?** → Manual refresh
- **Button not working?** → Try keyboard (Enter)
- **Form not submitting?** → Try different browser
- **Page broken?** → Clear cache and retry

---

## 📞 Getting Help

### **Self-Service:**
1. Check this guide first
2. Try suggested solutions
3. Check other documentation

### **Team Support:**
1. Ask supervisor
2. Check with IT/technical staff
3. Review training materials

### **Technical Support:**
1. Gather error details
2. Try basic troubleshooting
3. Contact system administrator with:
   - Error messages
   - Screenshots
   - Steps to reproduce
   - Browser/device info

---

## 🔄 Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "Negative stitches" | Counter reading issue | Log rounds or check reading |
| "50-piece warning" | High output flag | Double-check, submit if correct |
| "Network Error" | Can't reach backend | Check internet, backend status |
| "Database connection failed" | DB not available | Check PostgreSQL running |
| "Pieces exceed available" | Assignment too large | Reduce pieces to assign |
| "Lot pieces mismatch" | Sub-lots don't sum correctly | Adjust sub-lot pieces |
| "No assignment found" | Operator has no work | Supervisor create assignment |

---

**Still having issues?** Contact your system administrator with error details.

**Last Updated:** August 17, 2026
