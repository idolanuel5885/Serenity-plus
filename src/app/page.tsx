'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getUserPartnerships, createPartnershipsForUser, getUser, getPartnerDetails, updateUserPairingStatus, PairingStatus } from '../lib/supabase-database';
import { shareInvite } from '../lib/invite-sharing';
import FallbackShareModal from '../components/FallbackShareModal';

interface Partnership {
  id: string;
  partner: {
    id: string;
    name: string;
    email: string;
    image?: string;
    weeklyTarget: number;
  };
  userSits: number;
  partnerSits: number;
  weeklyGoal: number;
  score: number;
  currentWeekStart: string;
}

export default function Home() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnershipsLoaded, setPartnershipsLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userWeeklyTarget, setUserWeeklyTarget] = useState<number>(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareModalLink, setShareModalLink] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [pairingStatus, setPairingStatus] = useState<PairingStatus | null>(null);
  const router = useRouter();

  const isFetchingRef = useRef(false);

  const fetchPartnerships = useCallback(async (userId: string) => {
    try {
      console.log('Fetching partnerships for userId:', userId);

      // Prevent duplicate calls if already loading
      if (isFetchingRef.current) {
        console.log('Already fetching partnerships, skipping duplicate call');
        return;
      }

      isFetchingRef.current = true;

      // Try Supabase first, fallback to localStorage if Supabase not configured
      try {
        // Get user's weekly target and pairing status
        const user = await getUser(userId);
        if (user) {
          setUserWeeklyTarget(user.weeklytarget);
          setPairingStatus(user.pairingstatus);
        }
        
        // Get existing partnerships from database
        const existingPartnerships = await getUserPartnerships(userId);
        console.log('Existing partnerships:', existingPartnerships);

        if (existingPartnerships.length > 0) {
          // Convert database partnerships to UI format
          const partnerships = await Promise.all(existingPartnerships.map(async (partnership) => {
            const partnerDetails = await getPartnerDetails(partnership.partnerid);
            return {
              id: partnership.id,
              partner: {
                id: partnership.partnerid,
                name: partnerDetails?.name || 'Unknown Partner',
                email: partnerDetails?.email || '',
                image: partnerDetails?.image || '/icons/meditation-1.svg',
                weeklyTarget: partnerDetails?.weeklytarget || 0,
              },
              userSits: partnership.usersits,
              partnerSits: partnership.partnersits,
              userWeeklyTarget: userWeeklyTarget, // Use the user's target from users table
              weeklyGoal: userWeeklyTarget + (partnerDetails?.weeklytarget || 0), // Calculate from both users' targets
              score: partnership.score,
              currentWeekStart: partnership.currentweekstart,
            };
          }));

          console.log('Found existing partnerships:', partnerships);
          // Prevent duplicate partnerships by checking if they already exist
          setPartnerships(prevPartnerships => {
            const existingIds = prevPartnerships.map(p => p.id);
            const newPartnerships = partnerships.filter(p => !existingIds.includes(p.id));
            return [...prevPartnerships, ...newPartnerships];
          });
        } else {
          // No existing partnerships, try to create new ones (fallback for edge cases)
          // Note: For User2, partnership should already be created during onboarding
          // This is a fallback in case partnership creation failed during onboarding
          console.log('No existing partnerships, attempting fallback partnership creation...');
          const pendingInviteCode = localStorage.getItem('pendingInviteCode');
          const userInviteCode = localStorage.getItem('userInviteCode');
          const inviteCode = pendingInviteCode || userInviteCode;
          
          if (inviteCode) {
            console.log('Using invite code for fallback partnership creation:', inviteCode);
            console.log('All localStorage keys:', Object.keys(localStorage));
            console.log('pendingInviteCode:', pendingInviteCode);
            console.log('userInviteCode:', userInviteCode);
            console.log('=== CALLING createPartnershipsForUser (FALLBACK) ===', { userId, inviteCode });
            const newPartnerships = await createPartnershipsForUser(userId, inviteCode || undefined);
            
            if (newPartnerships.length > 0) {
              // Clear pendingInviteCode since partnership is now created
              localStorage.removeItem('pendingInviteCode');
              
              // Process the partnerships that were created
              const partnerships = await Promise.all(newPartnerships.map(async (partnership) => {
                const partnerDetails = await getPartnerDetails(partnership.partnerid);
                return {
                  id: partnership.id,
                  partner: {
                    id: partnership.partnerid,
                    name: partnerDetails?.name || 'Unknown Partner',
                    email: partnerDetails?.email || '',
                    image: partnerDetails?.image || '/icons/meditation-1.svg',
                    weeklyTarget: partnerDetails?.weeklytarget || 0,
                  },
                  userSits: partnership.usersits,
                  partnerSits: partnership.partnersits,
                  userWeeklyTarget: userWeeklyTarget, // Use the user's target from users table
                  weeklyGoal: userWeeklyTarget + (partnerDetails?.weeklytarget || 0), // Calculate from both users' targets
                  score: partnership.score,
                  currentWeekStart: partnership.currentweekstart,
                };
              }));

              console.log('Created new partnerships (fallback):', partnerships);
              console.log('Partnership sit counts:', partnerships.map(p => ({
                id: p.id,
                userSits: p.userSits,
                partnerSits: p.partnerSits,
                partnerName: p.partner.name
              })));
              // Prevent duplicate partnerships by checking if they already exist
              setPartnerships(prevPartnerships => {
                const existingIds = prevPartnerships.map(p => p.id);
                const newPartnerships = partnerships.filter(p => !existingIds.includes(p.id));
                return [...prevPartnerships, ...newPartnerships];
              });
            } else {
              console.log('No partnerships created in fallback - showing empty partnerships');
              setPartnerships([]);
            }
          } else {
            console.log('No invite code available for partnership creation');
            setPartnerships([]);
          }
        }
      } catch {
        console.log('Supabase not configured, falling back to localStorage');

        // Fallback to localStorage approach
        const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
        console.log('All users in localStorage:', allUsers);

        if (allUsers.length > 1) {
          const otherUsers = allUsers.filter((user: { id: string }) => user.id !== userId);
          console.log('Other users found:', otherUsers);

          if (otherUsers.length > 0) {
            const partnerships = otherUsers.map(
              (user: {
                id: string;
                name: string;
                email: string;
                image?: string;
                weeklyTarget: number;
              }) => ({
                id: `partnership-${userId}-${user.id}`,
                partner: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  image: user.image || '/icons/meditation-1.svg',
                  weeklyTarget: user.weeklyTarget || 5,
                },
                userSits: 0,
                partnerSits: 0,
                weeklyGoal: user.weeklyTarget || 5,
                score: 0,
                currentWeekStart: new Date().toISOString(),
              }),
            );

            console.log('Creating partnerships with other users:', partnerships);
            setPartnerships(partnerships);
          } else {
            console.log('No other users found, showing empty partnerships');
            setPartnerships([]);
          }
        } else {
          console.log('No partnerships available');
          setPartnerships([]);
        }
      }
    } catch (error) {
      console.error('Error fetching partnerships:', error);
      // Set empty partnerships on error
      setPartnerships([]);
    } finally {
      isFetchingRef.current = false;
      setPartnershipsLoaded(true);
      setLoading(false);
    }
  }, []); // Empty deps - function should be stable

  const calculateWeekEndsIn = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return '0d 0h';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${days}d ${hours}h`;
  };

  const handleInviteClick = async () => {
    // Check if user is authenticated
    const storedUserId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName') || localStorage.getItem('userNickname');

    if (!storedUserId || !userName) {
      // User not authenticated, redirect to welcome page
      router.push('/welcome');
      return;
    }

    // Update pairing status to 'awaiting_partner' immediately when button is clicked
    // This happens before share attempt, as we can't reliably know if share succeeded
    console.log('Updating pairing status to "awaiting_partner" on invite button click...');
    const statusUpdated = await updateUserPairingStatus(storedUserId, 'awaiting_partner');
    if (statusUpdated) {
      setPairingStatus('awaiting_partner');
      console.log('✅ Pairing status updated to "awaiting_partner"');
    } else {
      console.warn('⚠️ Failed to update pairing status, but continuing with share');
    }

    setIsSharing(true);
    try {
      const result = await shareInvite();

      if (!result.success) {
        // Show error message
        alert(result.error || 'Unable to share invite. Please try again.');
        setIsSharing(false);
        return;
      }

      if (result.usedNativeShare) {
        // Native share was successful, we're done
        setIsSharing(false);
        return;
      }

      // Native share not available or was cancelled, show fallback modal
      setShareModalLink(result.inviteLink);
      setShowShareModal(true);
      setIsSharing(false);
    } catch (error) {
      console.error('Error sharing invite:', error);
      alert('Unable to share invite. Please try again.');
      setIsSharing(false);
    }
  };

  useEffect(() => {
    const checkForUser = async () => {
      try {
        // Get user ID from localStorage (in production, use proper auth)
        const storedUserId = localStorage.getItem('userId');
        const userName = localStorage.getItem('userName');
        const userNickname = localStorage.getItem('userNickname');
        console.log('Homepage checking for userId:', storedUserId);
        console.log('Homepage checking for userName:', userName);
        console.log('Homepage checking for userNickname:', userNickname);
        console.log('All localStorage keys:', Object.keys(localStorage));

        // Check if we have complete onboarding data
        const hasCompleteUserData = storedUserId && (userName || userNickname);

        if (hasCompleteUserData) {
          console.log('User found, preloading all data before showing UI');
          setUserId(storedUserId);
          
          // Preload ALL data before showing UI with timeout
          try {
            await Promise.race([
              fetchPartnerships(storedUserId),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Partnership fetch timeout')), 5000)
              )
            ]);
            console.log('Partnerships loaded successfully');
          } catch (error) {
            console.error('Partnership fetch failed or timed out:', error);
            // Set empty partnerships and mark as loaded
            setPartnerships([]);
            setPartnershipsLoaded(true);
          }
          setLoading(false);
        } else {
          console.log('No complete user data found, redirecting to welcome');
          // Clear ALL user data to ensure clean state
          localStorage.removeItem('userId');
          localStorage.removeItem('userName');
          localStorage.removeItem('userNickname');
          localStorage.removeItem('userWeeklyTarget');
          localStorage.removeItem('userUsualSitLength');
          localStorage.removeItem('supabaseUserId');
          localStorage.removeItem('allUsers');
          localStorage.removeItem('pendingInviteCode');
          localStorage.removeItem('partnershipInviteCode');
          // Set loading to false and redirect to welcome page for onboarding
          setLoading(false);
          // Use router.push for better test compatibility (Playwright can detect it)
          router.push('/welcome');
          return; // Exit early to prevent further execution
        }
      } catch (error) {
        console.error('Error in homepage useEffect:', error);
        // Fallback: redirect to welcome page
        setLoading(false);
        router.push('/welcome');
      }
    };

    // Check immediately - no delay
    checkForUser();

    // Add focus event listener to refresh partnerships when returning from timer
    const handleFocus = () => {
      console.log('Homepage focused - refreshing partnerships in background');
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId && partnershipsLoaded && !isFetchingRef.current) {
        // Only refresh if partnerships were already loaded and not currently fetching
        fetchPartnerships(storedUserId);
      }
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [router, fetchPartnerships, partnershipsLoaded]);

  // If we have a userId AND partnerships are loaded, show the complete homepage
  if (userId && partnershipsLoaded) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Serenity+" width={24} height={24} className="w-6 h-6" />
            <span className="font-bold text-lg">Serenity+</span>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Main CTA - Sit Now Button */}
          <div className="flex justify-center items-center">
            <Link href="/timer">
              <div className="w-32 h-32 cursor-pointer hover:opacity-90 transition-opacity">
                <Image
                  src="/sit-now-button.jpg"
                  alt="Sit Now"
                  width={128}
                  height={128}
                  className="w-full h-full rounded-full"
                />
              </div>
            </Link>
          </div>

          {/* Partners Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="font-semibold mb-4 text-black">Partners summary</h2>
            {pairingStatus === 'paired' && partnerships.length > 0 ? (
              // User is paired - show partnership summary
              <div className="space-y-3">
                {partnerships.map((partnership) => (
                  <div key={partnership.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <span className="font-medium">{partnership.partner.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>
                        You {partnership.userSits}/{userWeeklyTarget} *{' '}
                        {partnership.partner.name} {partnership.partnerSits}/{partnership.partner.weeklyTarget}
                      </div>
                      <div>Week Ends In {calculateWeekEndsIn(partnership.currentWeekStart)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : pairingStatus === 'not_started' ? (
              // User hasn't started inviting - show invite button
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 mb-3">No partners yet</p>
                <button
                  onClick={handleInviteClick}
                  disabled={isSharing}
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSharing ? 'Preparing...' : 'Invite Partners'}
                </button>
              </div>
            ) : pairingStatus === 'awaiting_partner' ? (
              // User has invited but partner hasn't joined yet - show awaiting message
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 mb-3">Waiting for your partner to join...</p>
                <p className="text-xs text-gray-500">We'll let you know when they accept your invite</p>
              </div>
            ) : (
              // Fallback: Show based on partnerships (for backward compatibility)
              partnerships.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600 mb-3">No partners yet</p>
                  <button
                    onClick={handleInviteClick}
                    disabled={isSharing}
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSharing ? 'Preparing...' : 'Invite Partners'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {partnerships.map((partnership) => (
                    <div key={partnership.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        <span className="font-medium">{partnership.partner.name}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>
                          You {partnership.userSits}/{userWeeklyTarget} *{' '}
                          {partnership.partner.name} {partnership.partnerSits}/{partnership.partner.weeklyTarget}
                        </div>
                        <div>Week Ends In {calculateWeekEndsIn(partnership.currentWeekStart)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* Fallback Share Modal */}
        {showShareModal && (
          <FallbackShareModal
            inviteLink={shareModalLink}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </div>
    );
  }

  // Show loading while checking for user data
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no userId, redirect to welcome
  return null;
}
