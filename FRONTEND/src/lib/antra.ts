import { createServerFn } from "@tanstack/react-start";

const SYSTEM_PROMPT = `You are Antra, the AI assistant of SchemeAI, an Indian government scheme discovery and benefits assistant.

Be friendly, concise, trustworthy and easy to understand. Never invent a government scheme, benefit, eligibility rule, deadline, website or application process. Treat the supplied SchemeAI database as the primary source of truth. If information is uncertain or unavailable, say so clearly.

You are not a government official or department. Do not make final legal, financial or government eligibility decisions. Protect privacy: never ask for Aadhaar numbers, PAN numbers, passwords, OTPs or other unnecessary sensitive information.

Help users understand available schemes, eligibility, benefits, required documents, application steps, missing documents and why a scheme matches. If asked which schemes a user qualifies for, use only the supplied profile and database results; never create eligibility results yourself. Always remind users that final eligibility is decided by the relevant authority. You are Antra — helpful, transparent and user-focused.`;

type ChatInput = {
  question: string;
  history?: { role: "user" | "model"; text: string }[];
  profile?: Record<string, string>;
  schemes?: { name: string; summary: string; benefit: string; category: string; match: number }[];
};

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  error?: { message?: string };
};

async function generate(
  prompt: string,
  json = false,
  media?: { base64: string; mimeType: string },
): Promise<string> {
  const key = process.env["GEMINI_API_KEY"];
  const model = process.env["GEMINI_MODEL"] || "gemini-3.5-flash";
  if (!key)
    throw new Error("Antra is not configured yet. Add GEMINI_API_KEY to the server environment.");
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              ...(media ? [{ inlineData: { mimeType: media.mimeType, data: media.base64 } }] : []),
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          ...(json ? { responseMimeType: "application/json" } : {}),
        },
      }),
    },
  );
  const payload = (await response.json()) as GeminiResponse;
  if (!response.ok)
    throw new Error(
      payload.error?.message || "Antra is temporarily unavailable. Please try again later.",
    );
  const text = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();
  if (!text) throw new Error("Antra returned an empty response. Please try again.");
  return text;
}

export const askAntra = createServerFn({ method: "POST" })
  .validator((input: ChatInput) => input)
  .handler(async ({ data }) => {
    const context = JSON.stringify({
      profile: data.profile || {},
      databaseMatches: data.schemes || [],
    });
    const history = (data.history || [])
      .slice(-8)
      .map((message) => `${message.role}: ${message.text}`)
      .join("\n");
    return generate(
      `${SYSTEM_PROMPT}\n\nTrusted SchemeAI context:\n${context}\n\nConversation:\n${history}\n\nuser: ${data.question}\n\nAnswer in plain language. Do not invent facts or matches.`,
    );
  });

export type DocumentAnalysis = {
  documentType: string;
  detectedName: string;
  issuingAuthority: string;
  state: string;
  issueDate: string;
  expiryDate: string;
  readability: "GOOD" | "FAIR" | "POOR";
  issues: string[];
  schemeRelevance: string[];
  confidence: number;
};

export const analyzeDocument = createServerFn({ method: "POST" })
  .validator(
    (input: { base64: string; mimeType: string; documentType?: string; schemes?: string[] }) =>
      input,
  )
  .handler(async ({ data }) => {
    const result = await generate(
      `${SYSTEM_PROMPT}\nYou are performing AI-assisted document analysis, not official authentication. Return only valid JSON matching this shape: {"documentType":"","detectedName":"","issuingAuthority":"","state":"","issueDate":"","expiryDate":"","readability":"GOOD|FAIR|POOR","issues":[],"schemeRelevance":[],"confidence":0}. Mask Aadhaar/PAN/document numbers; never return full sensitive numbers. Mention uncertainty in issues. The document category is ${data.documentType || "unknown"}. Relevant database schemes are ${JSON.stringify(data.schemes || [])}. Analyze this image/document.`,
      true,
      { base64: data.base64, mimeType: data.mimeType },
    );
    try {
      return JSON.parse(result) as DocumentAnalysis;
    } catch {
      throw new Error("Antra could not structure this document analysis. Please retry.");
    }
  });
