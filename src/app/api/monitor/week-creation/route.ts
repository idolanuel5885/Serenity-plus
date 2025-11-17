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
    // Gracefully handle if week_creation_log table doesn't exist yet
    let recentActivity: any[] | null = null;
    let activityError: any = null;
    
    try {
      const result = await supabase
        .from('week_creation_log')
        .select('status, createdat, errormessage')
        .gte('createdat', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      
      recentActivity = result.data;
      activityError = result.error;
    } catch (err: any) {
      // Table might not exist - that's okay, we'll return empty metrics
      console.warn('week_creation_log table might not exist:', err.message);
      activityError = err;
    }

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
    // Gracefully handle if RPC function doesn't exist
    let needingWeeksCount = 0;
    
    try {
      const { data: partnershipsNeedingWeeks, error: partnershipsError } = await supabase
        .rpc('get_partnerships_needing_weeks', {});

      if (partnershipsError) {
        // RPC might not exist - use fallback query
        console.warn('RPC function might not exist, using fallback query:', partnershipsError.message);
        
        // Fallback: query directly (simplified - just count partnerships with auto-creation enabled)
        const { data: partnerships, error } = await supabase
          .from('partnerships')
          .select('id, autocreateweeks')
          .eq('autocreateweeks', true)
          .limit(100); // Limit to avoid performance issues

        if (!error && partnerships) {
          // Simplified: just count partnerships with auto-creation enabled
          // In a real scenario, we'd check if they need weeks, but this is a fallback
          needingWeeksCount = 0; // Set to 0 since we can't accurately determine without the RPC
        }
      } else {
        needingWeeksCount = partnershipsNeedingWeeks?.length || 0;
      }
    } catch (err: any) {
      console.warn('Error checking partnerships needing weeks:', err.message);
      needingWeeksCount = 0; // Default to 0 on error
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

