/**
 * Authentication Client for Customer Portal
 * Handles secure customer login, signup, and session management
 */

import React from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface CustomerAuthData {
  id: string;
  email: string;
  name: string;
  phone?: string;
  created_at: string;
  project_ids: string[];
}

export interface AuthResponse {
  success: boolean;
  data?: CustomerAuthData;
  error?: string;
  needsVerification?: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  projectId?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

class AuthClient {
  /**
   * Sign up new customer with automatic project association
   */
  async signUp(signUpData: SignUpData): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            name: signUpData.name,
            phone: signUpData.phone || '',
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user && !data.session) {
        return { 
          success: true, 
          needsVerification: true,
          error: 'Please check your email for verification link'
        };
      }

      if (data.user && data.session) {
        // Create customer profile
        const customerData = await this.createCustomerProfile(data.user.id, signUpData);
        
        return {
          success: true,
          data: customerData
        };
      }

      return { success: false, error: 'Unexpected signup response' };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during signup' 
      };
    }
  }

  /**
   * Sign in existing customer
   */
  async signIn(signInData: SignInData): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user && data.session) {
        const customerData = await this.getCustomerProfile(data.user.id);
        
        return {
          success: true,
          data: customerData
        };
      }

      return { success: false, error: 'Invalid login credentials' };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during signin' 
      };
    }
  }

  /**
   * Sign out current customer
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during signout' 
      };
    }
  }

  /**
   * Get current session
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<CustomerAuthData | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return null;
      }

      return await this.getCustomerProfile(user.id);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during password reset' 
      };
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during password update' 
      };
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Private helper methods
  private async createCustomerProfile(userId: string, signUpData: SignUpData): Promise<CustomerAuthData> {
    // Split name into first and last name
    const nameParts = signUpData.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const { data, error } = await supabase
      .from('customer_profiles')
      .insert([
        {
          id: userId,
          email: signUpData.email,
          first_name: firstName,
          last_name: lastName,
          phone: signUpData.phone || '',
          project_ids: signUpData.projectId ? [signUpData.projectId] : [],
          communication_preferences: {
            email_notifications: true,
            sms_notifications: true,
            call_notifications: true
          },
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create customer profile: ${error.message}`);
    }

    // Return data in expected format
    return {
      id: data.id,
      email: data.email,
      name: `${data.first_name} ${data.last_name}`,
      phone: data.phone,
      created_at: data.created_at,
      project_ids: data.project_ids || []
    };
  }

  private async getCustomerProfile(userId: string): Promise<CustomerAuthData> {
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to get customer profile: ${error.message}`);
    }

    // Return data in expected format
    return {
      id: data.id,
      email: data.email,
      name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      phone: data.phone,
      created_at: data.created_at,
      project_ids: data.project_ids || []
    };
  }

  /**
   * Associate customer with a project
   */
  async associateWithProject(customerId: string, projectId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current profile
      const profile = await this.getCustomerProfile(customerId);
      
      // Add project ID if not already associated
      const updatedProjectIds = profile.project_ids.includes(projectId) 
        ? profile.project_ids 
        : [...profile.project_ids, projectId];

      const { error } = await supabase
        .from('customer_profiles')
        .update({ project_ids: updatedProjectIds })
        .eq('id', customerId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during project association' 
      };
    }
  }

  /**
   * Generate secure customer portal link
   */
  generateCustomerPortalLink(customerId: string, projectId: string): string {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com' 
      : 'http://localhost:3000';
    
    return `${baseUrl}/customer-portal?customer=${customerId}&project=${projectId}`;
  }
}

// Global auth client instance
export const authClient = new AuthClient();

// Custom hook for React components
export function useAuth() {
  const [user, setUser] = React.useState<CustomerAuthData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Get initial session
    authClient.getCurrentUser().then((userData) => {
      setUser(userData);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = authClient.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const userData = await authClient.getCurrentUser();
          setUser(userData);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
    signIn: authClient.signIn.bind(authClient),
    signUp: authClient.signUp.bind(authClient),
    signOut: authClient.signOut.bind(authClient),
    resetPassword: authClient.resetPassword.bind(authClient),
  };
}
