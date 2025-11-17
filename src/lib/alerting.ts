/**
 * Alerting utilities for week creation monitoring
 * Supports multiple notification channels: email, Slack, webhooks
 */

interface AlertOptions {
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  metrics?: Record<string, any>;
  errors?: string[];
}

/**
 * Send alert via email (using Resend or similar service)
 * Requires RESEND_API_KEY environment variable
 */
export async function sendEmailAlert(options: AlertOptions): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const alertEmail = process.env.ALERT_EMAIL;

  if (!resendApiKey || !alertEmail) {
    console.warn('Email alerting not configured: RESEND_API_KEY or ALERT_EMAIL not set');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Serenity+ Alerts <alerts@serenity-plus.app>',
        to: [alertEmail],
        subject: `🚨 Week Creation System: ${options.status.toUpperCase()}`,
        html: `
          <h2>Week Creation System Alert</h2>
          <p><strong>Status:</strong> ${options.status.toUpperCase()}</p>
          <p><strong>Message:</strong> ${options.message}</p>
          ${options.metrics ? `
            <h3>Metrics:</h3>
            <pre>${JSON.stringify(options.metrics, null, 2)}</pre>
          ` : ''}
          ${options.errors && options.errors.length > 0 ? `
            <h3>Errors:</h3>
            <ul>
              ${options.errors.map(e => `<li>${e}</li>`).join('')}
            </ul>
          ` : ''}
          <p><small>Timestamp: ${new Date().toISOString()}</small></p>
        `,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send email alert:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email alert:', error);
    return false;
  }
}

/**
 * Send alert via Slack webhook
 * Requires SLACK_WEBHOOK_URL environment variable
 */
export async function sendSlackAlert(options: AlertOptions): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('Slack alerting not configured: SLACK_WEBHOOK_URL not set');
    return false;
  }

  try {
    const color = options.status === 'critical' ? '#ff0000' : options.status === 'warning' ? '#ffaa00' : '#00ff00';
    const emoji = options.status === 'critical' ? '🚨' : options.status === 'warning' ? '⚠️' : '✅';

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: `${emoji} Week Creation System: ${options.status.toUpperCase()}`,
        attachments: [
          {
            color,
            fields: [
              {
                title: 'Status',
                value: options.status.toUpperCase(),
                short: true,
              },
              {
                title: 'Message',
                value: options.message,
                short: false,
              },
              ...(options.metrics ? Object.entries(options.metrics).map(([key, value]) => ({
                title: key,
                value: String(value),
                short: true,
              })) : []),
            ],
            ...(options.errors && options.errors.length > 0 ? {
              fields: [
                ...(options.errors.map((error, i) => ({
                  title: `Error ${i + 1}`,
                  value: error,
                  short: false,
                }))),
              ],
            } : {}),
            footer: 'Serenity+ Monitoring',
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Failed to send Slack alert:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Slack alert:', error);
    return false;
  }
}

/**
 * Send alert via generic webhook
 * Requires WEBHOOK_URL environment variable
 */
export async function sendWebhookAlert(options: AlertOptions): Promise<boolean> {
  const webhookUrl = process.env.WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('Webhook alerting not configured: WEBHOOK_URL not set');
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service: 'serenity-plus',
        type: 'week-creation-monitor',
        status: options.status,
        message: options.message,
        metrics: options.metrics,
        errors: options.errors,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.error('Failed to send webhook alert:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending webhook alert:', error);
    return false;
  }
}

/**
 * Send alerts through all configured channels
 */
export async function sendAlerts(options: AlertOptions): Promise<void> {
  // Only send alerts for warning or critical status
  if (options.status === 'healthy') {
    return;
  }

  const promises = [
    sendEmailAlert(options),
    sendSlackAlert(options),
    sendWebhookAlert(options),
  ];

  await Promise.allSettled(promises);
}

