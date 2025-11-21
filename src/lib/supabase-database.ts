import { supabase } from './supabase';

export type PairingStatus = 'not_started' | 'awaiting_partner' | 'paired';

export interface User {
  id: string;
  name: string;
  email: string;
  weeklytarget: number;
  usualsitlength: number;
  image: string;
  invitecode: string;
  pairingstatus: PairingStatus;
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
  inviteesits: number; // The user who used the invite code (was user1sits)
  invitersits: number; // The user who created account and shared invite code (was user2sits)
  weeklygoal: number;
  goalmet: boolean;
  createdat: string;
}

export async function createUser(userData: Omit<User, 'id' | 'createdat'>): Promise<string> {
  try {
    // Map camelCase to snake_case for database columns
    // pairingstatus -> pairing_status (only field with underscore)
    const dbUserData: any = {
      ...userData,
      pairing_status: userData.pairingstatus,
    };
    delete dbUserData.pairingstatus; // Remove camelCase version

    const { data, error } = await supabase.from('users').insert([dbUserData]).select().single();

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

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    if (!data) return null;

    // Map snake_case database column to camelCase TypeScript interface
    // pairing_status -> pairingstatus
    return {
      ...data,
      pairingstatus: (data as any).pairing_status || 'not_started',
    } as User;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Update a user's pairing status
 * @param userId - The user ID to update
 * @param status - The new pairing status
 * @returns true if successful, false otherwise
 */
export async function updateUserPairingStatus(
  userId: string,
  status: PairingStatus,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ pairing_status: status })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user pairing status:', error);
      return false;
    }

    console.log(`Updated user ${userId} pairing status to: ${status}`);
    return true;
  } catch (error) {
    console.error('Error updating user pairing status:', error);
    return false;
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
    let currentWeek = await getCurrentWeek(partnershipId);
    
    if (!currentWeek) {
      // Check if automatic week creation is enabled for this partnership
      const { data: partnership, error: partnershipError } = await supabase
        .from('partnerships')
        .select('autocreateweeks, weekcreationpauseduntil')
        .eq('id', partnershipId)
        .maybeSingle();

      if (partnershipError) {
        console.error('Error checking partnership auto-creation settings:', partnershipError);
        // If we can't check, default to creating on-demand (backward compatible)
        currentWeek = await createNewWeek(partnershipId, weeklyGoal);
        return currentWeek;
      }

      const isAutoCreationEnabled = partnership?.autocreateweeks ?? true; // Default to true if null
      const isPaused = partnership?.weekcreationpauseduntil 
        ? new Date(partnership.weekcreationpauseduntil) > new Date()
        : false;

      if (isAutoCreationEnabled && !isPaused) {
        // Automatic week creation is enabled, but no week exists yet
        // This could happen if:
        // 1. Cron job hasn't run yet (should create it)
        // 2. User is starting a session before cron job creates the week
        // 3. Previous week just ended and cron job hasn't run yet
        // 
        // We'll create it on-demand as a fallback, but log it for monitoring
        console.warn('⚠️ Automatic week creation is enabled but no week exists - creating on-demand as fallback');
        console.warn('This should normally be handled by the scheduled job. Check cron job status if this happens frequently.');
        currentWeek = await createNewWeek(partnershipId, weeklyGoal);
      } else {
        // Automatic week creation is disabled or paused - create on-demand (backward compatible)
        console.log('Automatic week creation is disabled or paused, creating week on-demand');
      currentWeek = await createNewWeek(partnershipId, weeklyGoal);
      }
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
          // Note: isUser1 means current user is the one who called the API (invitee)
          // So if isUser1, they are the invitee, partner is the inviter
          usersits: isUser1 ? currentWeek.inviteesits : currentWeek.invitersits,
          partnersits: isUser1 ? currentWeek.invitersits : currentWeek.inviteesits,
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
    // Use the database function for reliable current week retrieval
    // This handles edge cases like between weeks or before first week
    const { data, error } = await supabase.rpc('get_current_week_for_partnership', {
      p_partnership_id: partnershipId
    });

    if (error) {
      // Fallback to manual query if RPC fails
      console.warn('RPC get_current_week_for_partnership failed, using fallback:', error);
      return await getCurrentWeekFallback(partnershipId);
    }

    if (data && data.length > 0) {
      return data[0] as Week;
    }

    return null;
  } catch (error) {
    console.error('Error fetching current week:', error);
    return null;
  }
}

// Fallback method if RPC is not available
async function getCurrentWeekFallback(partnershipId: string): Promise<Week | null> {
  try {
    const now = new Date().toISOString();

    // First, try to find a week that contains the current time
    const { data: currentWeek, error: currentError } = await supabase
      .from('weeks')
      .select('*')
      .eq('partnershipid', partnershipId)
      .lte('weekstart', now)
      .gte('weekend', now)
      .order('weeknumber', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (currentWeek) {
      return currentWeek;
    }

    // If no current week, return the most recent week
    const { data: latestWeek, error: latestError } = await supabase
      .from('weeks')
      .select('*')
      .eq('partnershipid', partnershipId)
      .order('weeknumber', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestError && latestError.code !== 'PGRST116') throw latestError;
    return latestWeek;
  } catch (error) {
    console.error('Error in getCurrentWeekFallback:', error);
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
      inviteesits: 0, // The user who used the invite code
      invitersits: 0, // The user who created account and shared invite code
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
    // isUser1 means current user is the one who called the API (invitee)
    // So if isUser1, update inviteesits, otherwise update invitersits
    const updateData = isUser1 
      ? { inviteesits: newSitCount }
      : { invitersits: newSitCount };

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
      
        // Update both users' pairing status to 'paired'
        // userId is the invitee (User2), otherUser.id is the inviter (User1)
        console.log('Updating pairing status for both users to "paired"...');
        await updateUserPairingStatus(userId, 'paired');
        await updateUserPairingStatus(otherUser.id, 'paired');
        console.log('✅ Both users updated to "paired" status');
      
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
          // Note: userId is the invitee (the one calling the API), otherUser is the inviter
          weeklygoal: week1?.weeklygoal || combinedWeeklyGoal,
          usersits: week1?.inviteesits || 0, // userId is the invitee
          partnersits: week1?.invitersits || 0, // otherUser is the inviter
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
              usersits: existingWeek?.inviteesits || 0, // userId is the invitee
              partnersits: existingWeek?.invitersits || 0, // otherUser is the inviter
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

/**
 * Find a user by their invite code
 * Used to fetch User1's details before creating partnership
 */
export async function getUserByInviteCode(inviteCode: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('invitecode', inviteCode)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user by invite code:', error);
      return null;
    }

    if (!data) return null;

    // Map snake_case to camelCase
    return {
      ...data,
      pairingstatus: (data as any).pairing_status || 'not_started',
    } as User;
  } catch (error) {
    console.error('Error fetching user by invite code:', error);
    return null;
  }
}

/**
 * Find a user by their email address
 * Used for email-based identity recovery
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }

    if (!data) return null;

    // Map snake_case to camelCase
    return {
      ...data,
      pairingstatus: (data as any).pairing_status || 'not_started',
    } as User;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

/**
 * Generate a secure random token for email-based account recovery
 * Returns a 32-character alphanumeric token
 */
export function generateReturnToken(): string {
  // Use crypto.randomBytes for secure random generation (Node.js)
  // Fallback to crypto.getRandomValues for browser environments
  if (typeof window === 'undefined') {
    // Node.js environment
    try {
      const crypto = require('crypto');
      return crypto.randomBytes(24).toString('base64url'); // 32 characters, URL-safe
    } catch (e) {
      // Fallback if crypto is not available
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
      let token = '';
      for (let i = 0; i < 32; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return token;
    }
  } else {
    // Browser environment - use crypto.getRandomValues
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint8Array(24);
      crypto.getRandomValues(array);
      // Convert to base64url (URL-safe base64) manually
      // Base64url encoding: replace + with -, / with _, and remove padding
      const base64 = btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      return base64;
    } else {
      // Fallback to Math.random (less secure, but acceptable for pilot)
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
      let token = '';
      for (let i = 0; i < 32; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return token;
    }
  }
}

/**
 * Update a user's return token (rotates the old token)
 * This invalidates the old token and generates a new one
 */
export async function updateReturnToken(userId: string): Promise<string | null> {
  try {
    const newToken = generateReturnToken();
    
    const { error } = await supabase
      .from('users')
      .update({ return_token: newToken })
      .eq('id', userId);

    if (error) {
      console.error('Error updating return token:', error);
      return null;
    }

    console.log(`Updated return token for user ${userId}`);
    return newToken;
  } catch (error) {
    console.error('Error updating return token:', error);
    return null;
  }
}

/**
 * Find a user by their return token
 * Used to restore user identity via magic link
 */
export async function getUserByReturnToken(token: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('return_token', token)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user by return token:', error);
      return null;
    }

    if (!data) return null;

    // Map snake_case to camelCase
    return {
      ...data,
      pairingstatus: (data as any).pairing_status || 'not_started',
    } as User;
  } catch (error) {
    console.error('Error fetching user by return token:', error);
    return null;
  }
}
