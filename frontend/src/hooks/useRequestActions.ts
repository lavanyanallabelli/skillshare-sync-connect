import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createSessionNotification, createConnectionNotification } from "@/utils/notificationUtils";

export function useRequestActions() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleAcceptConnection = useCallback(async (connection: any, userData: any, setConnections: any) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_connections')
        .update({ status: 'accepted' })
        .eq('id', connection.id);

      if (error) throw error;

      setConnections(oldConnections =>
        oldConnections.map(c => (c.id === connection.id ? { ...c, status: 'accepted' } : c))
      );

      await createConnectionNotification(
        connection.requester_id,
        "accepted",
        `${userData.first_name} ${userData.last_name} accepted your connection request`
      );

      toast({
        title: "Connection Accepted",
        description: `You have accepted ${connection.requester_id}'s connection request.`,
      });
    } catch (error) {
      console.error("Error accepting connection:", error);
      toast({
        title: "Error",
        description: "Failed to accept connection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, toast]);

  const handleDeclineConnection = useCallback(async (connection: any, userData: any, setConnections: any) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_connections')
        .delete()
        .eq('id', connection.id);

      if (error) throw error;

      setConnections(oldConnections => oldConnections.filter(c => c.id !== connection.id));

      await createConnectionNotification(
        connection.requester_id,
        "declined",
        `${userData.first_name} ${userData.last_name} declined your connection request`
      );

      toast({
        title: "Connection Declined",
        description: `You have declined ${connection.requester_id}'s connection request.`,
      });
    } catch (error) {
      console.error("Error declining connection:", error);
      toast({
        title: "Error",
        description: "Failed to decline connection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, toast]);

  const handleAcceptSession = async (session: any) => {
    setLoading(true);
    try {
      const { data: teacherData, error: teacherError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', session.teacher_id)
        .single();

      if (teacherError) throw teacherError;
      const teacherName = `${teacherData?.first_name} ${teacherData?.last_name}`;

      const { data: studentData, error: studentError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', session.student_id)
        .single();

      if (studentError) throw studentError;
      const studentName = `${studentData?.first_name} ${studentData?.last_name}`;

      const { error } = await supabase
        .from('sessions')
        .update({ status: 'accepted' })
        .eq('id', session.id);

      if (error) throw error;

      const event = new CustomEvent('sessionAccepted', { detail: session });
      window.dispatchEvent(event);

      await createSessionNotification(
        session,
        "accept",
        studentName,
        teacherName
      );

      toast({
        title: "Session Accepted",
        description: `You have accepted the session request from ${studentName}.`,
      });
    } catch (error) {
      console.error("Error accepting session:", error);
      toast({
        title: "Error",
        description: "Failed to accept session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineSession = async (session: any) => {
    setLoading(true);
    try {
      const { data: teacherData, error: teacherError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', session.teacher_id)
        .single();

      if (teacherError) throw teacherError;
      const teacherName = `${teacherData?.first_name} ${teacherData?.last_name}`;

      const { data: studentData, error: studentError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', session.student_id)
        .single();

      if (studentError) throw studentError;
      const studentName = `${studentData?.first_name} ${studentData?.last_name}`;

      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', session.id);

      if (error) throw error;

      await createSessionNotification(
        session,
        "decline",
        studentName,
        teacherName
      );

      toast({
        title: "Session Declined",
        description: "You have declined the session request.",
      });
    } catch (error) {
      console.error("Error declining session:", error);
      toast({
        title: "Error",
        description: "Failed to decline session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleAcceptConnection,
    handleDeclineConnection,
    handleAcceptSession,
    handleDeclineSession,
  };
}
