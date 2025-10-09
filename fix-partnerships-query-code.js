// Fix for the partnerships query issue
// The problem is the malformed or() clause in createPartnershipsForUser function

// Replace this line:
// .or(`and(userid.eq.${userId},partnerid.eq.${otherUser.id}),and(userid.eq.${otherUser.id},partnerid.eq.${userId})`)

// With this simpler approach:
// Check if partnership exists in either direction
const { data: existingPartnership1, error: checkError1 } = await supabase
  .from('partnerships')
  .select('*')
  .eq('userid', userId)
  .eq('partnerid', otherUser.id)
  .eq('isactive', true)
  .maybeSingle();

const { data: existingPartnership2, error: checkError2 } = await supabase
  .from('partnerships')
  .select('*')
  .eq('userid', otherUser.id)
  .eq('partnerid', userId)
  .eq('isactive', true)
  .maybeSingle();

const existingPartnership = existingPartnership1 || existingPartnership2;

