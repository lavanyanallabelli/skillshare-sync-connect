
import { useState } from 'react';
import { sessionService } from '@/services/sessionService';
import { SessionRequest } from '@/models/Session';

export const useSessionRequest = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendSessionRequest = async (
    teacherId: string,
    studentId: string,
    skill: string,
    day: string,
    timeSlot: string
  ) => {
    setIsSubmitting(true);
    try {
      const request: SessionRequest = {
        teacherId,
        studentId,
        skill,
        day,
        timeSlot
      };
      
      const success = await sessionService.sendSessionRequest(request);
      return success;
    } catch (error) {
      console.error("Error in sendSessionRequest:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    sendSessionRequest,
    isSubmitting
  };
};
