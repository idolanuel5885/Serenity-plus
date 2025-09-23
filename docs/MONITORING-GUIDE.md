# Serenity Plus Monitoring Guide

## 🚨 Quick Fix Commands

If you ever encounter issues, use these commands in order:

### 1. Quick Status Check
```bash
npm run status
```

### 2. Fix Server Issues
```bash
npm run fix-server
```

### 3. Full Health Check
```bash
npm run health-check
```

### 4. Auto-Recovery
```bash
npm run auto-recovery
```

## 📊 Monitoring Commands

### Real-time Monitoring
```bash
npm run monitor
```
- Shows live server status
- Displays response times
- Monitors memory usage
- Checks critical pages

### Health Check
```bash
npm run health-check
```
- Tests all critical pages
- Verifies QR code generation
- Checks logo visibility
- Validates PWA files
- Reports disk space

### Auto-Recovery
```bash
npm run auto-recovery
```
- Automatically fixes common issues
- Restarts server if needed
- Restores missing files from git
- Auto-commits changes

## 🛠️ Server Management

### Start Server Safely
```bash
npm run start
```
- Cleans cache before starting
- Ensures server is healthy
- Handles build issues automatically

### Fix Server Issues
```bash
npm run fix-server
```
- Cleans corrupted build cache
- Restarts server properly
- Verifies server is working

## 📁 Log Files

All monitoring logs are stored in:
```
/home/idolanuel/logs/serenity-plus/
```

### View Logs
```bash
# Health check logs
tail -f /home/idolanuel/logs/serenity-plus/health.log

# Recovery logs
tail -f /home/idolanuel/logs/serenity-plus/recovery.log

# Backup logs
tail -f /home/idolanuel/logs/serenity-plus/backup.log
```

## 🔧 Troubleshooting

### Server Returns 500 Error
1. Run `npm run fix-server`
2. If still failing, run `npm run auto-recovery`
3. Check logs for specific errors

### Pages Not Loading
1. Run `npm run health-check`
2. Check which specific pages are failing
3. Run `npm run auto-recovery` to restore files

### QR Code Not Generating
1. Check if `/invite` page loads
2. Verify `qrcode` package is installed
3. Run `npm run health-check` to verify

### Logo Not Showing
1. Check if `public/logo.svg` exists
2. Run `npm run health-check`
3. Clear browser cache

## 🚀 Automated Monitoring

### Start Background Monitoring
```bash
./scripts/start-monitoring.sh
```
- Runs health checks every 5 minutes
- Auto-recovers if server goes down
- Logs all activities

### Stop Monitoring
```bash
pkill -f "start-monitoring"
```

## 📱 Mobile Testing

### Test on Mobile
1. Get your IP: `hostname -I`
2. Use: `http://YOUR_IP:3000`
3. Test PWA installation
4. Test QR code scanning

### PWA Installation
1. Open on mobile browser
2. Look for "Add to Home Screen"
3. Install as app
4. Test offline functionality

## 🎯 Success Indicators

### Server is Healthy When:
- ✅ `npm run status` returns HTTP 200
- ✅ All critical pages load (/, /welcome, /invite)
- ✅ QR code generates on /invite page
- ✅ Logo is visible on all pages
- ✅ PWA files exist (manifest.json, sw.js)

### Monitoring is Working When:
- ✅ Health checks run automatically
- ✅ Logs are being written
- ✅ Auto-recovery triggers when needed
- ✅ Server stays online consistently

## 🆘 Emergency Procedures

### If Everything is Broken:
1. Run `npm run auto-recovery`
2. If that fails, run `npm run fix-server`
3. If still failing, check git status: `git status`
4. Restore from backup: `npm run recover`
5. If all else fails, restore from git: `git reset --hard HEAD`

### If Files are Missing:
1. Check git status: `git status`
2. Restore missing files: `git checkout HEAD -- <filename>`
3. Run `npm run auto-recovery`
4. Commit changes: `npm run auto-commit`

## 📞 Support Commands

### Get System Status
```bash
# Server status
npm run status

# Full health check
npm run health-check

# Git status
npm run safety-check

# Disk space
df -h .
```

### Fix Common Issues
```bash
# Server issues
npm run fix-server

# Auto-recovery
npm run auto-recovery

# Clean and restart
rm -rf .next && npm run dev
```

Remember: You should never have to discover issues first! The monitoring system will catch and fix problems automatically.
