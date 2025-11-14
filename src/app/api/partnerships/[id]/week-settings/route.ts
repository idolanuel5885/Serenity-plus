import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';

/**
 * GET /api/partnerships/[id]/week-settings
 * Get auto-creation settings for a partnership
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const partnershipId = params.id;

    const { data: partnership, error } = await supabase
      .from('partnerships')
      .select('id, autocreateweeks, weekcreationpauseduntil')
      .eq('id', partnershipId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching partnership week settings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch week settings', details: error.message },
        { status: 500 }
      );
    }

    if (!partnership) {
      return NextResponse.json(
        { error: 'Partnership not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      autocreateweeks: partnership.autocreateweeks ?? true,
      weekcreationpauseduntil: partnership.weekcreationpauseduntil,
    });
  } catch (error: any) {
    console.error('Error in GET week-settings:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/partnerships/[id]/week-settings
 * Update auto-creation settings for a partnership
 * Body: { autocreateweeks?: boolean, weekcreationpauseduntil?: string | null }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const partnershipId = params.id;
    const body = await request.json();
    const { autocreateweeks, weekcreationpauseduntil } = body;

    // Build update object
    const updateData: any = {};
    
    if (autocreateweeks !== undefined) {
      updateData.autocreateweeks = autocreateweeks;
    }
    
    if (weekcreationpauseduntil !== undefined) {
      // If null or empty string, set to NULL
      updateData.weekcreationpauseduntil = 
        weekcreationpauseduntil === null || weekcreationpauseduntil === '' 
          ? null 
          : weekcreationpauseduntil;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const { data: partnership, error } = await supabase
      .from('partnerships')
      .update(updateData)
      .eq('id', partnershipId)
      .select('id, autocreateweeks, weekcreationpauseduntil')
      .maybeSingle();

    if (error) {
      console.error('Error updating partnership week settings:', error);
      return NextResponse.json(
        { error: 'Failed to update week settings', details: error.message },
        { status: 500 }
      );
    }

    if (!partnership) {
      return NextResponse.json(
        { error: 'Partnership not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        autocreateweeks: partnership.autocreateweeks,
        weekcreationpauseduntil: partnership.weekcreationpauseduntil,
      },
    });
  } catch (error: any) {
    console.error('Error in POST week-settings:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

