import { db } from '../../firebase-config';
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  weeklyTarget: number;
  usualSitLength: number;
  image?: string;
  inviteCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Partnership interface
export interface Partnership {
  id: string;
  userId: string;
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  partnerImage?: string;
  partnerWeeklyTarget: number;
  userSits: number;
  partnerSits: number;
  weeklyGoal: number;
  score: number;
  currentWeekStart: Date;
  createdAt: Date;
  updatedAt: Date;
}

// User operations
export const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    console.log('Creating user with data:', userData);
    console.log('Firebase db object:', db);
    
    const now = new Date();
    const userRef = await addDoc(collection(db, 'users'), {
      ...userData,
      createdAt: now,
      updatedAt: now
    });
    console.log('User created successfully with ID:', userRef.id);
    return userRef.id;
  } catch (error) {
    console.error('Error creating user:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    throw error;
  }
};

export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users: User[] = [];
    usersSnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() } as User);
    });
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Partnership operations
export const createPartnership = async (partnershipData: Omit<Partnership, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const now = new Date();
    const partnershipRef = await addDoc(collection(db, 'partnerships'), {
      ...partnershipData,
      createdAt: now,
      updatedAt: now
    });
    console.log('Partnership created with ID:', partnershipRef.id);
    return partnershipRef.id;
  } catch (error) {
    console.error('Error creating partnership:', error);
    throw error;
  }
};

export const getUserPartnerships = async (userId: string): Promise<Partnership[]> => {
  try {
    const partnershipsQuery = query(
      collection(db, 'partnerships'),
      where('userId', '==', userId)
    );
    const partnershipsSnapshot = await getDocs(partnershipsQuery);
    const partnerships: Partnership[] = [];
    partnershipsSnapshot.forEach((doc) => {
      partnerships.push({ id: doc.id, ...doc.data() } as Partnership);
    });
    return partnerships;
  } catch (error) {
    console.error('Error getting user partnerships:', error);
    return [];
  }
};

export const updatePartnership = async (partnershipId: string, updates: Partial<Partnership>): Promise<void> => {
  try {
    const partnershipRef = doc(db, 'partnerships', partnershipId);
    await updateDoc(partnershipRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating partnership:', error);
    throw error;
  }
};

// Helper function to create partnerships between users based on invite codes
export const createPartnershipsForUser = async (userId: string, inviteCode?: string): Promise<Partnership[]> => {
  try {
    console.log('Creating partnerships for user:', userId, 'with invite code:', inviteCode);
    
    const partnerships: Partnership[] = [];
    
    if (inviteCode) {
      // Find the user who created this invite code by checking localStorage for now
      // In a real app, this would be stored in Firebase
      const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
      const inviterUser = allUsers.find((user: { inviteCode?: string }) => user.inviteCode === inviteCode);
      
      if (inviterUser) {
        console.log(`Found inviter user: ${inviterUser.name} (${inviterUser.id})`);
        
        // Check if partnership already exists
        const existingPartnerships = await getUserPartnerships(userId);
        const alreadyExists = existingPartnerships.some(p => p.partnerId === inviterUser.id);
        
        if (!alreadyExists) {
          console.log(`Creating partnership with inviter: ${inviterUser.name}`);
          
          const partnershipData = {
            userId,
            partnerId: inviterUser.id,
            partnerName: inviterUser.name,
            partnerEmail: inviterUser.email,
            partnerImage: inviterUser.image,
            partnerWeeklyTarget: inviterUser.weeklyTarget,
            userSits: 0,
            partnerSits: 0,
            weeklyGoal: inviterUser.weeklyTarget,
            score: 0,
            currentWeekStart: new Date()
          };
          
          const partnershipId = await createPartnership(partnershipData);
          const newPartnership = { id: partnershipId, ...partnershipData } as Partnership;
          partnerships.push(newPartnership);
          
          console.log(`Partnership created with inviter: ${partnershipId}`);
        } else {
          console.log(`Partnership with inviter ${inviterUser.name} already exists`);
        }
      } else {
        console.log(`No inviter found for invite code: ${inviteCode}`);
      }
    } else {
      console.log('No invite code provided, no partnerships to create');
    }
    
    console.log('Final partnerships created:', partnerships);
    return partnerships;
  } catch (error) {
    console.error('Error creating partnerships for user:', error);
    return [];
  }
};
