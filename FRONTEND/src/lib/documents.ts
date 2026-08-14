import { supabase } from "@/supabase";

export type StoredDocument = {
  id: string;
  name: string;
  type: string;
  size: number;
  status: string;
  analyzed: boolean;
  confidence?: number | null;
  summary?: string | null;
  extractedData?: Record<string, unknown> | null;
  valid?: boolean | null;
  validationMessage?: string | null;
  date: string;
  path: string;
};

async function authenticatedUserId(expectedId?: string) {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Please sign in before managing documents.");
  if (expectedId && expectedId !== data.user.id)
    throw new Error("This document does not belong to the signed-in user.");
  return data.user.id;
}

function mapDocument(row: Record<string, unknown>): StoredDocument {
  const confidence = row["ai_confidence"] as number | null | undefined;
  return {
    id: String(row["id"]),
    name: String(row["file_name"] ?? row["name"] ?? "Document"),
    type: String(row["document_type"] ?? row["type"] ?? "Other document"),
    size: Number(row["file_size"] ?? 0),
    status: String(row["status"] ?? "uploaded"),
    analyzed: Boolean(row["ai_analyzed"]),
    ...(confidence !== undefined ? { confidence } : {}),
    summary: (row["ai_summary"] as string | null | undefined) ?? null,
    extractedData: (row["extracted_data"] as Record<string, unknown> | null | undefined) ?? null,
    valid: (row["is_valid"] as boolean | null | undefined) ?? null,
    validationMessage: (row["validation_message"] as string | null | undefined) ?? null,
    date: new Date(String(row["uploaded_at"] ?? row["created_at"])).toLocaleDateString("en-IN"),
    path: String(row["file_path"] ?? row["storage_path"] ?? ""),
  };
}

export async function listDocuments(userId: string): Promise<StoredDocument[]> {
  const id = await authenticatedUserId(userId);
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", id)
    .order("uploaded_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data as unknown as Record<string, unknown>[]) || []).map((row) => mapDocument(row));
}

function safeFileName(name: string) {
  const cleaned = name
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/\.{2,}/g, ".")
    .replace(/^-+|-+$/g, "");
  return cleaned || "document";
}

export async function uploadDocument(userId: string, file: File) {
  const id = await authenticatedUserId(userId);
  if (!/^(application\/pdf|image\/(jpeg|png|webp))$/.test(file.type))
    throw new Error("Choose a PDF, JPG, PNG or WEBP file.");
  if (file.size > 10 * 1024 * 1024) throw new Error("That file is larger than 10 MB.");
  const path = `${id}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const upload = await supabase.storage
    .from("documents")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upload.error) throw new Error(upload.error.message);
  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: id,
      file_name: file.name,
      file_path: path,
      file_type: file.type,
      file_size: file.size,
      status: "uploaded",
      ai_analyzed: false,
    })
    .select("*")
    .single();
  if (error) {
    await supabase.storage.from("documents").remove([path]);
    throw new Error(error.message);
  }
  return mapDocument(data as Record<string, unknown>);
}

export async function deleteDocument(document: StoredDocument, userId: string) {
  const id = await authenticatedUserId(userId);
  if (document.path) {
    const removed = await supabase.storage.from("documents").remove([document.path]);
    if (removed.error) throw new Error(removed.error.message);
  }
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", document.id)
    .eq("user_id", id);
  if (error) throw new Error(error.message);
}

export async function createSignedDocumentUrl(document: StoredDocument, userId: string) {
  await authenticatedUserId(userId);
  if (!document.path) throw new Error("This document has no stored file path.");
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(document.path, 60);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function analyzeDocument(documentId: string) {
  const { data, error } = await supabase.functions.invoke("analyze-document", {
    body: { document_id: documentId },
  });
  if (error) {
    let detail: { error?: string; stage?: string } | null = null;
    try {
      if ("context" in error && error.context instanceof Response)
        detail = await error.context.clone().json();
    } catch {
      /* keep friendly fallback */
    }
    console.error("analyze-document failed", {
      message: error.message,
      stage: detail?.stage,
      detail: detail?.error,
    });
    throw new Error(
      detail?.stage
        ? `AI analysis failed at ${detail.stage}. Please retry this document.`
        : "AI analysis temporarily unavailable. Please retry this document.",
    );
  }
  if (!data?.success)
    throw new Error(
      data?.error || "AI analysis temporarily unavailable. Please retry this document.",
    );
  return data as { success: boolean; document_id: string };
}
