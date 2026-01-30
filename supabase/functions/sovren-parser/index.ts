// supabase/functions/sovren-parser/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Function initializing with Affinda...");

// Affinda V3 API endpoint
const AFFINDA_API_ENDPOINT = "https://api.affinda.com/v3/documents"
const WORKSPACE_ID = "hflGNFHP"; // Replace with your CORRECT Workspace ID if different

Deno.serve(async (req) => {
  console.log("Request received.");

  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request.");
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("Attempting to parse request JSON...");
    const { filePath } = await req.json()
    if (!filePath) throw new Error("File path is required.")
    console.log(`File path received: ${filePath}`);

    console.log("Attempting to get Affinda API key...");
    const AFFINDA_API_KEY = Deno.env.get('AFFINDA_API_KEY')
    if (!AFFINDA_API_KEY) {
      console.error("CRITICAL: Affinda API key is NOT SET.");
      throw new Error("Affinda API key is not set.")
    }
    console.log("Successfully retrieved Affinda API key.");
    
    console.log("Creating Supabase admin client...");
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    console.log(`Downloading file from storage: ${filePath}`);
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('resumes')
      .download(filePath)
    if (downloadError) throw downloadError
    console.log("File downloaded successfully.");
    
    const fileBlob = fileData as Blob

    // Prepare request for Affinda V3 API
    const formData = new FormData()
    formData.append('file', fileBlob, filePath.split('/').pop())
    formData.append('workspace', WORKSPACE_ID)

    console.log("Calling Affinda API...");
    const affindaResponse = await fetch(AFFINDA_API_ENDPOINT, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${AFFINDA_API_KEY}`,
      },
      body: formData,
    })
    console.log(`Affinda response status: ${affindaResponse.status}`);

    if (!affindaResponse.ok) {
      throw new Error(`Affinda API Error: ${await affindaResponse.text()}`)
    }

    const parsedData = await affindaResponse.json()
    const affindaData = parsedData.data || {};
    console.log("Successfully parsed data from Affinda.");
    
    // Extract the data from Affinda's response structure
    const skills = (affindaData.skills || []).map((s: { name: string }) => s.name)
    const fullName = affindaData.name?.raw || ''
    const latestJobTitle = (affindaData.workExperience || []).length > 0 ? affindaData.workExperience[0].jobTitle : ''

    // Prepare the response object, including the default experience level
    const richResponse = {
        fullName: fullName,
        skills: skills.join(', '),
        latestJobTitle: latestJobTitle,
        experienceLevel: 'beginner' // Added default experience level
    }

    console.log("Sending successful response to client:", richResponse);
    return new Response(
      JSON.stringify(richResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error("ERROR in function execution:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})