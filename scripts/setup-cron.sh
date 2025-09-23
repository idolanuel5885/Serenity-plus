#!/bin/bash

# Setup automatic daily backups
echo "Setting up daily backups..."

# Create backup directory
mkdir -p /home/idolanuel/backups/serenity-plus

# Add cron job for daily backup at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * cd /home/idolanuel/serenity-plus && ./scripts/backup.sh") | crontab -

# Add cron job for auto-commit every 4 hours
(crontab -l 2>/dev/null; echo "0 */4 * * * cd /home/idolanuel/serenity-plus && git add . && git commit -m 'Auto-commit: \$(date)' || true") | crontab -

echo "✅ Daily backups scheduled at 2 AM"
echo "✅ Auto-commits scheduled every 4 hours"
echo ""
echo "To view scheduled jobs: crontab -l"
echo "To remove scheduled jobs: crontab -r"
