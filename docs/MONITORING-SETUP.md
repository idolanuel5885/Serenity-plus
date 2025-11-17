# Week Creation Monitoring Setup Guide

This guide explains how to set up automated monitoring for the week creation system.

## Option 1: Vercel Cron (Recommended)

Vercel Cron is the easiest option since you're already using Vercel for deployment.

### Setup Steps:

1. **Create `vercel.json`** (already created in project root):
   ```json
   {
     "crons": [
       {
         "path": "/api/monitor/week-creation",
         "schedule": "0 * * * *"
       }
     ]
   }
   ```

2. **Deploy to Vercel**:
   - Push the changes to your repository
   - Vercel will automatically detect the `vercel.json` file
   - The cron job will be scheduled automatically

3. **Verify it's working**:
   - Go to Vercel Dashboard → Your Project → Settings → Cron Jobs
   - You should see "Week Creation Monitor" scheduled to run every hour
   - Check the logs to see if it's running successfully

### Schedule Options:

- Every hour: `"0 * * * *"` (current)
- Every 6 hours: `"0 */6 * * *"`
- Every 12 hours: `"0 */12 * * *"`
- Daily at midnight: `"0 0 * * *"`

### Viewing Results:

The monitoring endpoint returns JSON with health status. You can:
- Check Vercel function logs to see the responses
- Set up alerts based on the response (see "Setting Up Alerts" below)

---

## Option 2: External Monitoring Services

If you prefer external monitoring or want more alerting features, use one of these services:

### A. UptimeRobot (Free - 50 monitors)

1. **Sign up**: Go to https://uptimerobot.com (free account)
2. **Add Monitor**:
   - Monitor Type: HTTP(s)
   - Friendly Name: "Week Creation Monitor"
   - URL: `https://your-domain.vercel.app/api/monitor/week-creation`
   - Monitoring Interval: 60 minutes (or 30 minutes for paid)
3. **Set up Alerts**:
   - Add email/SMS/Slack notifications
   - Configure alert conditions (e.g., if status is "critical")

### B. Better Uptime (Free tier available)

1. **Sign up**: Go to https://betteruptime.com
2. **Create Monitor**:
   - URL: `https://your-domain.vercel.app/api/monitor/week-creation`
   - Check Interval: 60 minutes
   - Expected Status Code: 200
3. **Configure Alerts**:
   - Set up email/SMS/Slack/PagerDuty alerts
   - Configure when to alert (e.g., if response contains `"status": "critical"`)

### C. Cronitor (Free tier available)

1. **Sign up**: Go to https://cronitor.io
2. **Create Monitor**:
   - Type: HTTP
   - URL: `https://your-domain.vercel.app/api/monitor/week-creation`
   - Schedule: Every hour
3. **Set up Alerts**:
   - Configure notification channels
   - Set alert conditions

### D. GitHub Actions (Free for public repos)

Create `.github/workflows/week-creation-monitor.yml`:

```yaml
name: Week Creation Monitor

on:
  schedule:
    - cron: '0 * * * *'  # Every hour
  workflow_dispatch:  # Allow manual trigger

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - name: Check Week Creation Health
        run: |
          response=$(curl -s https://your-domain.vercel.app/api/monitor/week-creation)
          status=$(echo $response | jq -r '.status')
          
          if [ "$status" = "critical" ]; then
            echo "❌ Week creation system is critical!"
            exit 1
          elif [ "$status" = "warning" ]; then
            echo "⚠️ Week creation system has warnings"
          else
            echo "✅ Week creation system is healthy"
          fi
```

---

## Setting Up Alerts

### For Vercel Cron:

Since Vercel Cron doesn't have built-in alerting, you can:

1. **Use Vercel's webhook integration** (if available)
2. **Add alerting to the API endpoint**:
   - Send emails via SendGrid/Resend when status is critical
   - Send Slack notifications
   - Call a webhook service

### For External Services:

Most external services have built-in alerting:
- Email notifications
- SMS alerts
- Slack/Discord webhooks
- PagerDuty integration
- Custom webhooks

---

## What the Monitoring Endpoint Returns

The `/api/monitor/week-creation` endpoint returns:

```json
{
  "status": "healthy" | "warning" | "critical",
  "timestamp": "2024-01-15T10:30:00Z",
  "metrics": {
    "recent_activity_24h": {
      "successful": 5,
      "errors": 0,
      "skipped": 2,
      "total": 7,
      "last_activity": "2024-01-15T09:45:00Z",
      "hours_since_last_activity": 0.75
    },
    "partnerships_needing_weeks": 0
  },
  "alerts": {
    "no_recent_activity": false,
    "has_errors": false,
    "partnerships_needing_weeks": false
  }
}
```

### Status Meanings:

- **healthy**: Everything is working normally
- **warning**: Some issues detected but not critical (e.g., 2-6 hours since last activity)
- **critical**: Serious issues (e.g., >6 hours since last activity, errors detected, partnerships needing weeks)

---

## Manual Monitoring

You can also manually check the system:

1. **Run the SQL query**: Execute `monitor-week-creation.sql` in Supabase SQL Editor
2. **Check the API**: Visit `https://your-domain.vercel.app/api/monitor/week-creation` in your browser
3. **Check logs**: Query `week_creation_log` table in Supabase

---

## Troubleshooting

### Vercel Cron not running?

1. Check Vercel Dashboard → Settings → Cron Jobs
2. Verify `vercel.json` is in the root directory
3. Ensure the API route exists at `/api/monitor/week-creation`
4. Check Vercel function logs for errors

### External service not working?

1. Verify the URL is correct and accessible
2. Check if your Vercel deployment is public
3. Ensure the API endpoint returns valid JSON
4. Check service-specific logs/dashboards

---

## Recommended Setup

For best results, use **both**:
1. **Vercel Cron** for automated monitoring (runs every hour)
2. **External service** (UptimeRobot/Better Uptime) for alerting and redundancy

This gives you:
- Automated health checks (Vercel Cron)
- Alert notifications (External service)
- Redundancy (if one fails, the other still works)

