
// Meeting utilities
import { toast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import React from "react";

export async function createGoogleMeetLink(
  userId: string,
  accessToken: string,
  sessionData: {
    skill: string;
    day: string;
    time_slot: string;
    teacher_id: string;
    student_id: string;
  },
  teacherEmail: string,
  studentEmail: string,
  teacherName: string,
  studentName: string
): Promise<string | null> {
  try {
    const timeSlot = sessionData.time_slot || "";
    const startTime = timeSlot.includes(" - ") ? timeSlot.split(" - ")[0] : timeSlot;
    
    if (!sessionData.day) {
      console.error("No date information found in session:", sessionData);
      toast({
        title: "Error",
        description: "Session date information is missing. Please contact support.",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      });
      return null;
    }
    
    const dateString = sessionData.day;
    const timeString = startTime + ":00";
    
    console.log("Creating calendar event with:", {
      date: dateString,
      time: timeString
    });
    
    const start = new Date(`${dateString}T${timeString}`);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    
    const response = await fetch("https://rojydqsndhoielitdquu.functions.supabase.co/create-google-meet-link", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        access_token: accessToken,
        summary: `Learning Session: ${sessionData.skill}`,
        description: `Google Meet for your session with ${studentName}`,
        start: start.toISOString(),
        end: end.toISOString(),
        attendees: [
          { email: studentEmail || "" },
          { email: teacherEmail || "" }
        ].filter(a => a.email),
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google Meet creation error:", errorData);
      
      if (errorData.error_code === 'token_expired' || 
          errorData.details?.error?.message?.includes('invalid_grant') || 
          errorData.details?.error?.message?.includes('Invalid Credentials')) {
        toast({
          title: "Google Token Expired",
          description: "Your Google access token has expired. Please reconnect your Google account.",
          variant: "destructive",
          icon: <AlertCircle className="h-4 w-4 text-red-500" />
        });
      } else {
        toast({
          title: "Google Meet Error",
          description: errorData.error || "Could not create Google Meet link",
          variant: "destructive",
          icon: <AlertCircle className="h-4 w-4 text-red-500" />
        });
      }
      
      return null;
    }

    const meetData = await response.json();
    
    if (!meetData.meetLink) {
      console.error("No meet link in response:", meetData);
      toast({
        title: "Google Meet Error",
        description: "No meeting link was returned from Google",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      });
      return null;
    }

    return meetData.meetLink;
  } catch (error) {
    console.error("Error in createGoogleMeetLink:", error);
    toast({
      title: "Error",
      description: "Failed to create Google Meet link. Please try again.",
      variant: "destructive",
      icon: <AlertCircle className="h-4 w-4 text-red-500" />
    });
    return null;
  }
}
