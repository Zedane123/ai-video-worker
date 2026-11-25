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

        let audioGenerated = false;
        let imageGenerated = false;
        let videoUrl = "";
        let audioUrl = "";
        const errors = [];

        if (caption && env.ai) {
          try {
            const ttsResponse = await env.ai.run("@cf/deepgram/aura-1", {
              text: caption,
            });
            if (ttsResponse) {
              audioGenerated = true;
            }
          } catch (err) {
            errors.push(`Audio AI Error: ${err.message}`);
          }
        }

        if (prompt && env.VIDEO_API_URL && env.API_KEY) {
          try {
            const videoRes = await fetch(env.VIDEO_API_URL, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${env.API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ prompt }),
            });

            if (videoRes.ok) {
              const videoData = await videoRes.json();
              videoUrl = videoData.videoUrl || videoData.url || "";
            } else {
              const errText = await videoRes.text();
              errors.push(`Video API (${videoRes.status}): ${errText.slice(0, 150)}`);
            }
          } catch (err) {
            errors.push(`Video API Error: ${err.message}`);
          }
        } else if (prompt && env.ai) {
          try {
            const imgResponse = await env.ai.run(
              "@cf/black-forest-labs/flux-1-schnell",
              { prompt }
            );
            if (imgResponse) {
              imageGenerated = true;
            }
          } catch (err) {
            errors.push(`Image AI Error: ${err.message}`);
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            receivedPrompt: prompt,
            receivedCaption: caption,
            audioGenerated,
            imageGenerated,
            videoUrl,
            audioUrl,
            errors,
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