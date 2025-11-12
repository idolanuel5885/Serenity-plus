import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Check if we're in build mode (no environment variables)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Supabase client not configured' }, { status: 500 });
    }

    const userData = await request.json();
    console.log('Creating user with data:', JSON.stringify(userData, null, 2));

    // Create user in Supabase
    const { data, error } = await supabase.from('users').insert([userData]).select().single();

    if (error) {
      console.error('Supabase error creating user:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      // Return the actual error for debugging
      return NextResponse.json({ 
        error: 'Failed to create user', 
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 });
    }

    console.log('User created in Supabase:', data);

    return NextResponse.json({ success: true, user: data });
  } catch (error: any) {
    console.error('Error creating user:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to create user', 
      details: error?.message || 'Unknown error',
      stack: error?.stack
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const inviteCode = searchParams.get('inviteCode');

    if (userId) {
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

      if (error) throw error;
      return NextResponse.json({ success: true, user: data });
    }

    if (inviteCode) {
      // Get the first user with this invite code (since invite codes may not be unique in production)
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, image, invitecode')
        .eq('invitecode', inviteCode)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, user: data });
    }

    const { data, error } = await supabase.from('users').select('*');

    if (error) throw error;
    return NextResponse.json({ success: true, users: data });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
