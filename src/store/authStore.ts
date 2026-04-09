import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
let authSubscription: { unsubscribe: () => void } | null = null;

const fetchProfile = async (userId: string) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return profile;
};

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        set({ user: session.user });
        
        const profile = await fetchProfile(session.user.id);
          
        if (profile) {
          set({ profile });
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      set({ isLoading: false });
    }

    // Listen for auth changes
    if (authSubscription) {
      authSubscription.unsubscribe();
    }

    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          set({ user: session.user });
          const profile = await fetchProfile(session.user.id);
          if (profile) set({ profile });
        } else {
          set({ user: null, profile: null });
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
      }
    });

    authSubscription = data.subscription;
  },
}));
