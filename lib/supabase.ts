import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if we have real Supabase credentials
const hasValidCredentials = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url_here' &&
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  supabaseAnonKey !== 'your_supabase_anon_key_here' &&
  supabaseAnonKey !== 'placeholder_anon_key' &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('supabase.co');

// Log configuration status for debugging
if (typeof window !== 'undefined') {
  console.log('Supabase Configuration:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlValid: supabaseUrl.startsWith('https://') && supabaseUrl.includes('supabase.co'),
    isConfigured: hasValidCredentials
  });
}

// Create Supabase client
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder_anon_key',
  {
    auth: {
      autoRefreshToken: hasValidCredentials,
      persistSession: hasValidCredentials,
      detectSessionInUrl: hasValidCredentials,
      flowType: 'pkce'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    global: {
      headers: {
        'X-Client-Info': 'ideatrium-web'
      }
    }
  }
);

// Helper function to get the current user
export const getCurrentUser = async () => {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not properly configured. Please check your environment variables.');
  }
  
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  if (!hasValidCredentials) {
    return false;
  }
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return hasValidCredentials;
};

// Helper function to test database connection
export const testDatabaseConnection = async () => {
  if (!hasValidCredentials) {
    throw new Error('Supabase credentials not configured');
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Test if we can query the ideas table
    const { data, error } = await supabase
      .from('ideas')
      .select('count(*)')
      .eq('user_id', user.id);

    if (error) {
      console.error('Database connection test failed:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};