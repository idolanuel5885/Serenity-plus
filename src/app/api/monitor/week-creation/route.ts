import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendAlerts } from '@/lib/alerting';

/**
 * API endpoint to monitor week creation system health
 * Can be called by external monitoring services or used for alerts
 * 
 * Returns:
 * - Recent activity status
 * - Error count
 * - Partnerships needing weeks
 * - Overall health status
 */
export async function GET() {
  try {
    // Check recent activity (last 24 hours)
    const { data: recentActivity, error: activityError } = await supabase
      .from('week_creation_log')
      .select('status, createdat, errormessage')
      .gte('createdat', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (activityError) {
      console.error('Error fetching recent activity:', activityError);
    }

    const successful = recentActivity?.filter(r => r.status === 'success').length || 0;
    const errors = recentActivity?.filter(r => r.status === 'error').length || 0;
    const skipped = recentActivity?.filter(r => r.status === 'skipped').length || 0;
    const lastActivity = recentActivity && recentActivity.length > 0
      ? recentActivity.reduce((latest, current) => 
          new Date(current.createdat) > new Date(latest.createdat) ? current : latest
        ).createdat
      : null;

    // Check for partnerships needing weeks
    const { data: partnershipsNeedingWeeks, error: partnershipsError } = await supabase
      .rpc('get_partnerships_needing_weeks', {});

    // If RPC doesn't exist, use a query
    let needingWeeksCount = 0;
    if (partnershipsError) {
      // Fallback: query directly
      const { data: partnerships, error } = await supabase
        .from('partnerships')
        .select(`
          id,
          autocreateweeks,
          weekcreationpauseduntil,
          weeks!inner(weeknumber, weekend)
        `)
        .eq('autocreateweeks', true)
        .is('weekcreationpauseduntil', null);

      if (!error && partnerships) {
        // Filter in memory (simplified check)
        needingWeeksCount = partnerships.length;
      }
    } else {
      needingWeeksCount = partnershipsNeedingWeeks?.length || 0;
    }

    // Determine overall health status
    const hoursSinceLastActivity = lastActivity
      ? (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60)
      : Infinity;

    let healthStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (hoursSinceLastActivity > 6 || needingWeeksCount > 5) {
      healthStatus = 'critical';
    } else if (hoursSinceLastActivity > 2 || needingWeeksCount > 0 || errors > 0) {
      healthStatus = 'warning';
    }

    // Send alerts if status is warning or critical (non-blocking)
    if (healthStatus !== 'healthy') {
      const errorMessages = errors > 0 
        ? recentActivity?.filter(r => r.status === 'error').map(r => r.errormessage || 'Unknown error').slice(0, 5) || []
        : [];

      const alertOptions: {
        status: 'warning' | 'critical';
        message: string;
        metrics: Record<string, any>;
        errors?: string[];
      } = {
        status: healthStatus,
        message: healthStatus === 'critical' 
          ? 'Week creation system is in critical state. Immediate attention required.'
          : 'Week creation system has warnings that need attention.',
        metrics: {
          hours_since_last_activity: hoursSinceLastActivity < Infinity ? hoursSinceLastActivity : null,
          partnerships_needing_weeks: needingWeeksCount,
          errors_24h: errors,
          successful_24h: successful,
        },
      };

      // Only include errors if there are any
      if (errorMessages.length > 0) {
        alertOptions.errors = errorMessages;
      }

      sendAlerts(alertOptions).catch(err => {
        console.error('Failed to send alerts:', err);
        // Don't block the response if alerting fails
      });
    }

    return NextResponse.json({
      status: healthStatus,
      timestamp: new Date().toISOString(),
      metrics: {
        recent_activity_24h: {
          successful,
          errors,
          skipped,
          total: recentActivity?.length || 0,
          last_activity: lastActivity,
          hours_since_last_activity: hoursSinceLastActivity < Infinity ? hoursSinceLastActivity : null,
        },
        partnerships_needing_weeks: needingWeeksCount,
      },
      alerts: {
        no_recent_activity: hoursSinceLastActivity > 6,
        has_errors: errors > 0,
        partnerships_needing_weeks: needingWeeksCount > 0,
      },
    });
  } catch (error: any) {
    console.error('Error in week creation monitoring:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

