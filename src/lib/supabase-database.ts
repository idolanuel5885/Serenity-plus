import { supabase } from './supabase';

export interface User {
  id: string;
  name: string;
  email: string;
  weeklytarget: number;
  usualsitlength: number;
  image: string;
  invitecode: string;
  createdat: string;
}

export interface Partnership {
  id: string;
  userid: string;
  partnerid: string;
  partnername: string;
  partneremail: string;
  partnerimage: string;
  partnerweeklytarget: number;
  usersits: number;
  partnersits: number;
  weeklygoal: number;
  score: number;
  currentweekstart: string;
  createdat: string;
}

export async function createUser(userData: Omit<User, 'id' | 'createdat'>): Promise<string> {
  try {
    const { data, error } = await supabase.from('users').insert([userData]).select().single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function getUser(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function createPartnership(
  partnershipData: Omit<Partnership, 'id' | 'createdat'>,
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('partnerships')
      .insert([partnershipData])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Error creating partnership:', error);
    throw error;
  }
}

export async function getUserPartnerships(userId: string): Promise<Partnership[]> {
  try {
    // Query partnerships where user is user1
    const { data: user1Partnerships, error: user1Error } = await supabase
      .from('partnerships')
      .select(`
        id,
        weeklygoal,
        score,
        currentweekstart,
        user1sits,
        user2sits,
        user1id,
        user2id,
        user2:user2id(name, email, image, weeklytarget)
      `)
      .eq('user1id', userId)
      .order('createdat', { ascending: false });

    if (user1Error) throw user1Error;

    // Query partnerships where user is user2
    const { data: user2Partnerships, error: user2Error } = await supabase
      .from('partnerships')
      .select(`
        id,
        weeklygoal,
        score,
        currentweekstart,
        user1sits,
        user2sits,
        user1id,
        user2id,
        user1:user1id(name, email, image, weeklytarget)
      `)
      .eq('user2id', userId)
      .order('createdat', { ascending: false });

    if (user2Error) throw user2Error;

    // Transform the data to match the Partnership interface
    const transformPartnership = (partnership: any, isUser1: boolean) => ({
      id: partnership.id,
      userid: userId,
      partnerid: isUser1 ? partnership.user2id : partnership.user1id,
      partnername: isUser1 ? partnership.user2.name : partnership.user1.name,
      partneremail: isUser1 ? partnership.user2.email : partnership.user1.email,
      partnerimage: isUser1 ? partnership.user2.image : partnership.user1.image,
      partnerweeklytarget: isUser1 ? partnership.user2.weeklytarget : partnership.user1.weeklytarget,
      usersits: isUser1 ? partnership.user1sits : partnership.user2sits,
      partnersits: isUser1 ? partnership.user2sits : partnership.user1sits,
      weeklygoal: partnership.weeklygoal,
      score: partnership.score,
      currentweekstart: partnership.currentweekstart,
      createdat: partnership.createdat
    });

    // Transform both results
    const transformedUser1 = (user1Partnerships || []).map(p => transformPartnership(p, true));
    const transformedUser2 = (user2Partnerships || []).map(p => transformPartnership(p, false));

    // Combine both results
    const allPartnerships = [...transformedUser1, ...transformedUser2];
    return allPartnerships;
  } catch (error) {
    console.error('Error fetching partnerships:', error);
    return [];
  }
}

export async function createPartnershipsForUser(
  userId: string,
  inviteCode?: string,
): Promise<Partnership[]> {
  try {
    console.log('createPartnershipsForUser called with:', { userId, inviteCode });

    // Find other users with matching invite codes
    const { data: otherUsers, error: usersError } = await supabase
      .from('users')
      .select('*')
      .neq('id', userId)
      .eq('invitecode', inviteCode || '');

    console.log('Found other users with matching invite code:', otherUsers);
    console.log('Number of other users found:', otherUsers?.length || 0);
    if (usersError) {
      console.error('Error finding other users:', usersError);
      throw usersError;
    }

    const partnerships: Partnership[] = [];

    for (const otherUser of otherUsers || []) {
      const partnershipData = {
        userid: userId,
        partnerid: otherUser.id,
        partnername: otherUser.name,
        partneremail: otherUser.email,
        partnerimage: otherUser.image,
        partnerweeklytarget: otherUser.weeklytarget,
        usersits: 0,
        partnersits: 0,
        weeklygoal: 5,
        score: 0,
        currentweekstart: new Date().toISOString(),
      };

      const partnershipId = await createPartnership(partnershipData);
      partnerships.push({
        id: partnershipId,
        ...partnershipData,
        createdat: new Date().toISOString(),
      });
    }

    return partnerships;
  } catch (error) {
    console.error('Error creating partnerships:', error);
    return [];
  }
}
