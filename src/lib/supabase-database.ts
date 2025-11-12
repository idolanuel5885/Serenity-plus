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
  score: number;
  createdat: string;
  // Week-specific fields (from weeks table, not partnerships table)
  weeklygoal: number;
  usersits: number;
  partnersits: number;
  currentweekstart: string;
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

// Partnership database record (only fields that exist in partnerships table)
export interface PartnershipDB {
  userid: string;
  partnerid: string;
  score: number;
}

export async function createPartnership(
  partnershipData: PartnershipDB,
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('partnerships')
      .insert([partnershipData])
      .select()
      .single();

    if (error) {
      // Handle 409 conflict (partnership already exists) as success
      if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
        console.log('Partnership already exists, fetching existing partnership');
        // Fetch the existing partnership
        const { data: existing, error: fetchError } = await supabase
          .from('partnerships')
          .select('id')
          .eq('userid', partnershipData.userid)
          .eq('partnerid', partnershipData.partnerid)
          .single();
        
        if (fetchError || !existing) {
          // Also check reverse direction
          const { data: existingReverse } = await supabase
            .from('partnerships')
            .select('id')
            .eq('userid', partnershipData.partnerid)
            .eq('partnerid', partnershipData.userid)
            .single();
          
          if (existingReverse) {
            return existingReverse.id;
          }
          throw error; // If we can't find it, throw original error
        }
        
        return existing.id;
      }
      throw error;
    }
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

    console.log('Fetching current week for partnership:', partnershipId);
    console.log('Date range:', { startOfWeek: startOfWeek.toISOString(), endOfWeek: endOfWeek.toISOString() });

    const { data, error } = await supabase
      .from('weeks')
      .select('*')
      .eq('partnershipid', partnershipId)
      .gte('weekstart', startOfWeek.toISOString())
      .lte('weekstart', endOfWeek.toISOString())
      .order('weeknumber', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching current week:', error);
      if (error.code === 'PGRST116') {
        // No rows found - this is expected if no week exists yet
        return null;
      }
      throw error; // Re-throw other errors
    }
    
    console.log('Current week found:', data);
    return data;
  } catch (error) {
    console.error('Error fetching current week:', error);
    return null;
  }
}

export async function getUserPartnerships(userId: string): Promise<Partnership[]> {
  try {
    console.log('getUserPartnerships called with userId:', userId);
    
    // Query partnerships where user is user1
    // Note: weeklygoal, usersits, partnersits, currentweekstart are now in weeks table, not partnerships
    const { data: user1Partnerships, error: user1Error } = await supabase
      .from('partnerships')
      .select(`
        id,
        score,
        userid,
        partnerid,
        createdat,
        user2:users!partnerid(name, email, image, weeklytarget)
      `)
      .eq('userid', userId)
      .order('createdat', { ascending: false });

    if (user1Error) {
      console.error('Error fetching user1 partnerships:', user1Error);
      throw user1Error;
    }

    // Query partnerships where user is user2
    // Note: weeklygoal, usersits, partnersits, currentweekstart are now in weeks table, not partnerships
    const { data: user2Partnerships, error: user2Error } = await supabase
      .from('partnerships')
      .select(`
        id,
        score,
        userid,
        partnerid,
        createdat,
        user1:users!userid(name, email, image, weeklytarget)
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
        // Get current week data for this partnership - this is now the ONLY source for week-specific data
        const currentWeek = await getCurrentWeekForPartnership(partnership.id);
        
        if (!currentWeek) {
          console.warn('No current week found for partnership:', partnership.id);
          // Return with default values if no week exists yet
          return {
            id: partnership.id,
            userid: userId,
            partnerid: isUser1 ? partnership.partnerid : partnership.userid,
            score: partnership.score,
            createdat: partnership.createdat,
            // Default values when no week exists
            weeklygoal: 0,
            usersits: 0,
            partnersits: 0,
            currentweekstart: new Date().toISOString(),
          };
        }
        
        return {
          id: partnership.id,
          userid: userId,
          partnerid: isUser1 ? partnership.partnerid : partnership.userid,
          score: partnership.score,
          createdat: partnership.createdat,
          // All week-specific data comes from weeks table
          usersits: isUser1 ? currentWeek.user1sits : currentWeek.user2sits,
          partnersits: isUser1 ? currentWeek.user2sits : currentWeek.user1sits,
          weeklygoal: currentWeek.weeklygoal,
          currentweekstart: currentWeek.weekstart,
        };
      } catch (weekError) {
        console.error('Error fetching week for partnership:', partnership.id, weekError);
        // Return with default values if week fetch fails
        return {
          id: partnership.id,
          userid: userId,
          partnerid: isUser1 ? partnership.partnerid : partnership.userid,
          score: partnership.score,
          createdat: partnership.createdat,
          // Default values when week fetch fails
          weeklygoal: 0,
          usersits: 0,
          partnersits: 0,
          currentweekstart: new Date().toISOString(),
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
    // Use exact creation time instead of Sunday
    const startOfWeek = new Date(now);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7); // End of current week
    endOfWeek.setHours(23, 59, 59, 999);

    console.log('Week dates:', { startOfWeek: startOfWeek.toISOString(), endOfWeek: endOfWeek.toISOString() });

    // Get the next week number - always start with 1 for new partnerships
    const { data: lastWeek, error: lastWeekError } = await supabase
      .from('weeks')
      .select('weeknumber')
      .eq('partnershipid', partnershipId)
      .order('weeknumber', { ascending: false })
      .limit(1)
      .maybeSingle(); // Use maybeSingle() to avoid error when no weeks exist

    // Always start with week 1 for new partnerships
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
      // Use separate queries instead of complex or() clause to avoid 400 errors
      const { data: existingPartnership1, error: _checkError1 } = await supabase
        .from('partnerships')
        .select('*')
        .eq('userid', userId)
        .eq('partnerid', otherUser.id)
        .maybeSingle();

      const { data: existingPartnership2, error: _checkError2 } = await supabase
        .from('partnerships')
        .select('*')
        .eq('userid', otherUser.id)
        .eq('partnerid', userId)
        .maybeSingle();

      const existingPartnership = existingPartnership1 || existingPartnership2;

      if (existingPartnership) {
        console.log('Partnership already exists between users, skipping');
        continue;
      }

      // Calculate combined weekly goal from both users' targets
      const currentUser = await getUser(userId);
      const combinedWeeklyGoal = (currentUser?.weeklytarget || 0) + otherUser.weeklytarget;
      
      // Partnership table now only stores: id, userid, partnerid, createdat, score
      // Week-specific data (weeklygoal, usersits, partnersits, currentweekstart) goes in weeks table
      const partnershipData = {
        userid: userId,
        partnerid: otherUser.id,
        score: 0,
      };

      try {
        const partnershipId = await createPartnership(partnershipData);
        
        // Check if week already exists before creating
        const existingWeek = await getCurrentWeekForPartnership(partnershipId);
        let week1 = existingWeek;
        
        if (!week1) {
          // Create Week 1 immediately for this new partnership
          console.log('Creating Week 1 for partnership:', partnershipId, 'with goal:', combinedWeeklyGoal);
          week1 = await createNewWeek(partnershipId, combinedWeeklyGoal);
          if (week1) {
            console.log('Created Week 1 for new partnership:', week1);
          } else {
            console.error('Failed to create Week 1 for partnership:', partnershipId);
          }
        } else {
          console.log('Week already exists for partnership:', partnershipId);
        }
        
        partnerships.push({
          id: partnershipId,
          userid: userId,
          partnerid: otherUser.id,
          score: 0,
          createdat: new Date().toISOString(),
          // Week-specific data from the created week (or defaults if week creation failed)
          weeklygoal: week1?.weeklygoal || combinedWeeklyGoal,
          usersits: week1?.user1sits || 0,
          partnersits: week1?.user2sits || 0,
          currentweekstart: week1?.weekstart || new Date().toISOString(),
        });
      } catch (partnershipError: any) {
        // If partnership creation fails, check if it's because it already exists
        if (partnershipError?.code === '23505' || partnershipError?.message?.includes('duplicate') || partnershipError?.message?.includes('unique')) {
          console.log('Partnership already exists between users, fetching existing partnership');
          // Fetch existing partnership and continue
          const { data: existingPartnership } = await supabase
            .from('partnerships')
            .select('id')
            .eq('userid', userId)
            .eq('partnerid', otherUser.id)
            .maybeSingle();
          
          const existingId = existingPartnership?.id || (await supabase
            .from('partnerships')
            .select('id')
            .eq('userid', otherUser.id)
            .eq('partnerid', userId)
            .maybeSingle()).data?.id;
          
          if (existingId) {
            // Get week data for existing partnership
            const existingWeek = await getCurrentWeekForPartnership(existingId);
            partnerships.push({
              id: existingId,
              userid: userId,
              partnerid: otherUser.id,
              score: 0,
              createdat: new Date().toISOString(),
              weeklygoal: existingWeek?.weeklygoal || combinedWeeklyGoal,
              usersits: existingWeek?.user1sits || 0,
              partnersits: existingWeek?.user2sits || 0,
              currentweekstart: existingWeek?.weekstart || new Date().toISOString(),
            });
          }
        } else {
          // Re-throw if it's a different error
          console.error('Error creating partnership:', partnershipError);
          throw partnershipError;
        }
      }
    }

    return partnerships;
  } catch (error) {
    console.error('Error creating partnerships:', error);
    return [];
  }
}

// Get partner details for a partnership
export async function getPartnerDetails(partnerId: string) {
  try {
    const { data: partner, error } = await supabase
      .from('users')
      .select('id, name, email, image, weeklytarget')
      .eq('id', partnerId)
      .single();

    if (error) {
      console.error('Error fetching partner details:', error);
      return null;
    }

    return partner;
  } catch (error) {
    console.error('Error fetching partner details:', error);
    return null;
  }
}
