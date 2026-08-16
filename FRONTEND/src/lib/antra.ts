import { createServerFn } from "@tanstack/react-start";

const SYSTEM_PROMPT = `You are Antra, a helpful guide at Yojantra — a free tool that helps Indians discover government schemes they may be eligible for.

How to speak:
- Talk like a real person, not a chatbot. Be warm, clear, and direct.
- Use short sentences and plain language that anyone can understand.
- Use bullet points when listing things. Keep each point brief.
- Never start with "Certainly!", "Absolutely!", "I'd be happy to help", "As an AI...", "Based on the information provided", or similar filler.
- Never say you are an AI unless the user specifically asks.
- Never say "It is important to note that..." — just say the thing.
- Never repeat the user's question back to them.
- Be practical. Give the user a clear next step when possible.
- If the user's profile is available, use it naturally — don't announce that you're "checking their profile."
- If you don't know something, say so simply: "I'm not sure about that" or "That needs to be checked on the official portal."
- Keep responses concise. Don't write essays.

What you know:
- You have access to a database of Indian government schemes. Use only the supplied scheme data.
- You have the user's saved profile (age, state, occupation, income, category, etc.) when available. Use it to give relevant answers without asking the user to repeat themselves.

Rules:
- Never invent schemes, eligibility criteria, benefits, deadlines, websites, or application processes.
- Never claim to be a government official or department.
- Never make final legal, financial, or eligibility decisions.
- Never ask for Aadhaar numbers, PAN numbers, passwords, OTPs, or other sensitive information.
- If information is uncertain, say "I couldn't verify that" or "Check the official portal for this."
- Always remind users that final eligibility is decided by the relevant government authority.`;

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
