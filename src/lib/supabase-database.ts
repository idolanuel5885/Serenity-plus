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

export interface Week {
  id: string;
  partnershipid: string;
  weeknumber: number;
  weekstart: string;
  weekend: string;
  user1sits: number;
  user2sits: number;
  weeklygoal: number;
  goalmet: boolean;
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

export async function ensureCurrentWeekExists(partnershipId: string, weeklyGoal: number): Promise<Week | null> {
  try {
    // First check if current week exists
    let currentWeek = await getCurrentWeekForPartnership(partnershipId);
    
    if (!currentWeek) {
      // Create new week if it doesn't exist
      currentWeek = await createNewWeek(partnershipId, weeklyGoal);
    }
    
    return currentWeek;
  } catch (error) {
    console.error('Error ensuring current week exists:', error);
    return null;
  }
}

export async function getCurrentWeekForPartnership(partnershipId: string): Promise<Week | null> {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7); // End of current week
    endOfWeek.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('weeks')
      .select('*')
      .eq('partnershipid', partnershipId)
      .gte('weekstart', startOfWeek.toISOString())
      .lte('weekstart', endOfWeek.toISOString())
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
    return data;
  } catch (error) {
    console.error('Error fetching current week:', error);
    return null;
  }
}

export async function getUserPartnerships(userId: string): Promise<Partnership[]> {
  try {
    console.log('getUserPartnerships called with userId:', userId);
    
    // Query partnerships where user is user1 (using correct column names: userid, partnerid, usersits, partnersits)
    const { data: user1Partnerships, error: user1Error } = await supabase
      .from('partnerships')
      .select(`
        id,
        weeklygoal,
        score,
        currentweekstart,
        usersits,
        partnersits,
        userid,
        partnerid,
        user2:partnerid(name, email, image, weeklytarget)
      `)
      .eq('userid', userId)
      .order('createdat', { ascending: false });

    if (user1Error) {
      console.error('Error fetching user1 partnerships:', user1Error);
      throw user1Error;
    }

    // Query partnerships where user is user2 (using correct column names: userid, partnerid, usersits, partnersits)
    const { data: user2Partnerships, error: user2Error } = await supabase
      .from('partnerships')
      .select(`
        id,
        weeklygoal,
        score,
        currentweekstart,
        usersits,
        partnersits,
        userid,
        partnerid,
        user1:userid(name, email, image, weeklytarget)
      `)
      .eq('partnerid', userId)
      .order('createdat', { ascending: false });

    if (user2Error) {
      console.error('Error fetching user2 partnerships:', user2Error);
      throw user2Error;
    }

    // Transform the data to match the Partnership interface
    const transformPartnership = async (partnership: any, isUser1: boolean) => {
      try {
        // Get current week data for this partnership (with error handling)
        const currentWeek = await getCurrentWeekForPartnership(partnership.id);
        
        return {
          id: partnership.id,
          userid: userId,
          partnerid: isUser1 ? partnership.partnerid : partnership.userid,
          partnername: isUser1 ? partnership.user2.name : partnership.user1.name,
          partneremail: isUser1 ? partnership.user2.email : partnership.user1.email,
          partnerimage: isUser1 ? partnership.user2.image : partnership.user1.image,
          partnerweeklytarget: isUser1 ? partnership.user2.weeklytarget : partnership.user1.weeklytarget,
          usersits: currentWeek ? (isUser1 ? currentWeek.user1sits : currentWeek.user2sits) : (isUser1 ? partnership.usersits : partnership.partnersits),
          partnersits: currentWeek ? (isUser1 ? currentWeek.user2sits : currentWeek.user1sits) : (isUser1 ? partnership.partnersits : partnership.usersits),
          weeklygoal: currentWeek ? currentWeek.weeklygoal : partnership.weeklygoal,
          score: partnership.score,
          currentweekstart: currentWeek ? currentWeek.weekstart : partnership.currentweekstart,
          createdat: partnership.createdat
        };
      } catch (weekError) {
        console.error('Error fetching week for partnership:', partnership.id, weekError);
        // Fallback to partnership data if week fetch fails
        return {
          id: partnership.id,
          userid: userId,
          partnerid: isUser1 ? partnership.partnerid : partnership.userid,
          partnername: isUser1 ? partnership.user2.name : partnership.user1.name,
          partneremail: isUser1 ? partnership.user2.email : partnership.user1.email,
          partnerimage: isUser1 ? partnership.user2.image : partnership.user1.image,
          partnerweeklytarget: isUser1 ? partnership.user2.weeklytarget : partnership.user1.weeklytarget,
          usersits: isUser1 ? partnership.usersits : partnership.partnersits,
          partnersits: isUser1 ? partnership.partnersits : partnership.usersits,
          weeklygoal: partnership.weeklygoal,
          score: partnership.score,
          currentweekstart: partnership.currentweekstart,
          createdat: partnership.createdat
        };
      }
    };

    // Transform both results
    const transformedUser1 = await Promise.all((user1Partnerships || []).map(p => transformPartnership(p, true)));
    const transformedUser2 = await Promise.all((user2Partnerships || []).map(p => transformPartnership(p, false)));

    // Combine both results
    const allPartnerships = [...transformedUser1, ...transformedUser2];
    return allPartnerships;
  } catch (error) {
    console.error('Error fetching partnerships:', error);
    return [];
  }
}

// Week management functions
export async function getCurrentWeek(partnershipId: string): Promise<Week | null> {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7); // End of current week
    endOfWeek.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('weeks')
      .select('*')
      .eq('partnershipid', partnershipId)
      .gte('weekstart', startOfWeek.toISOString())
      .lte('weekstart', endOfWeek.toISOString())
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
    return data;
  } catch (error) {
    console.error('Error fetching current week:', error);
    return null;
  }
}

export async function createNewWeek(partnershipId: string, weeklyGoal: number): Promise<Week | null> {
  try {
    console.log('createNewWeek called with:', { partnershipId, weeklyGoal });
    
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7); // End of current week
    endOfWeek.setHours(23, 59, 59, 999);

    console.log('Week dates:', { startOfWeek: startOfWeek.toISOString(), endOfWeek: endOfWeek.toISOString() });

    // Get the next week number
    const { data: lastWeek, error: lastWeekError } = await supabase
      .from('weeks')
      .select('weeknumber')
      .eq('partnershipid', partnershipId)
      .order('weeknumber', { ascending: false })
      .limit(1)
      .maybeSingle(); // Use maybeSingle() to avoid error when no weeks exist

    const weekNumber = lastWeekError || !lastWeek ? 1 : (lastWeek.weeknumber || 0) + 1;
    console.log('Week number:', weekNumber);

    const weekData = {
      partnershipid: partnershipId,
      weeknumber: weekNumber,
      weekstart: startOfWeek.toISOString(),
      weekend: endOfWeek.toISOString(),
      weeklygoal: weeklyGoal,
      user1sits: 0,
      user2sits: 0,
      goalmet: false
    };

    console.log('Inserting week data:', weekData);

    const { data, error } = await supabase
      .from('weeks')
      .insert(weekData)
      .select()
      .single();

    if (error) {
      console.error('Error inserting week:', error);
      throw error;
    }
    
    console.log('Successfully created week:', data);
    return data;
  } catch (error) {
    console.error('Error creating new week:', error);
    return null;
  }
}

export async function updateWeekSits(
  weekId: string, 
  isUser1: boolean, 
  newSitCount: number
): Promise<Week | null> {
  try {
    const updateData = isUser1 
      ? { user1sits: newSitCount }
      : { user2sits: newSitCount };

    const { data, error } = await supabase
      .from('weeks')
      .update(updateData)
      .eq('id', weekId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating week sits:', error);
    return null;
  }
}

export async function getWeekHistory(partnershipId: string): Promise<Week[]> {
  try {
    const { data, error } = await supabase
      .from('weeks')
      .select('*')
      .eq('partnershipid', partnershipId)
      .order('weeknumber', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching week history:', error);
    return [];
  }
}

export async function createPartnershipsForUser(
  userId: string,
  inviteCode?: string,
): Promise<Partnership[]> {
  try {
    console.log('createPartnershipsForUser called with:', { userId, inviteCode });

    // Check if partnerships already exist for this user
    const existingPartnerships = await getUserPartnerships(userId);
    if (existingPartnerships.length > 0) {
      console.log('Partnerships already exist for user, returning existing ones');
      return existingPartnerships;
    }

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
      // Check if partnership already exists between these users
      const { data: existingPartnership, error: checkError } = await supabase
        .from('partnerships')
        .select('*')
        .or(`and(userid.eq.${userId},partnerid.eq.${otherUser.id}),and(userid.eq.${otherUser.id},partnerid.eq.${userId})`)
        .eq('isactive', true)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid error when no partnership exists

      if (existingPartnership) {
        console.log('Partnership already exists between users, skipping');
        continue;
      }

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
      
      // Create Week 1 immediately for this new partnership
      console.log('Creating Week 1 for partnership:', partnershipId, 'with goal:', partnershipData.weeklygoal);
      const week1 = await createNewWeek(partnershipId, partnershipData.weeklygoal);
      if (week1) {
        console.log('Created Week 1 for new partnership:', week1);
      } else {
        console.error('Failed to create Week 1 for partnership:', partnershipId);
      }
      
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
