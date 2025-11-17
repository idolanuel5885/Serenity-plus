# Alerting Setup for Week Creation Monitoring

This guide explains how to set up automated alerts so you're notified when the week creation system fails.

## Quick Setup Options

### Option 1: External Monitoring Service (Easiest - Recommended)

**UptimeRobot** (Free - 50 monitors):
1. Sign up at https://uptimerobot.com
2. Add Monitor:
   - Type: HTTP(s)
   - URL: `https://serenity-plus-kohl.vercel.app/api/monitor/week-creation`
   - Interval: 60 minutes
   - Expected Status Code: 200
3. Set Alert Conditions:
   - Alert when status code is NOT 200
   - OR alert when response body contains `"status": "critical"`
   - OR alert when response body contains `"status": "warning"`
4. Configure Notifications:
   - Add your email
   - Add SMS (optional)
   - Add Slack webhook (optional)

**Better Uptime** (Free tier):
1. Sign up at https://betteruptime.com
2. Create Monitor with same URL
3. Set up alert conditions and notifications

### Option 2: Built-in Alerting (Requires Setup)

The monitoring endpoint has built-in alerting support. Configure one or more of these:

#### A. Email Alerts (via Resend)

1. **Sign up for Resend**: https://resend.com (free tier available)
2. **Get API Key**: Go to API Keys → Create API Key
3. **Add to Vercel Environment Variables**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add:
     - `RESEND_API_KEY` = your Resend API key
     - `ALERT_EMAIL` = your email address
4. **Redeploy**: Vercel will automatically use the new env vars

#### B. Slack Alerts

1. **Create Slack Webhook**:
   - Go to https://api.slack.com/apps
   - Create new app → Incoming Webhooks → Activate
   - Add to workspace → Copy webhook URL
2. **Add to Vercel Environment Variables**:
   - `SLACK_WEBHOOK_URL` = your Slack webhook URL
3. **Redeploy**

#### C. Generic Webhook

1. **Set up your webhook endpoint** (e.g., Zapier, Make.com, custom service)
2. **Add to Vercel Environment Variables**:
   - `WEBHOOK_URL` = your webhook URL
3. **Redeploy**

### Option 3: GitHub Actions (Free for public repos)

Create `.github/workflows/week-creation-alerts.yml`:

```yaml
name: Week Creation Alerts

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  check-and-alert:
    runs-on: ubuntu-latest
    steps:
      - name: Check Week Creation Health
        id: check
        run: |
          response=$(curl -s https://serenity-plus-kohl.vercel.app/api/monitor/week-creation)
          status=$(echo $response | jq -r '.status')
          echo "status=$status" >> $GITHUB_OUTPUT
          echo "$response" | jq .
          
      - name: Send Alert on Critical
        if: steps.check.outputs.status == 'critical'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🚨 Week Creation System Critical',
              body: 'The week creation system is in critical state. Check the monitoring endpoint for details.'
            })
```

## What Gets Alerted?

Alerts are sent when:
- **Critical**: 
  - No activity for >6 hours
  - More than 5 partnerships need new weeks
- **Warning**:
  - No activity for 2-6 hours
  - Any partnerships need new weeks
  - Any errors in the last 24 hours

## Alert Message Format

### Email Alerts:
- Subject: `🚨 Week Creation System: CRITICAL` or `⚠️ Week Creation System: WARNING`
- Body includes:
  - Status
  - Message
  - Metrics (hours since last activity, partnerships needing weeks, errors)
  - Error details (if any)

### Slack Alerts:
- Color-coded message (red for critical, orange for warning)
- Includes all metrics and error details
- Timestamp

### Webhook Alerts:
- JSON payload with all details
- Can be integrated with any service

## Testing Alerts

1. **Test Email**: Temporarily set a critical condition in the code
2. **Test Slack**: Send a test message to your webhook
3. **Test Webhook**: Use a service like webhook.site to see the payload

## Recommended Setup

**Best Practice**: Use **both**:
1. **External service** (UptimeRobot) for redundancy and simple setup
2. **Built-in alerts** (Email/Slack) for detailed notifications

This gives you:
- ✅ Multiple alert channels (redundancy)
- ✅ Detailed error information
- ✅ No single point of failure

## Troubleshooting

### Alerts not sending?
1. Check environment variables are set in Vercel
2. Check Vercel function logs for errors
3. Verify API keys/webhooks are correct
4. Test manually by calling the endpoint

### Too many alerts?
- Adjust thresholds in `src/app/api/monitor/week-creation/route.ts`
- Add rate limiting to prevent duplicate alerts
- Use external service with alert throttling

