/**
 * Authentication state
 * Note: User type is from @supabase/supabase-js
 */
export interface AuthState {
  user: unknown | null;
  loading: boolean;
  isAdmin: boolean;
}
