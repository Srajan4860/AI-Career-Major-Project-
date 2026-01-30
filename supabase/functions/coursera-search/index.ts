// supabase/functions/coursera-search/index.ts
import { corsHeaders } from '../_shared/cors.ts'

console.log("Coursera search function initializing...");

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query } = await req.json();
    if (!query) {
        console.error("Missing query parameter.");
        throw new Error("Search query is required.");
    }
    console.log(`Received Coursera search query: "${query}"`);

    // Search the Coursera catalog. Includes partner logos and course info.
    // Fetches courses related to the query, limited to 6 results.
    const searchUrl = `https://www.coursera.org/api/rest/v1/courses?q=search&query=${encodeURIComponent(query)}&includes=partnerIds,photoUrl,description&fields=partnerIds,photoUrl,name,description,slug&limit=6`;

    console.log(`Calling Coursera API: ${searchUrl}`);
    const response = await fetch(searchUrl);
    console.log(`Coursera response status: ${response.status}`);

    if (!response.ok) {
      // Log the non-JSON response text for debugging
      const errorText = await response.text();
      console.error("Coursera API non-OK response:", errorText);
      throw new Error(`Coursera API Error: Status ${response.status}`);
    }

    // Check Content-Type before parsing JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text(); // Get the HTML/text
        console.error(`Coursera did not return JSON. Content-Type: ${contentType}. Response:`, responseText.substring(0, 500)); // Log first 500 chars
        throw new Error(`Coursera API returned non-JSON response (Content-Type: ${contentType})`);
    }

    // Now safe to parse JSON
    const data = await response.json();
    console.log("Successfully received JSON from Coursera.");

    // The API returns linked partner data separately, handle cases where it might be missing
    const partners = data.linked ? data.linked['partners.v1'] || [] : [];
    const partnerMap = new Map(partners.map((p: any) => [p.id, p.name]));

    // Format the results, handle potential missing fields
    const courses = (data.elements || []).map((item: any) => ({
      id: item.id || 'N/A', // Provide default if missing
      name: item.name || 'Untitled Course',
      // Find partner name using the map, default if not found or no partnerIds
      partner: item.partnerIds && item.partnerIds.length > 0 ? partnerMap.get(item.partnerIds[0]) || 'Coursera' : 'Coursera',
      photoUrl: item.photoUrl || '', // Use empty string if no photo
      description: item.description || 'No description available.',
      // Construct the course URL using the slug, handle missing slug
      url: item.slug ? `https://www.coursera.org/learn/${item.slug}` : 'https://www.coursera.org'
    }));

    console.log(`Found ${courses.length} Coursera courses for query "${query}"`);

    // Send the formatted course data back to the client
    return new Response(JSON.stringify(courses), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // Log the detailed error on the server
    console.error("ERROR in Coursera function:", error);
    // Send a user-friendly error message back to the client
    return new Response(JSON.stringify({ error: `Failed to fetch from Coursera: ${error.message}` }), {
      status: 500, // Internal Server Error status
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } // <-- This might be the missing brace around line 63 in your original code
}) // <-- This might be the missing parenthesis/brace