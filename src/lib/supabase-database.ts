// ... existing code ...

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

// ... existing code ...
