#!/bin/bash

# Setup automated monitoring for Serenity Plus
echo "🔧 Setting up automated monitoring..."

# Create monitoring directory
mkdir -p /home/idolanuel/logs/serenity-plus

# Add cron job for health checks every 5 minutes
(crontab -l 2>/dev/null; echo "*/5 * * * * cd /home/idolanuel/serenity-plus && ./scripts/health-check.sh >> /home/idolanuel/logs/serenity-plus/health.log 2>&1") | crontab -

# Add cron job for auto-recovery if server is down
(crontab -l 2>/dev/null; echo "*/2 * * * * cd /home/idolanuel/serenity-plus && curl -s -f http://localhost:3000 > /dev/null || ./scripts/auto-recovery.sh >> /home/idolanuel/logs/serenity-plus/recovery.log 2>&1") | crontab -

# Add cron job for daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * cd /home/idolanuel/serenity-plus && ./scripts/backup.sh >> /home/idolanuel/logs/serenity-plus/backup.log 2>&1") | crontab -

# Add cron job for auto-commits every 4 hours
(crontab -l 2>/dev/null; echo "0 */4 * * * cd /home/idolanuel/serenity-plus && git add . && git commit -m 'Auto-commit: \$(date)' >> /home/idolanuel/logs/serenity-plus/commit.log 2>&1 || true") | crontab -

echo "✅ Automated monitoring setup complete!"
echo ""
echo "📊 Monitoring Schedule:"
echo "  - Health checks: Every 5 minutes"
echo "  - Auto-recovery: Every 2 minutes (if server down)"
echo "  - Daily backups: 2:00 AM"
echo "  - Auto-commits: Every 4 hours"
echo ""
echo "📁 Logs location: /home/idolanuel/logs/serenity-plus/"
echo ""
echo "🔍 To view logs:"
echo "  tail -f /home/idolanuel/logs/serenity-plus/health.log"
echo "  tail -f /home/idolanuel/logs/serenity-plus/recovery.log"
echo ""
echo "🛑 To remove monitoring:"
echo "  crontab -r"


