
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDebugNotifications = () => {
  const [debugResult, setDebugResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testNotificationCreation = async (userId: string) => {
    setLoading(true);
    try {
      console.log('[DEBUG] Testing notification creation for user:', userId);
      
      // Try to create a test notification
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Test Notification',
          description: 'This is a test notification to debug the system',
          type: 'debug',
          read: false
        })
        .select();
      
      if (error) {
        console.error('[DEBUG] Error creating test notification:', error);
        setDebugResult({
          success: false,
          error: error,
          message: 'Failed to create notification. This might be a Row-Level Security (RLS) issue.'
        });
        return false;
      }
      
      console.log('[DEBUG] Test notification created successfully:', data);
      setDebugResult({
        success: true,
        data: data,
        message: 'Successfully created test notification.'
      });
      return true;
    } catch (error) {
      console.error('[DEBUG] Unexpected error in test:', error);
      setDebugResult({
        success: false,
        error: error,
        message: 'Unexpected error during test.'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    testNotificationCreation,
    debugResult,
    loading
  };
};
