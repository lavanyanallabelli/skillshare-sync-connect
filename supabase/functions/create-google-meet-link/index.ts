
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

    if (!access_token || !summary || !start || !end) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters." }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Create Google Calendar event with Google Meet link
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

    const eventData = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: eventData.error || "Failed to create event." }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Extract Meet link from event
    const meetLink = eventData.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === "video")?.uri;

    if (!meetLink) {
      return new Response(
        JSON.stringify({ error: "Google Meet link not found in event data." }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(JSON.stringify({ meetLink }), { headers: corsHeaders });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
