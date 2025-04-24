
// Follow this setup guide to integrate the Deno runtime and use Edge Functions: https://docs.supabase.com/docs/guides/functions

import { serve } from "https://deno.land/std@0.132.0/http/server.ts";

interface GoogleMeetRequest {
  access_token: string;
  summary: string;
  description: string;
  start: string; // ISO datetime
  end: string; // ISO datetime
  attendees: Array<{ email: string }>;
}

interface GoogleMeetResponse {
  meetLink?: string;
  error?: string;
  error_code?: string;
  details?: any;
}

serve(async (req) => {
  try {
    // Log incoming request
    console.log("Google Meet creation request received");
    
    // CORS Headers
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
      "Content-Type": "application/json",
    };

    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, { headers, status: 204 });
    }

    // Validate request method
    if (req.method !== "POST") {
      console.log(`Error: Invalid method ${req.method}`);
      return new Response(
        JSON.stringify({ error: "Method not allowed", error_code: "method_not_allowed" }),
        { headers, status: 405 }
      );
    }

    // Parse request body
    let requestData: GoogleMeetRequest;
    try {
      requestData = await req.json();
      console.log("Request data received", {
        summary: requestData.summary,
        start: requestData.start,
        end: requestData.end,
        attendeesCount: requestData.attendees?.length || 0,
        hasAccessToken: !!requestData.access_token,
        tokenLength: requestData.access_token?.length || 0
      });
    } catch (error) {
      console.log("Error parsing request body:", error);
      return new Response(
        JSON.stringify({ error: "Invalid request body", error_code: "invalid_request" }),
        { headers, status: 400 }
      );
    }

    // Validate required fields
    if (!requestData.access_token) {
      console.log("Error: Missing access token");
      return new Response(
        JSON.stringify({ error: "Missing access token", error_code: "missing_token" }),
        { headers, status: 400 }
      );
    }

    if (!requestData.start || !requestData.end) {
      console.log("Error: Missing start or end time");
      return new Response(
        JSON.stringify({ error: "Missing start or end time", error_code: "missing_time" }),
        { headers, status: 400 }
      );
    }

    // Create Google Meet event
    const eventData = {
      summary: requestData.summary || "Learning Session",
      description: requestData.description || "Google Meet for your learning session",
      start: { dateTime: requestData.start },
      end: { dateTime: requestData.end },
      attendees: requestData.attendees || [],
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    console.log("Creating Google Calendar event with Meet link");
    
    try {
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${requestData.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Google Calendar API error:", JSON.stringify(errorData));
        
        // Check for specific error types
        const errorMessage = errorData.error?.message || "Unknown error";
        let errorCode = "google_api_error";
        
        if (errorMessage.includes("invalid_grant") || 
            errorMessage.includes("Invalid Credentials") ||
            response.status === 401) {
          errorCode = "token_expired";
        } else if (errorMessage.includes("insufficient permission")) {
          errorCode = "insufficient_permissions";
        }
        
        return new Response(
          JSON.stringify({ 
            error: `Google Calendar API error: ${errorMessage}`, 
            error_code: errorCode,
            details: errorData 
          }),
          { headers, status: 500 }
        );
      }

      const eventResult = await response.json();
      console.log("Event created successfully");
      
      // Extract the Google Meet link
      const meetLink = eventResult.hangoutLink || eventResult.conferenceData?.entryPoints?.find(
        (ep: any) => ep.entryPointType === "video"
      )?.uri;

      if (!meetLink) {
        console.log("No Meet link found in response:", JSON.stringify(eventResult));
        return new Response(
          JSON.stringify({ 
            error: "No Meet link found in response", 
            error_code: "no_meet_link",
            details: eventResult 
          }),
          { headers, status: 500 }
        );
      }

      console.log("Meet link generated:", meetLink);
      
      // Return the Google Meet link
      return new Response(
        JSON.stringify({ 
          meetLink, 
          eventId: eventResult.id,
          eventLink: eventResult.htmlLink
        }),
        { headers, status: 200 }
      );
    } catch (error) {
      console.error("Error creating Google Meet:", error);
      return new Response(
        JSON.stringify({ 
          error: `Failed to create Google Meet: ${error.message}`, 
          error_code: "request_error",
          details: { message: error.message, stack: error.stack }
        }),
        { headers, status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: `Unexpected error: ${error.message}`, 
        error_code: "unexpected_error",
        details: { message: error.message, stack: error.stack }
      }),
      { 
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }, 
        status: 500 
      }
    );
  }
});
