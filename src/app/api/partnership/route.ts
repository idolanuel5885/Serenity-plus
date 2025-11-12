import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, partnerId } = await request.json();

    if (!userId || !partnerId) {
      return NextResponse.json({ error: 'Missing userId or partnerId' }, { status: 400 });
    }

    // Check if partnership already exists
    const { data: existingPartnership } = await supabase
      .from('partnerships')
      .select('id')
      .eq('userid', userId)  // Note: column name is lowercase in database
      .eq('partnerid', partnerId)  // Note: column name is lowercase in database
      .single();

    if (existingPartnership) {
      return NextResponse.json({
        success: true,
        message: 'Partnership already exists',
        partnershipId: existingPartnership.id,
      });
    }

    // Create partnership
    // Note: Partnerships table now only stores: id, userid, partnerid, createdat, score
    // Week-specific data goes in weeks table, partner data comes from users table
    const partnershipData = {
      userid: userId,  // Note: column name is lowercase in database
      partnerid: partnerId,  // Note: column name is lowercase in database
      score: 0,
    };

    const { data, error: createError } = await supabase
      .from('partnerships')
      .insert([partnershipData])
      .select()
      .single();

    if (createError) throw createError;

    return NextResponse.json({
      success: true,
      partnershipId: data.id,
    });
  } catch (error) {
    console.error('Error creating partnership:', error);
    return NextResponse.json({ error: 'Failed to create partnership' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Get all partnerships for this user
    const { data: partnerships, error: fetchError } = await supabase
      .from('partnerships')
      .select('*')
      .eq('userid', userId);  // Note: column name is lowercase in database

    if (fetchError) throw fetchError;

    return NextResponse.json({
      success: true,
      partnerships: partnerships || [],
    });
  } catch (error) {
    console.error('Error fetching partnerships:', error);
    return NextResponse.json({ error: 'Failed to fetch partnerships' }, { status: 500 });
  }
}
