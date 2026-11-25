export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method === "GET") {
      return new Response(
        JSON.stringify({
          status: "online",
          message: "AI Video Worker সফলভাবে চালু আছে!",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (request.method === "POST") {
      try {
        const body = await request.json();
        const prompt = (body.prompt || "").trim();
        const caption = (body.caption || "").trim();

        return new Response(
          JSON.stringify({
            success: true,
            receivedPrompt: prompt,
            receivedCaption: caption,
            videoUrl: "",
            audioUrl: "",
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  },
};
// updated