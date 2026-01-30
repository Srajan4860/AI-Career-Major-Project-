// supabase/functions/generate-project-ideas/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// This interface defines the expected JSON structure from Gemini
// We are telling it to expect a 'candidates' array
interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

serve(async (req) => {
  try {
    // 1. Get the user's data from the request
    const { career_field, skills } = await req.json()

    // 2. Securely get the Google API Key
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY')
    if (!GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is not set')
    }

    // 3. Create the prompt for the Gemini API
    const prompt = `
      You are an expert career planner. A user has the following profile:
      - Career Field: ${career_field}
      - Current Skills: ${skills}

      Please generate 3 unique and creative project ideas that would
      help this user build a portfolio for their career.

      Return the ideas ONLY as a valid JSON array like this:
      [
        {"title": "Project Title 1", "description": "Project description..."},
        {"title": "Project Title 2", "description": "Project description..."}
      ]
    `

    // 4. Set up the API call
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`
    
    const requestBody = {
      contents: [{
        parts: [{ "text": prompt }]
      }],
      // Add safety settings to reduce chances of being blocked
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ]
    }

    // 5. Call the Google Gemini API
    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      throw new Error(`Google API error: ${aiResponse.status} ${errorText}`)
    }

    const aiData: GeminiResponse = await aiResponse.json()

    // 6. Extract the JSON text from the complex response
    const jsonText = aiData.candidates[0].content.parts[0].text
    
    // The 'jsonText' is the JSON array we asked for.
    // We send it directly back to the app.
    return new Response(
      jsonText,
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Error in Edge Function:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})