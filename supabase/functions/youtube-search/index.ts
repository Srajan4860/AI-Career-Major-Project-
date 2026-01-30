// supabase/functions/youtube-search/index.ts
import { corsHeaders } from '../_shared/cors.ts'

console.log("YouTube search function initializing...");

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  try {
    const { query } = await req.json();
    if (!query) throw new Error("Search query is required.");

    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) throw new Error("YouTube API key is not set.");

    // Search for video tutorials related to the query
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)} tutorial&type=video&maxResults=6&key=${YOUTUBE_API_KEY}`;

    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`YouTube API Error: ${await response.text()}`);
    }
    const data = await response.json();

    // Format the results
    const videos = (data.items || []).map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));

    return new Response(JSON.stringify(videos), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("ERROR in YouTube function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})