import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();

    // Create user in Supabase
    const supabase = getSupabase();
    const { data, error } = await supabase.from('users').insert([userData]).select().single();

    if (error) throw error;

    console.log('User created in Supabase:', data);

    return NextResponse.json({ success: true, user: data });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

      if (error) throw error;
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
