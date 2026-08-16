import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
const maxFileSize = 10 * 1024 * 1024;

type Analysis = {
  documentType: string;
  readable: boolean;
  appearsValid: boolean | null;
  detectedName: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  state: string;
  district: string;
  importantFields: Record<string, string>;
  mismatches: string[];
  missingInformation: string[];
  confidence: number;
  summary: string;
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorText(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
function safeFailure(error: unknown, stage: string) {
  const actual = errorText(error);
  console.error(JSON.stringify({ function: "analyze-document", stage, error: actual }));
  const debug = Deno.env.get("DEBUG_ANALYSIS_ERRORS") === "true";
  return {
    message: debug ? actual : "AI analysis temporarily unavailable. Please retry this document.",
    stage,
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return response({ error: "Method not allowed" }, 405);

  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) return response({ error: "Authentication required" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") || "gemini-3.5-flash";
  if (!supabaseUrl || !anonKey || !GEMINI_API_KEY)
    return response({ error: "AI analysis is not configured" }, 503);

  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) return response({ error: "Authentication required" }, 401);
  const userId = authData.user.id;

  let documentId: string;
  try {
    documentId = String((await request.json()).document_id || "");
  } catch {
    return response({ error: "Invalid request" }, 400);
  }
  if (!/^[0-9a-f-]{36}$/i.test(documentId)) return response({ error: "Invalid document" }, 400);

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .eq("user_id", userId)
    .single();
  if (documentError || !document) {
    console.error(
      JSON.stringify({
        function: "analyze-document",
        stage: "document_lookup",
        error: documentError?.message || "not found",
      }),
    );
    return response({ success: false, error: "Document not found", stage: "document_lookup" }, 404);
  }
  const filePath = document.file_path as string | undefined;
  const fileType = document.file_type as string | undefined;
  const fileSize = Number(document.file_size || 0);
  if (!filePath || !fileType || !allowedTypes.has(fileType) || fileSize > maxFileSize)
    return response(
      { success: false, error: "Unsupported or oversized document", stage: "document_validation" },
      400,
    );

  const mark = async (values: Record<string, unknown>) => {
    const result = await supabase
      .from("documents")
      .update(values)
      .eq("id", documentId)
      .eq("user_id", userId);
    if (result.error) throw new Error(`Database update failed: ${result.error.message}`);
  };
  let stage = "status_analyzing";
  await mark({ status: "analyzing", validation_message: null });

  try {
    stage = "storage_download";
    const { data: file, error: downloadError } = await supabase.storage
      .from("documents")
      .download(filePath);
    if (downloadError || !file) throw new Error("Document could not be retrieved");
    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = "";
    for (let index = 0; index < bytes.length; index += 0x8000)
      binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    const base64 = btoa(binary);
    stage = "gemini_request";
    const prompt = `You are performing AI document analysis for SchemeAI. This is not legal authentication or official government verification. Analyze only visible document-level evidence. Say unable to determine when uncertain. Never return full Aadhaar, PAN, bank or other sensitive numbers; mask them. Return only valid JSON with this exact shape: {"documentType":"","readable":true,"appearsValid":null,"detectedName":"","documentNumber":"MASKED","issueDate":"","expiryDate":"","issuingAuthority":"","state":"","district":"","importantFields":{},"mismatches":[],"missingInformation":[],"confidence":0,"summary":""}. Use confidence from 0 to 1. In the summary use wording like 'appears valid based on the information visible' and clearly distinguish AI analysis from actual government verification.`;
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }, { inlineData: { mimeType: fileType, data: base64 } }],
            },
          ],
          generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
        }),
      },
    );
    if (!geminiResponse.ok) {
      const detail = await geminiResponse.text();
      throw new Error(`Gemini ${geminiResponse.status}: ${detail.slice(0, 500)}`);
    }
    stage = "gemini_response_parse";
    const payload = await geminiResponse.json();
    const text = payload.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("")
      .trim();
    if (!text) throw new Error("Empty AI result");
    const analysis = JSON.parse(
      text.replace(/^```json\s*/i, "").replace(/\s*```$/, ""),
    ) as Analysis;
    stage = "database_update";
    await mark({
      document_type: analysis.documentType || "Unknown",
      status: "analyzed",
      ai_analyzed: true,
      ai_confidence: Math.max(0, Math.min(1, Number(analysis.confidence) || 0)),
      ai_summary: analysis.summary || "AI analysis completed.",
      extracted_data: analysis,
      is_valid: analysis.appearsValid,
      validation_message: analysis.mismatches?.join("; ") || null,
      analyzed_at: new Date().toISOString(),
    });
    return response({ success: true, document_id: documentId });
  } catch (error) {
    const failure = safeFailure(error, stage);
    try {
      await mark({ status: "failed", ai_analyzed: false, validation_message: failure.message });
    } catch (markError) {
      console.error(
        JSON.stringify({
          function: "analyze-document",
          stage: "database_failure_update",
          error: errorText(markError),
        }),
      );
    }
    return response({ success: false, error: failure.message, stage }, 502);
  }
});
