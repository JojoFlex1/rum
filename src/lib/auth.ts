import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    avatar_url?: string;
    provider?: string;
  };
}

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/home`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Google sign in error:', error);
    throw error;
  }
};

// Sign in with Apple
export const signInWithApple = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/home`,
      }
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Apple sign in error:', error);
    throw error;
  }
};

// Sign in with email/password (fallback)
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Email sign in error:', error);
    throw error;
  }
};

// Sign up with email/password (fallback)
export const signUpWithEmail = async (email: string, password: string, firstName?: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName || '',
        },
      }
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Email sign up error:', error);
    throw error;
  }
};

// Magic link sign in (alternative to OTP)
export const signInWithMagicLink = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/home`,
      }
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Magic link error:', error);
    throw error;
  }
};

// Verify OTP code
export const verifyOTP = async (email: string, token: string) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    throw error;
  }
};

// Resend OTP verification code
export const resendOTP = async (email: string, type: 'signup' | 'magiclink' = 'signup') => {
  try {
    const { data, error } = await supabase.auth.resend({
      type,
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/home`,
      }
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    throw error;
  }
};

// Sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user as User | null;
  } catch (error: any) {
    console.error('Get current user error:', error);
    return null;
  }
};

// Update user profile
export const updateProfile = async (updates: { 
  first_name?: string; 
  last_name?: string;
  avatar_url?: string;
  full_name?: string;
}) => {
  try {
    const { error } = await supabase.auth.updateUser({
      data: updates
    });
    if (error) throw error;

    // Also update the users table
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email!,
          first_name: updates.first_name || updates.full_name?.split(' ')[0] || '',
          avatar_url: updates.avatar_url,
          updated_at: new Date().toISOString()
        });
      
      if (profileError) throw profileError;
    }
  } catch (error: any) {
    console.error('Update profile error:', error);
    throw error;
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session?.user?.email);
    callback(session?.user as User | null);
  });
};

// Check if user needs to complete profile
export const needsProfileCompletion = (user: User | null): boolean => {
  if (!user) return false;
  
  // Check if user has basic profile info
  const hasFirstName = user.user_metadata?.first_name || user.user_metadata?.full_name;
  
  return !hasFirstName;
};

// Get user's display name
export const getUserDisplayName = (user: User | null): string => {
  if (!user) return '';
  
  // Try different name fields
  if (user.user_metadata?.full_name) {
    return user.user_metadata.full_name;
  }
  
  if (user.user_metadata?.first_name) {
    const lastName = user.user_metadata?.last_name;
    return lastName ? `${user.user_metadata.first_name} ${lastName}` : user.user_metadata.first_name;
  }
  
  // Fallback to email username
  return user.email?.split('@')[0] || 'User';
};

// Get user's avatar URL
export const getUserAvatarUrl = (user: User | null): string | null => {
  if (!user) return null;
  
  return user.user_metadata?.avatar_url || null;
};

// Get authentication provider
export const getAuthProvider = (user: User | null): string => {
  if (!user) return 'unknown';
  
  return user.user_metadata?.provider || 'email';
};

// Demo bypass for development
export const signInDemo = async () => {
  // Create a mock user session for demo purposes
  const mockUser = {
    id: `demo_${Date.now()}`,
    email: 'demo@aurum.com',
    user_metadata: {
      first_name: 'Alex',
      full_name: 'Alex Demo',
      avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      provider: 'demo'
    }
  };
  
  // Store in localStorage for demo
  localStorage.setItem('demo_user', JSON.stringify(mockUser));
  localStorage.setItem('demo_session', 'true');
  
  return { data: { user: mockUser, session: { access_token: 'demo_token' } }, error: null };
};

// Check if demo session exists
export const getDemoUser = (): User | null => {
  try {
    const demoSession = localStorage.getItem('demo_session');
    const demoUser = localStorage.getItem('demo_user');
    
    if (demoSession === 'true' && demoUser) {
      return JSON.parse(demoUser) as User;
    }
    
    return null;
  } catch {
    return null;
  }
};

// Clear demo session
export const clearDemoSession = () => {
  localStorage.removeItem('demo_user');
  localStorage.removeItem('demo_session');
};