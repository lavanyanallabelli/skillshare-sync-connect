
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { access_token, summary, description, start, end, attendees } = body;

    console.log("Received request to create Google Meet link with data:", {
      summary,
      start,
      end,
      attendeesCount: attendees?.length || 0,
      hasAccessToken: !!access_token,
      tokenPreview: access_token ? `${access_token.substring(0, 5)}...` : null
    });

    if (!access_token || !summary || !start || !end) {
      console.error("Missing required parameters:", {
        accessToken: !!access_token,
        summary: !!summary,
        start: !!start,
        end: !!end,
      });
      return new Response(
        JSON.stringify({ error: "Missing required parameters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Google Calendar event with Google Meet link
    console.log("Making request to Google Calendar API");
    const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary,
        description,
        start: { dateTime: start },
        end: { dateTime: end },
        attendees: attendees || [],
        conferenceData: {
          createRequest: {
            requestId: Math.random().toString(36).substring(2, 15),
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },
      }),
    });

    // Log response status
    console.log("Google Calendar API response status:", response.status);
    
    const eventData = await response.json();
    
    if (!response.ok) {
      console.error("Google Calendar API error:", eventData);
      return new Response(
        JSON.stringify({ 
          error: eventData.error?.message || "Failed to create event.",
          details: eventData.error || null
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract Meet link from event
    const meetLink = eventData.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === "video")?.uri;
    
    console.log("Successfully created event, meet link:", meetLink || "Not found");

    if (!meetLink) {
      console.error("No meet link found in response:", eventData);
      return new Response(
        JSON.stringify({ 
          error: "Google Meet link not found in event data.",
          eventData: eventData
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ meetLink }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
