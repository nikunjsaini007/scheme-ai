import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, FileText, Info, Loader2, Trash2, UploadCloud, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Nav } from "@/components/Nav";
import { requireAuth } from "@/components/AuthGuard";
import { getUser } from "@/lib/auth";
import {
  deleteDocument,
  analyzeDocument,
  listDocuments,
  uploadDocument,
  type StoredDocument,
} from "@/lib/documents";

export const Route = createFileRoute("/documents")({
  beforeLoad: requireAuth,
  component: Documents,
});
type Stage = "idle" | "uploading" | "uploaded" | "analyzing" | "complete" | "failed";

function Documents() {
  const user = getUser()!;
  const [docs, setDocs] = useState<StoredDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const refresh = () => {
    setLoading(true);
    void listDocuments(user.id)
      .then(setDocs)
      .catch((e) => setError(e instanceof Error ? e.message : "Unable to load documents."))
      .finally(() => setLoading(false));
  };
  useEffect(refresh, [user.id]);
  const chooseFile = (candidate?: File) => {
    if (!candidate) return;
    setError("");
    if (!/^(application\/pdf|image\/(jpeg|png|webp))$/.test(candidate.type))
      return setError("Choose a PDF, JPG, PNG or WEBP file.");
    if (candidate.size > 10 * 1024 * 1024) return setError("That file is larger than 10 MB.");
    setFile(candidate);
    setStage("idle");
  };
  const upload = async () => {
    if (!file) return;
    setError("");
    setStage("uploading");
    try {
      const stored = await uploadDocument(user.id, file);
      setStage("uploaded");
      refresh();
      setStage("analyzing");
      await analyzeDocument(stored.id);
      refresh();
      setStage("complete");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
      setStage("failed");
    }
  };
  const retry = async (documentId: string) => {
    setError("");
    setStage("analyzing");
    try {
      await analyzeDocument(documentId);
      refresh();
      setStage("complete");
    } catch (e) {
      refresh();
      setError(
        e instanceof Error
          ? e.message
          : "AI analysis temporarily unavailable. Please retry this document.",
      );
      setStage("failed");
    }
  };
  const remove = async (doc: StoredDocument) => {
    try {
      await deleteDocument(doc, user.id);
      setDocs((items) => items.filter((item) => item.id !== doc.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to delete this document.");
    }
  };
  const open = () => {
    setModal(true);
    setFile(null);
    setStage("idle");
    setError("");
  };
  return (
    <main className="min-h-screen bg-ivory text-ink">
      <Nav />
      <section className="edge py-28 md:py-36">
        <p className="eyebrow text-saffron">DOCUMENT CENTRE</p>
        <h1 className="display mt-3 text-5xl md:text-7xl">Your documents.</h1>
        <p className="mt-4 max-w-2xl text-ink/55">
          Upload your certificates and documents to keep them in your private vault. AI analysis can
          be connected to the uploaded records later; no analysis results are fabricated here.
        </p>
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-saffron/30 bg-saffron/10 p-4 text-sm">
          <Info className="mt-0.5 size-5 shrink-0 text-saffron" />
          <span>
            Your files are securely stored and can only be accessed by you through your
            authenticated account.
          </span>
        </div>
        <button
          onClick={open}
          className="mt-8 flex items-center gap-2 rounded-full bg-saffron px-5 py-3 text-sm font-semibold text-white"
        >
          <UploadCloud size={17} /> Upload Document
        </button>
        {error && !modal && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}
        <div className="mt-10 flex items-center justify-between">
          <h2 className="display text-3xl">
            My document vault <span className="text-saffron">{docs.length}</span>
          </h2>
        </div>
        {loading ? (
          <div className="mt-5 h-40 animate-pulse rounded-2xl bg-ink/5" />
        ) : docs.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-ink/20 bg-white/35 p-12 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-saffron/10 text-saffron">
              <FileText size={28} />
            </div>
            <h3 className="display mt-6 text-3xl">Your document vault is empty</h3>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink/55">
              Upload your certificates and documents to let SchemeAI store them securely for your
              future AI-assisted analysis.
            </p>
            <button
              onClick={open}
              className="mt-6 rounded-full bg-ink px-5 py-3 text-xs font-semibold tracking-widest text-ivory uppercase"
            >
              + Upload Document
            </button>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {docs.map((doc) => (
              <article
                key={doc.id}
                className="rounded-2xl border border-ink/10 bg-white/50 p-5 shadow-[0_18px_45px_-28px_rgba(17,17,17,.5)] transition hover:-translate-y-1 hover:border-saffron/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-saffron/10 p-3 text-saffron">
                      <FileText size={21} />
                    </div>
                    <div>
                      <b className="block break-all">{doc.name}</b>
                      <p className="text-sm text-ink/50">
                        {doc.type} · {(doc.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => void remove(doc)}
                    className="rounded-full p-2 text-ink/35 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-5 flex items-center justify-between text-xs">
                  <span
                    className={
                      doc.status === "analyzed"
                        ? "flex items-center gap-1 text-verified"
                        : doc.status === "failed"
                          ? "text-red-700"
                          : "text-saffron"
                    }
                  >
                    {doc.analyzed && <CheckCircle2 size={14} />}{" "}
                    {doc.analyzed ? "AI analyzed" : "AI analysis pending"}
                  </span>
                  <span className="text-ink/45">
                    {doc.status} · {doc.date}
                  </span>
                </div>
                {doc.summary && (
                  <div className="mt-4 rounded-xl bg-ivory p-4 text-sm">
                    <p className="eyebrow text-saffron">AI ANALYSIS</p>
                    <p className="mt-2 text-ink/70">{doc.summary}</p>
                    {doc.confidence != null && (
                      <p className="mt-2 text-xs text-ink/50">
                        Confidence: {Math.round(doc.confidence * 100)}%
                      </p>
                    )}
                    {doc.validationMessage && (
                      <p className="mt-2 text-xs text-saffron">{doc.validationMessage}</p>
                    )}
                  </div>
                )}
                {doc.status === "failed" && (
                  <button
                    onClick={() => void retry(doc.id)}
                    className="mt-4 rounded-full bg-ink px-4 py-2 text-xs text-ivory"
                  >
                    Retry analysis
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
      {modal && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-white/20 bg-ivory p-6 shadow-2xl md:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="eyebrow text-saffron">PRIVATE DOCUMENT VAULT</p>
                <h2 className="display mt-2 text-4xl">Upload document</h2>
              </div>
              <button onClick={() => setModal(false)} className="rounded-full p-2 hover:bg-ink/10">
                <X size={19} />
              </button>
            </div>
            {!file && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  chooseFile(e.dataTransfer.files[0]);
                }}
                className={`mt-7 grid min-h-56 place-items-center rounded-2xl border-2 border-dashed p-8 text-center transition ${dragging ? "border-saffron bg-saffron/10" : "border-ink/20 bg-white/40"}`}
              >
                <UploadCloud className="size-10 text-saffron" />
                <div>
                  <p className="font-medium">Drop your document here</p>
                  <p className="mt-1 text-sm text-ink/50">PDF, JPG, PNG, WEBP · Max 10MB</p>
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="mt-5 rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-ivory"
                  >
                    Choose File
                  </button>
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => chooseFile(e.target.files?.[0])}
                  />
                </div>
              </div>
            )}
            {file && (
              <div className="mt-7 rounded-2xl border border-saffron/30 bg-white/60 p-5 shadow-[0_20px_45px_-25px_rgba(245,100,50,.7)]">
                <div className="flex items-center gap-3">
                  <FileText className="text-saffron" />
                  <div className="min-w-0">
                    <b className="block truncate">{file.name}</b>
                    <span className="text-sm text-ink/50">
                      {(file.size / 1024 / 1024).toFixed(2)} MB · {file.type}
                    </span>
                  </div>
                </div>
                {stage === "uploading" && (
                  <div className="mt-6 flex items-center gap-2 text-sm text-saffron">
                    <Loader2 className="animate-spin" size={17} /> Uploading securely…
                  </div>
                )}
                {stage === "uploaded" && (
                  <p className="mt-6 flex items-center gap-2 text-sm text-verified">
                    <CheckCircle2 size={17} /> Uploaded ✓ · AI Analysis Pending
                  </p>
                )}
                {stage === "analyzing" && (
                  <div className="mt-6 flex items-center gap-2 text-sm text-saffron">
                    <Loader2 className="animate-spin" size={17} /> Analyzing with Antra…
                  </div>
                )}
                {stage === "complete" && (
                  <p className="mt-6 flex items-center gap-2 text-sm text-verified">
                    <CheckCircle2 size={17} /> Analysis complete ✓
                  </p>
                )}
                {stage === "failed" && <p className="mt-6 text-sm text-red-700">{error}</p>}
              </div>
            )}
            {error && stage !== "failed" && <p className="mt-4 text-sm text-red-700">{error}</p>}
            {file && stage === "idle" && (
              <button
                onClick={() => void upload()}
                className="mt-6 w-full rounded-full bg-saffron py-3.5 text-sm font-semibold text-white"
              >
                Upload Document
              </button>
            )}
            {stage === "uploaded" && (
              <button
                onClick={() => setModal(false)}
                className="mt-6 w-full rounded-full bg-ink py-3.5 text-sm text-ivory"
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
