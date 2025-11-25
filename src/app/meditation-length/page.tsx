'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createUser, createPartnershipsForUser, getUserByInviteCode, getUserByEmail, updateReturnToken, PairingStatus } from '../../lib/supabase-database'; // Import createUser and createPartnershipsForUser from Supabase
import { supabase } from '../../lib/supabase';

export default function MeditationLengthPage() {
  const [selectedLength, setSelectedLength] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log('MeditationLengthPage: User reached this page');
    console.log(
      'MeditationLengthPage: pendingInviteCode:',
      localStorage.getItem('pendingInviteCode'),
    );
    console.log('MeditationLengthPage: userInviteCode:', localStorage.getItem('userInviteCode'));
  }, []);

  const meditationLengths = [
    { minutes: 1, label: '1 minute (testing)' },
    { minutes: 5, label: '5 minutes' },
    { minutes: 10, label: '10 minutes' },
    { minutes: 15, label: '15 minutes' },
    { minutes: 20, label: '20 minutes' },
    { minutes: 30, label: '30 minutes' },
    { minutes: 45, label: '45 minutes' },
    { minutes: 60, label: '60 minutes' },
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    console.log('=== COMPLETE SETUP BUTTON CLICKED ===');
    console.log('Complete Setup button clicked!');

    // Store selection in localStorage
    localStorage.setItem('usualSitLength', selectedLength.toString());
    console.log('Stored meditation length:', selectedLength);

    // Get all stored data
    const nickname = localStorage.getItem('userNickname');
    const email = localStorage.getItem('userEmail');
    const weeklyTarget = localStorage.getItem('userWeeklyTarget');
    const usualSitLength = localStorage.getItem('usualSitLength');
    const pendingInviteCode = localStorage.getItem('pendingInviteCode');

    console.log('Retrieved data:', { nickname, email, weeklyTarget, usualSitLength, pendingInviteCode });

    if (!nickname || !email || !weeklyTarget || !usualSitLength) {
      console.error('Missing required data:', { nickname, email, weeklyTarget, usualSitLength });
      alert('Missing required data. Please start over.');
      return;
    }

    try {
      // Create user in Supabase database
      let supabaseUserId = null;
      // Get the pending invite code (User1's invite code) - but don't use it for account creation
      // This will be preserved and used later for partnership creation
      const pendingInviteCodeLocal = localStorage.getItem('pendingInviteCode');
      
      // Check if user already exists (has supabaseUserId) - if yes, use their existing invite code
      // If no supabaseUserId exists, they're going through onboarding - always generate a new invite code
      const existingSupabaseUserId = localStorage.getItem('supabaseUserId');
      const userInviteCodeLocal = localStorage.getItem('userInviteCode');
      
      // During onboarding (no supabaseUserId), always generate a new invite code
      // For existing users (has supabaseUserId), use their existing invite code
      const finalUserInviteCode = existingSupabaseUserId && userInviteCodeLocal
        ? userInviteCodeLocal  // Existing user - use their invite code
        : `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; // New user - always generate new one
      
      try {
        console.log('=== USER CREATION: Invite code debugging ===', {
          pendingInviteCode: pendingInviteCodeLocal,
          userInviteCode: userInviteCodeLocal,
          finalUserInviteCode: finalUserInviteCode,
          allLocalStorage: Object.keys(localStorage),
        });

        // Determine pairing status:
        // - User2 (has pendingInviteCode) → 'paired' (will be paired immediately)
        // - User1 (no pendingInviteCode) → 'not_started' (will invite later)
        const pairingStatus: PairingStatus = pendingInviteCodeLocal ? 'paired' : 'not_started';
        
        // If User2, fetch User1's details in parallel with user creation
        let user1Data: any = null;
        if (pendingInviteCodeLocal) {
          console.log('Fetching User1 details by invite code (parallel with user creation)...');
          getUserByInviteCode(pendingInviteCodeLocal)
            .then(user1 => {
              if (user1) {
                user1Data = {
                  id: user1.id,
                  name: user1.name,
                  email: user1.email,
                  image: user1.image,
                  weeklytarget: user1.weeklytarget,
                };
                console.log('✅ User1 details fetched:', user1Data);
              } else {
                console.warn('⚠️ User1 not found by invite code:', pendingInviteCodeLocal);
              }
            })
            .catch(err => {
              console.error('Error fetching User1:', err);
            });
        }
        
        // Check if user with this email already exists
        const existingUser = await getUserByEmail(email);
        let returnToken: string | null = null;

        if (existingUser) {
          // User exists - link to existing user
          console.log('User with email already exists, linking to existing user:', existingUser.id);
          supabaseUserId = existingUser.id;
          
          // Rotate return token (generate new one, invalidates old)
          returnToken = await updateReturnToken(existingUser.id);
          if (!returnToken) {
            console.error('Failed to generate return token for existing user');
            // Continue anyway - user can still use the app
          } else {
            console.log('✅ Generated new return token for existing user');
          }
        } else {
          // New user - create with real email
          const userData = {
            name: nickname,
            email: email.toLowerCase().trim(), // Use real email from onboarding
            weeklytarget: parseInt(weeklyTarget),
            usualsitlength: selectedLength,
            image: '/icons/meditation-1.svg',
            invitecode: finalUserInviteCode,
            pairingstatus: pairingStatus,
          };

          console.log('Creating new user with data:', userData);
          console.log('About to call createUser with invite code:', userData.invitecode);
          supabaseUserId = await createUser(userData);
          console.log('User created in Supabase with ID:', supabaseUserId);
          console.log('User created with invite code:', userData.invitecode);
          
          // Generate return token for new user
          returnToken = await updateReturnToken(supabaseUserId);
          if (!returnToken) {
            console.error('Failed to generate return token for new user');
            // Continue anyway - user can still use the app
          } else {
            console.log('✅ Generated return token for new user');
          }
        }
        
        // Debug: Verify the user actually exists in the database
        console.log('=== VERIFYING USER CREATION ===');
        try {
          const { data: verifyUser, error: verifyError } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('id', supabaseUserId)
            .single();
          
          if (verifyError) {
            console.error('ERROR: User not found in database after creation:', verifyError);
          } else {
            console.log('SUCCESS: User verified in database:', verifyUser);
          }
        } catch (verifyErr) {
          console.error('ERROR: Failed to verify user in database:', verifyErr);
        }
        console.log('=== END VERIFICATION ===');

        // Store Supabase user ID in localStorage for session management
        localStorage.setItem('supabaseUserId', supabaseUserId);
        // Store the user's own invite code in localStorage
        localStorage.setItem('userInviteCode', finalUserInviteCode);
        console.log('Stored userInviteCode in localStorage:', finalUserInviteCode);
        localStorage.setItem('userId', supabaseUserId); // Keep for compatibility
        localStorage.setItem('userEmail', email); // Store email for future use
        
        // Send return link email via API route (non-blocking - don't wait for it)
        if (returnToken) {
          console.log('Sending return link email via API...');
          fetch('/api/send-return-link', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email,
              returnToken: returnToken,
              userName: nickname,
            }),
          })
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                console.log('✅ Return link email sent successfully');
              } else {
                console.warn('⚠️ Failed to send return link email:', data.error);
              }
            })
            .catch(error => {
              console.error('Error sending return link email (non-blocking):', error);
              // Don't block user from continuing
            });
        } else {
          console.warn('⚠️ No return token available, skipping email send');
        }
        
        // If User2 has a pendingInviteCode, prepare "pending partnership" data for immediate homepage display
        if (pendingInviteCodeLocal) {
          console.log('User2 detected with pendingInviteCode, preparing pending partnership data...');
          
          // Wait a bit for User1 fetch to complete (if it hasn't already)
          // Give it up to 500ms, but don't block if it takes longer
          let user1Final = user1Data;
          if (!user1Final) {
            // Try one more time to get User1 data
            try {
              user1Final = await Promise.race([
                getUserByInviteCode(pendingInviteCodeLocal),
                new Promise(resolve => setTimeout(() => resolve(null), 500))
              ]) as any;
            } catch (err) {
              console.warn('User1 fetch timed out or failed, will use placeholder:', err);
            }
          }
          
          // Calculate week end date (7 days from now)
          const now = new Date();
          const weekEnd = new Date(now);
          weekEnd.setDate(now.getDate() + 7);
          weekEnd.setHours(23, 59, 59, 999);
          
          // Create "pending partnership" data with all known information
          const pendingPartnership = {
            id: `pending-${Date.now()}`, // Temporary ID
            partnerid: user1Final?.id || 'unknown',
            partnerName: user1Final?.name || 'Your Partner',
            partnerEmail: user1Final?.email || '',
            partnerImage: user1Final?.image || '/icons/meditation-1.svg',
            partnerWeeklyTarget: user1Final?.weeklytarget || 5,
            userSits: 0, // New partnership
            partnerSits: 0, // New partnership
            weeklyGoal: parseInt(weeklyTarget) + (user1Final?.weeklytarget || 5),
            currentWeekStart: now.toISOString(),
            score: 0,
            isPending: true, // Flag to indicate this is temporary
            inviteCode: pendingInviteCodeLocal, // Store for background creation
            userId: supabaseUserId, // Store for background creation
          };
          
          // Store in sessionStorage for homepage to display immediately
          try {
            const pendingData = {
              partnerships: [pendingPartnership],
              userWeeklyTarget: parseInt(weeklyTarget),
              timestamp: Date.now(),
              isPending: true, // Flag to indicate background creation needed
            };
            sessionStorage.setItem('pendingPartnership', JSON.stringify(pendingData));
            console.log('✅ Stored pending partnership data in sessionStorage');
          } catch (cacheError) {
            console.warn('Failed to store pending partnership:', cacheError);
          }
          
          // Create partnership in background (don't block redirect)
          // This will update the homepage when it completes
          createPartnershipsForUser(supabaseUserId, pendingInviteCodeLocal)
            .then(partnerships => {
              if (partnerships.length > 0) {
                console.log('✅ Background partnership creation successful:', partnerships);
                // Clear pending partnership from sessionStorage
                sessionStorage.removeItem('pendingPartnership');
                // Clear pendingInviteCode
                localStorage.removeItem('pendingInviteCode');
                // Cache real partnership data (same as homepage does)
                const cachedData = {
                  partnerships: partnerships.map(p => ({
                    id: p.id,
                    partnerid: p.partnerid,
                    partnerName: 'Partner', // Will be fetched by homepage
                    partnerEmail: '',
                    partnerImage: '/icons/meditation-1.svg',
                    partnerWeeklyTarget: 5, // Will be fetched by homepage
                    userSits: p.usersits,
                    partnerSits: p.partnersits,
                    weeklyGoal: p.weeklygoal,
                    currentWeekStart: p.currentweekstart,
                    score: p.score,
                  })),
                  userWeeklyTarget: parseInt(weeklyTarget),
                  timestamp: Date.now(),
                };
                sessionStorage.setItem('cachedPartnerships', JSON.stringify(cachedData));
                console.log('✅ Updated sessionStorage with real partnership data');
              } else {
                console.warn('⚠️ Background partnership creation returned empty array');
                // Keep pending partnership, homepage fallback will handle it
              }
            })
            .catch(partnershipError => {
              console.error('❌ Background partnership creation failed:', partnershipError);
              // Keep pending partnership, homepage fallback will handle it
              // Don't show error to user - data is already correct
            });
        } else {
          console.log('No pendingInviteCode - User1 flow (no partnership creation needed)');
        }
      } catch (supabaseError: any) {
        console.log('Supabase error, attempting to find existing user:', supabaseError);
        console.error('Supabase error details:', supabaseError);
        
        // If user already exists (409 Conflict), try to find them by invite code
        if (supabaseError.code === '23505' || supabaseError.status === 409 || supabaseError.message?.includes('duplicate')) {
          console.log('User already exists, attempting to find by invite code:', finalUserInviteCode);
          try {
            const { data: existingUser, error: findError } = await supabase
              .from('users')
              .select('id')
              .eq('invitecode', finalUserInviteCode)
              .single();
            
            if (existingUser && !findError) {
              console.log('Found existing user by invite code:', existingUser.id);
              supabaseUserId = existingUser.id;
              localStorage.setItem('userId', supabaseUserId);
              localStorage.setItem('supabaseUserId', supabaseUserId);
            } else {
              // Try to find by email as fallback
              const userEmail = `user-${Date.now()}@example.com`;
              const { data: existingUserByEmail, error: findEmailError } = await supabase
                .from('users')
                .select('id')
                .eq('email', userEmail)
                .single();
              
              if (existingUserByEmail && !findEmailError) {
                console.log('Found existing user by email:', existingUserByEmail.id);
                supabaseUserId = existingUserByEmail.id;
                localStorage.setItem('userId', supabaseUserId);
                localStorage.setItem('supabaseUserId', supabaseUserId);
              } else {
                // Generate a proper UUID for fallback (won't work with Supabase but at least won't cause syntax errors)
                supabaseUserId = crypto.randomUUID();
                console.log('Generated fallback UUID:', supabaseUserId);
                localStorage.setItem('userId', supabaseUserId);
              }
            }
          } catch (findError) {
            console.error('Error finding existing user:', findError);
            // Generate a proper UUID for fallback
            supabaseUserId = crypto.randomUUID();
            console.log('Generated fallback UUID:', supabaseUserId);
            localStorage.setItem('userId', supabaseUserId);
          }
        } else {
          // For other errors, generate a proper UUID
          supabaseUserId = crypto.randomUUID();
          console.log('Generated fallback UUID for other error:', supabaseUserId);
          localStorage.setItem('userId', supabaseUserId);
        }
      }

      // Ensure supabaseUserId is set (should be set by now, but just in case)
      if (!supabaseUserId) {
        console.error('ERROR: supabaseUserId is null! This should not happen.');
        supabaseUserId = crypto.randomUUID();
        localStorage.setItem('userId', supabaseUserId);
      }

      // Always store in localStorage for compatibility
      const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
      // Use the finalUserInviteCode that was already determined above
      const newUser = {
        id: supabaseUserId,
        name: nickname,
        email: `user-${Date.now()}@example.com`,
        weeklytarget: parseInt(weeklyTarget),
        image: '/icons/meditation-1.svg',
        invitecode: finalUserInviteCode,
      };
      allUsers.push(newUser);
      localStorage.setItem('allUsers', JSON.stringify(allUsers));
      // Store the invite code in localStorage for partnership creation
      localStorage.setItem('userInviteCode', finalUserInviteCode);
      console.log('Stored userInviteCode in localStorage:', finalUserInviteCode);
      console.log('User added to localStorage:', newUser);

      // Redirect immediately - no setTimeout needed
      console.log('Redirecting to homepage...');
            router.push('/');
          } catch (error) {
            console.error('Onboarding error:', error);
            alert('Failed to create your account. Please try again.');
          } finally {
            setIsSubmitting(false);
          }
        };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Serenity+" width={24} height={24} className="w-6 h-6" />
          <span className="font-bold text-lg">Serenity+</span>
        </div>
      </div>

      <div className="px-6 py-8 flex-1 flex flex-col">
        <div className="flex-1 flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            How long do you want each meditation to be?
          </h1>
          <p className="text-sm text-gray-700 mb-8">
            This will be the time you are accountable to meditating in each sitting
          </p>

          <div className="flex-1">
            <select
              value={selectedLength}
              onChange={(e) => setSelectedLength(parseInt(e.target.value))}
              className="w-full p-4 pr-12 border border-gray-300 rounded-lg text-lg text-black focus:ring-2 focus:ring-black focus:border-transparent appearance-none bg-white"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 12px center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '16px',
              }}
            >
              {meditationLengths.map(({ minutes, label }) => (
                <option key={minutes} value={minutes} className="text-black">
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div 
          className="mt-6"
          style={{ 
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)',
            marginBottom: '1rem'
          }}
        >
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer relative"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Setting up...</span>
              </span>
            ) : (
              'Complete Setup'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
